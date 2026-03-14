const fs = require("fs");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");
const express = require("express");
const rateLimit = require("express-rate-limit");
const http = require("http");
const Database = require("better-sqlite3");
const { Server } = require("socket.io");
const Stripe = require("stripe");
const jwt = require("jsonwebtoken");
const { GoogleAuth } = require("google-auth-library");
const { z } = require("zod");

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

loadDotEnvFile(path.join(__dirname, "..", ".env"));

const PORT = Number(process.env.PORT || 4000);
const DB_PATH = process.env.DB_PATH || "./server/payments.db";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
const APPLE_IAP_BUNDLE_ID = process.env.APPLE_IAP_BUNDLE_ID || process.env.IOS_BUNDLE_ID || "";
const APPLE_IAP_ISSUER_ID = process.env.APPLE_IAP_ISSUER_ID || "";
const APPLE_IAP_KEY_ID = process.env.APPLE_IAP_KEY_ID || "";
const APPLE_IAP_PRIVATE_KEY = (process.env.APPLE_IAP_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const APPLE_IAP_ENV = (process.env.APPLE_IAP_ENV || "production").toLowerCase();
const GOOGLE_PLAY_PACKAGE_NAME =
  process.env.GOOGLE_PLAY_PACKAGE_NAME || process.env.ANDROID_PACKAGE_NAME || "";
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "";
const GOOGLE_SERVICE_ACCOUNT_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_FILE || "";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";
const APPLE_IAP_ENABLED =
  !!APPLE_IAP_BUNDLE_ID && !!APPLE_IAP_ISSUER_ID && !!APPLE_IAP_KEY_ID && !!APPLE_IAP_PRIVATE_KEY;
const GOOGLE_IAP_ENABLED =
  !!GOOGLE_PLAY_PACKAGE_NAME && (!!GOOGLE_SERVICE_ACCOUNT_JSON || !!GOOGLE_SERVICE_ACCOUNT_FILE);

const app = express();
app.use(
  cors({
    origin: true
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  stripe_customer_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  source TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS entitlements (
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  transaction_id TEXT,
  platform TEXT,
  expires_at INTEGER,
  raw_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(user_id, plan_id)
);

CREATE TABLE IF NOT EXISTS iap_receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  product_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE,
  purchase_token TEXT,
  status TEXT NOT NULL,
  raw_json TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS idempotency (
  id TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_json TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS provider_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS deletion_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  email TEXT,
  display_name TEXT,
  reason TEXT,
  status TEXT NOT NULL,
  requested_at INTEGER NOT NULL,
  resolved_at INTEGER,
  resolved_by TEXT,
  resolution_note TEXT
);
`);

const insertUserStmt = db.prepare(`
  INSERT OR IGNORE INTO users(id, created_at) VALUES (?, ?)
`);

const getUserStmt = db.prepare(`
  SELECT id, stripe_customer_id FROM users WHERE id = ?
`);

const updateUserStripeCustomerStmt = db.prepare(`
  UPDATE users SET stripe_customer_id = ? WHERE id = ?
`);

const insertOrderStmt = db.prepare(`
  INSERT INTO payment_orders(
    user_id, source, stripe_payment_intent_id, stripe_checkout_session_id,
    amount, currency, status, description, metadata_json, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateOrderByPaymentIntentStmt = db.prepare(`
  UPDATE payment_orders
  SET status = ?, updated_at = ?, metadata_json = ?
  WHERE stripe_payment_intent_id = ?
`);

const updateOrderByCheckoutSessionStmt = db.prepare(`
  UPDATE payment_orders
  SET status = ?, updated_at = ?, metadata_json = ?
  WHERE stripe_checkout_session_id = ?
`);

const upsertEntitlementStmt = db.prepare(`
  INSERT INTO entitlements(
    user_id, plan_id, source, status, transaction_id, platform,
    expires_at, raw_json, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(user_id, plan_id)
  DO UPDATE SET
    source = excluded.source,
    status = excluded.status,
    transaction_id = excluded.transaction_id,
    platform = excluded.platform,
    expires_at = excluded.expires_at,
    raw_json = excluded.raw_json,
    updated_at = excluded.updated_at
`);

const listEntitlementsStmt = db.prepare(`
  SELECT user_id, plan_id, source, status, transaction_id, platform, expires_at, updated_at
  FROM entitlements
  WHERE user_id = ?
`);

const insertIapReceiptStmt = db.prepare(`
  INSERT INTO iap_receipts(
    user_id, platform, product_id, transaction_id, purchase_token, status, raw_json, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertProviderEventStmt = db.prepare(`
  INSERT INTO provider_events(provider, event_id, event_type, payload_json, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

const listProviderEventsStmt = db.prepare(`
  SELECT id, provider, event_id, event_type, created_at
  FROM provider_events
  ORDER BY id DESC
  LIMIT ?
`);

const insertDeletionRequestStmt = db.prepare(`
  INSERT INTO deletion_requests(
    user_id, email, display_name, reason, status, requested_at
  ) VALUES (?, ?, ?, ?, ?, ?)
`);

const listDeletionRequestsStmt = db.prepare(`
  SELECT id, user_id, email, display_name, reason, status, requested_at, resolved_at, resolved_by, resolution_note
  FROM deletion_requests
  ORDER BY id DESC
  LIMIT ?
`);

const getDeletionRequestStmt = db.prepare(`
  SELECT id, user_id, email, display_name, reason, status, requested_at, resolved_at, resolved_by, resolution_note
  FROM deletion_requests
  WHERE id = ?
`);

const updateDeletionRequestStmt = db.prepare(`
  UPDATE deletion_requests
  SET status = ?, resolved_at = ?, resolved_by = ?, resolution_note = ?
  WHERE id = ?
`);

const deleteUserOrdersStmt = db.prepare(`
  DELETE FROM payment_orders WHERE user_id = ?
`);

const deleteUserEntitlementsStmt = db.prepare(`
  DELETE FROM entitlements WHERE user_id = ?
`);

const deleteUserReceiptsStmt = db.prepare(`
  DELETE FROM iap_receipts WHERE user_id = ?
`);

const deleteUserRecordStmt = db.prepare(`
  DELETE FROM users WHERE id = ?
`);

const getIdempotencyStmt = db.prepare(`
  SELECT request_hash, response_json, status_code FROM idempotency WHERE id = ? AND endpoint = ?
`);

const insertIdempotencyStmt = db.prepare(`
  INSERT INTO idempotency(id, endpoint, request_hash, response_json, status_code, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const listRecentOrdersStmt = db.prepare(`
  SELECT id, source, amount, currency, status, description, created_at, updated_at
  FROM payment_orders
  WHERE user_id = ?
  ORDER BY id DESC
  LIMIT ?
`);

const listPendingStripeOrdersStmt = db.prepare(`
  SELECT id, source, stripe_payment_intent_id, stripe_checkout_session_id, status
  FROM payment_orders
  WHERE user_id = ?
    AND source IN ('stripe_payment_intent', 'stripe_checkout_session')
    AND status IN ('created', 'pending')
  ORDER BY id DESC
  LIMIT 50
`);

const paymentIntentRequestSchema = z.object({
  amount: z.number().int().min(50).max(5_000_000),
  currency: z.string().min(3).max(8).default("usd"),
  description: z.string().min(1).max(300).default("Philly Tours checkout"),
  metadata: z.record(z.string(), z.string()).optional(),
  idempotencyKey: z.string().min(8).max(128).optional()
});

const checkoutSessionRequestSchema = z.object({
  amount: z.number().int().min(50).max(5_000_000),
  title: z.string().min(1).max(200),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  idempotencyKey: z.string().min(8).max(128).optional()
});

const iapVerifySchema = z.object({
  platform: z.enum(["ios", "android"]),
  planId: z.enum(["plus", "pro"]),
  productId: z.string().min(1),
  transactionId: z.string().min(1),
  purchaseToken: z.string().optional(),
  receiptData: z.string().optional()
}).superRefine((value, ctx) => {
  if (value.platform === "android" && !value.purchaseToken) {
    ctx.addIssue({
      code: "custom",
      path: ["purchaseToken"],
      message: "purchaseToken is required for Android verification."
    });
  }
});

const deletionRequestSchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().min(1).max(120).optional(),
  reason: z.string().min(1).max(500).optional()
});

const roomMembers = new Map();

let googleAuthClientPromise = null;

function now() {
  return Date.now();
}

function jsonHash(input) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function getUserId(req) {
  const headerUserId = req.header("x-user-id");
  if (headerUserId && headerUserId.trim()) {
    return headerUserId.trim();
  }
  return "demo-user";
}

function requireAdmin(req, res) {
  if (!ADMIN_API_KEY) {
    res.status(503).json({ error: "Admin deletion API is not configured." });
    return null;
  }
  const providedKey = req.header("x-admin-key");
  if (!providedKey || providedKey !== ADMIN_API_KEY) {
    res.status(403).json({ error: "Admin access denied." });
    return null;
  }
  return req.header("x-admin-user") || "admin";
}

function purgeUserData(userId) {
  const transaction = db.transaction((id) => {
    deleteUserOrdersStmt.run(id);
    deleteUserEntitlementsStmt.run(id);
    deleteUserReceiptsStmt.run(id);
    deleteUserRecordStmt.run(id);
  });
  transaction(userId);
}

function toEpochMs(input) {
  if (input == null) {
    return null;
  }
  const numeric = Number(input);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  if (numeric > 10_000_000_000) {
    return numeric;
  }
  return numeric * 1000;
}

function decodeJwtPayload(jwtToken) {
  const parts = String(jwtToken || "").split(".");
  if (parts.length < 2) {
    throw new Error("Invalid JWT payload format.");
  }
  const payload = Buffer.from(parts[1], "base64url").toString("utf8");
  return JSON.parse(payload);
}

function buildAppleApiToken() {
  if (!APPLE_IAP_ENABLED) {
    throw new Error("Apple IAP credentials are not configured.");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: APPLE_IAP_ISSUER_ID,
      iat: nowSeconds,
      exp: nowSeconds + 5 * 60,
      aud: "appstoreconnect-v1",
      bid: APPLE_IAP_BUNDLE_ID
    },
    APPLE_IAP_PRIVATE_KEY,
    {
      algorithm: "ES256",
      keyid: APPLE_IAP_KEY_ID
    }
  );
}

async function verifyApplePurchase({ transactionId, productId }) {
  const host =
    APPLE_IAP_ENV === "sandbox"
      ? "https://api.storekit-sandbox.itunes.apple.com"
      : "https://api.storekit.itunes.apple.com";
  const token = buildAppleApiToken();
  const response = await fetch(`${host}/inApps/v1/transactions/${encodeURIComponent(transactionId)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Apple verification failed (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const signedTransactionInfo = json.signedTransactionInfo;
  if (!signedTransactionInfo) {
    throw new Error("Apple response missing signedTransactionInfo.");
  }

  const payload = decodeJwtPayload(signedTransactionInfo);
  if (String(payload.bundleId || "") !== APPLE_IAP_BUNDLE_ID) {
    throw new Error("Apple bundleId mismatch.");
  }

  if (String(payload.productId || "") !== String(productId || "")) {
    throw new Error("Apple productId mismatch.");
  }

  if (payload.revocationDate) {
    return {
      active: false,
      status: "revoked",
      platform: "ios",
      expiresAt: null,
      raw: { response: json, payload }
    };
  }

  const expiresAt = toEpochMs(payload.expiresDate);
  const isExpired = !!expiresAt && expiresAt <= Date.now();
  return {
    active: !isExpired,
    status: isExpired ? "expired" : "verified",
    platform: "ios",
    expiresAt,
    raw: { response: json, payload }
  };
}

async function getGoogleAuthClient() {
  if (googleAuthClientPromise) {
    return googleAuthClientPromise;
  }

  const credentials = GOOGLE_SERVICE_ACCOUNT_JSON ? JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON) : undefined;
  const auth = new GoogleAuth({
    credentials,
    keyFilename: GOOGLE_SERVICE_ACCOUNT_FILE || undefined,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"]
  });
  googleAuthClientPromise = auth.getClient();
  return googleAuthClientPromise;
}

async function fetchGoogleEndpoint(url) {
  const client = await getGoogleAuthClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;
  if (!accessToken) {
    throw new Error("Unable to acquire Google access token.");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`Google verification failed (${response.status}): ${text}`);
  }
  return json;
}

async function verifyGooglePurchase({ productId, purchaseToken }) {
  if (!purchaseToken) {
    throw new Error("Google purchaseToken is required.");
  }

  const base = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";
  const packageName = encodeURIComponent(GOOGLE_PLAY_PACKAGE_NAME);
  const encodedProductId = encodeURIComponent(productId);
  const encodedToken = encodeURIComponent(purchaseToken);

  try {
    const productJson = await fetchGoogleEndpoint(
      `${base}/${packageName}/purchases/products/${encodedProductId}/tokens/${encodedToken}`
    );

    const purchaseState = Number(productJson.purchaseState ?? -1);
    const isPurchased = purchaseState === 0;
    return {
      active: isPurchased,
      status: isPurchased ? "verified" : "invalid",
      platform: "android",
      expiresAt: null,
      raw: { response: productJson, type: "products" }
    };
  } catch (error) {
    const subsJson = await fetchGoogleEndpoint(
      `${base}/${packageName}/purchases/subscriptionsv2/tokens/${encodedToken}`
    );
    const lineItem = Array.isArray(subsJson.lineItems) ? subsJson.lineItems[0] : null;
    const expiryTime = lineItem?.expiryTime || null;
    const expiresAt = expiryTime ? Date.parse(expiryTime) : null;
    const subscriptionState = String(subsJson.subscriptionState || "");
    const activeStates = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"]);
    const isActive = activeStates.has(subscriptionState) && (!expiresAt || expiresAt > Date.now());
    return {
      active: isActive,
      status: isActive ? "verified" : "expired",
      platform: "android",
      expiresAt,
      raw: { response: subsJson, type: "subscriptionsv2", fallbackError: String(error.message || error) }
    };
  }
}

async function verifyIapPurchaseWithStore(body) {
  if (body.platform === "ios") {
    return verifyApplePurchase({
      transactionId: body.transactionId,
      productId: body.productId
    });
  }

  return verifyGooglePurchase({
    productId: body.productId,
    purchaseToken: body.purchaseToken || ""
  });
}

function ensureUser(userId) {
  insertUserStmt.run(userId, now());
}

function getOrCreateStripeCustomer(userId) {
  const existing = getUserStmt.get(userId);
  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  return null;
}

function requireStripe(res) {
  if (stripe) {
    return true;
  }

  res.status(500).json({
    error: "Stripe is not configured. Set STRIPE_SECRET_KEY before starting the server."
  });
  return false;
}

function handleIdempotency(req, res, endpoint, requestBody) {
  const headerKey = req.header("idempotency-key");
  const bodyKey = requestBody.idempotencyKey;
  const key = (headerKey || bodyKey || "").trim();
  if (!key) {
    return { hit: false, key: null, requestHash: null };
  }

  const requestHash = jsonHash(requestBody);
  const existing = getIdempotencyStmt.get(key, endpoint);
  if (!existing) {
    return { hit: false, key, requestHash };
  }

  if (existing.request_hash !== requestHash) {
    res.status(409).json({
      error: "Idempotency key was reused with a different payload."
    });
    return { hit: true, key: null, requestHash: null };
  }

  res.status(existing.status_code).json(JSON.parse(existing.response_json));
  return { hit: true, key, requestHash };
}

function storeIdempotencyRecord(key, endpoint, requestHash, responseBody, statusCode) {
  if (!key || !requestHash) {
    return;
  }

  insertIdempotencyStmt.run(
    key,
    endpoint,
    requestHash,
    JSON.stringify(responseBody),
    statusCode,
    now()
  );
}

function normalizeIntentStatus(intentStatus) {
  const value = String(intentStatus || "");
  if (value === "succeeded") {
    return "succeeded";
  }
  if (value === "canceled") {
    return "canceled";
  }
  if (value === "requires_payment_method") {
    return "failed";
  }
  return "pending";
}

function normalizeCheckoutStatus(session) {
  const paymentStatus = String(session?.payment_status || "");
  const status = String(session?.status || "");
  if (paymentStatus === "paid") {
    return "succeeded";
  }
  if (status === "expired") {
    return "expired";
  }
  if (status === "complete" && paymentStatus === "unpaid") {
    return "failed";
  }
  return "pending";
}

async function refreshPendingStripeOrders(userId) {
  if (!stripe) {
    return;
  }

  const pending = listPendingStripeOrdersStmt.all(userId);
  if (!pending.length) {
    return;
  }

  const updatedAt = now();
  for (const order of pending) {
    try {
      if (order.source === "stripe_checkout_session" && order.stripe_checkout_session_id) {
        const session = await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);
        const nextStatus = normalizeCheckoutStatus(session);
        if (nextStatus !== order.status) {
          updateOrderByCheckoutSessionStmt.run(
            nextStatus,
            updatedAt,
            JSON.stringify(session),
            order.stripe_checkout_session_id
          );
        }
        continue;
      }

      if (order.source === "stripe_payment_intent" && order.stripe_payment_intent_id) {
        const intent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        const nextStatus = normalizeIntentStatus(intent.status);
        if (nextStatus !== order.status) {
          updateOrderByPaymentIntentStmt.run(
            nextStatus,
            updatedAt,
            JSON.stringify(intent),
            order.stripe_payment_intent_id
          );
        }
      }
    } catch (error) {
      console.warn("Stripe order refresh failed", {
        orderId: order.id,
        source: order.source,
        message: error.message || String(error)
      });
    }
  }
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api", apiLimiter);

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!requireStripe(res)) {
    return;
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    res.status(500).json({ error: "Missing STRIPE_WEBHOOK_SECRET configuration." });
    return;
  }

  const signature = req.header("stripe-signature");
  if (!signature) {
    res.status(400).json({ error: "Missing stripe-signature header." });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    res.status(400).json({ error: `Invalid webhook signature: ${error.message}` });
    return;
  }

  try {
    insertProviderEventStmt.run("stripe", event.id, event.type, JSON.stringify(event), now());
  } catch (error) {
    if (String(error.message || "").includes("UNIQUE")) {
      res.json({ received: true, duplicate: true });
      return;
    }
    throw error;
  }

  const object = event.data?.object || {};
  const updatedAt = now();

  if (event.type === "payment_intent.succeeded") {
    updateOrderByPaymentIntentStmt.run("succeeded", updatedAt, JSON.stringify(object), object.id || "");
  } else if (event.type === "payment_intent.payment_failed") {
    updateOrderByPaymentIntentStmt.run("failed", updatedAt, JSON.stringify(object), object.id || "");
  } else if (event.type === "checkout.session.completed") {
    updateOrderByCheckoutSessionStmt.run("succeeded", updatedAt, JSON.stringify(object), object.id || "");
  } else if (event.type === "checkout.session.expired") {
    updateOrderByCheckoutSessionStmt.run("expired", updatedAt, JSON.stringify(object), object.id || "");
  }

  res.json({ received: true });
});

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_, res) => {
  res.json({ ok: true, stripeConfigured: !!stripe });
});

app.get("/api/config/status", (_, res) => {
  const productionMode = process.env.NODE_ENV === "production";
  res.json({
    ok: true,
    mode: productionMode ? "production" : "development",
    stripeConfigured: !!stripe,
    appleIapConfigured: APPLE_IAP_ENABLED,
    appleIapEnv: APPLE_IAP_ENV,
    appleBundleId: APPLE_IAP_BUNDLE_ID || null,
    googleIapConfigured: GOOGLE_IAP_ENABLED,
    googlePackageName: GOOGLE_PLAY_PACKAGE_NAME || null
  });
});

app.post("/api/payments/intent", async (req, res) => {
  if (!requireStripe(res)) {
    return;
  }

  const parsed = paymentIntentRequestSchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid request body." });
    return;
  }

  const body = parsed.data;
  const idem = handleIdempotency(req, res, "payments_intent", body);
  if (idem.hit) {
    return;
  }

  const userId = getUserId(req);
  ensureUser(userId);

  let customerId = getOrCreateStripeCustomer(userId);
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        metadata: { userId }
      });
      customerId = customer.id;
      updateUserStripeCustomerStmt.run(customerId, userId);
    } catch (error) {
      res.status(500).json({ error: error.message || "Unable to create Stripe customer." });
      return;
    }
  }

  try {
    const intent = await stripe.paymentIntents.create(
      {
        amount: body.amount,
        currency: body.currency.toLowerCase(),
        customer: customerId,
        description: body.description,
        automatic_payment_methods: { enabled: true },
        metadata: {
          source: "mobile_checkout",
          userId,
          ...(body.metadata || {})
        }
      },
      idem.key ? { idempotencyKey: idem.key } : undefined
    );

    insertOrderStmt.run(
      userId,
      "stripe_payment_intent",
      intent.id,
      null,
      body.amount,
      body.currency.toLowerCase(),
      "created",
      body.description,
      JSON.stringify(body.metadata || {}),
      now(),
      now()
    );

    const responseBody = { clientSecret: intent.client_secret, paymentIntentId: intent.id };
    storeIdempotencyRecord(idem.key, "payments_intent", idem.requestHash, responseBody, 200);
    res.json(responseBody);
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to create payment intent." });
  }
});

app.post("/api/payments/checkout-session", async (req, res) => {
  if (!requireStripe(res)) {
    return;
  }

  const parsed = checkoutSessionRequestSchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid request body." });
    return;
  }

  const body = parsed.data;
  const idem = handleIdempotency(req, res, "checkout_session", body);
  if (idem.hit) {
    return;
  }

  const userId = getUserId(req);
  ensureUser(userId);

  let customerId = getOrCreateStripeCustomer(userId);
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        metadata: { userId }
      });
      customerId = customer.id;
      updateUserStripeCustomerStmt.run(customerId, userId);
    } catch (error) {
      res.status(500).json({ error: error.message || "Unable to create Stripe customer." });
      return;
    }
  }

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer: customerId,
        success_url: body.successUrl,
        cancel_url: body.cancelUrl,
        metadata: {
          source: "hosted_checkout",
          userId
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              product_data: {
                name: body.title
              },
              unit_amount: body.amount
            }
          }
        ]
      },
      idem.key ? { idempotencyKey: idem.key } : undefined
    );

    insertOrderStmt.run(
      userId,
      "stripe_checkout_session",
      null,
      session.id,
      body.amount,
      "usd",
      "created",
      body.title,
      JSON.stringify({}),
      now(),
      now()
    );

    const responseBody = { url: session.url, checkoutSessionId: session.id };
    storeIdempotencyRecord(idem.key, "checkout_session", idem.requestHash, responseBody, 200);
    res.json(responseBody);
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to create checkout session." });
  }
});

app.post("/api/iap/verify", async (req, res) => {
  const parsed = iapVerifySchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid request body." });
    return;
  }

  const body = parsed.data;
  const userId = getUserId(req);
  ensureUser(userId);

  const purchaseRaw = JSON.stringify({
    ...body,
    receivedAt: now()
  });

  const productionMode = process.env.NODE_ENV === "production";
  const providerReady =
    (body.platform === "ios" && APPLE_IAP_ENABLED) || (body.platform === "android" && GOOGLE_IAP_ENABLED);

  if (productionMode && !providerReady) {
    res.status(500).json({
      error:
        body.platform === "ios"
          ? "Apple IAP credentials are missing. Configure APPLE_IAP_BUNDLE_ID, APPLE_IAP_ISSUER_ID, APPLE_IAP_KEY_ID, APPLE_IAP_PRIVATE_KEY."
          : "Google IAP credentials are missing. Configure GOOGLE_PLAY_PACKAGE_NAME and GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_FILE."
    });
    return;
  }

  let verificationStatus = "verified_dev";
  let isActive = true;
  let expiresAt = null;
  let verificationRaw = { mode: "dev_local" };

  if (providerReady) {
    try {
      const verified = await verifyIapPurchaseWithStore(body);
      verificationStatus = verified.status;
      isActive = verified.active;
      expiresAt = verified.expiresAt;
      verificationRaw = verified.raw;
    } catch (error) {
      verificationStatus = productionMode ? "verification_failed" : "verified_dev";
      isActive = !productionMode;
      verificationRaw = {
        mode: productionMode ? "provider_error" : "dev_fallback",
        error: error.message || String(error)
      };
      if (productionMode) {
        res.status(502).json({ error: error.message || "Store verification failed." });
        return;
      }
    }
  }

  const storedRaw = JSON.stringify({
    request: body,
    verification: verificationRaw,
    receivedAt: now()
  });

  try {
    insertIapReceiptStmt.run(
      userId,
      body.platform,
      body.productId,
      body.transactionId,
      body.purchaseToken || null,
      verificationStatus,
      storedRaw,
      now()
    );
  } catch (error) {
    if (!String(error.message || "").includes("UNIQUE")) {
      res.status(500).json({ error: error.message || "Unable to record receipt." });
      return;
    }
  }

  if (isActive) {
    upsertEntitlementStmt.run(
      userId,
      body.planId,
      "iap",
      "active",
      body.transactionId,
      body.platform,
      expiresAt,
      storedRaw,
      now(),
      now()
    );
  } else {
    upsertEntitlementStmt.run(
      userId,
      body.planId,
      "iap",
      verificationStatus,
      body.transactionId,
      body.platform,
      expiresAt,
      storedRaw,
      now(),
      now()
    );
  }

  res.json({
    status: verificationStatus,
    userId,
    planId: body.planId,
    active: isActive,
    expiresAt
  });
});

app.get("/api/entitlements", (req, res) => {
  const userId = getUserId(req);
  ensureUser(userId);
  const rows = listEntitlementsStmt.all(userId);
  res.json({ userId, entitlements: rows });
});

app.get("/api/orders", async (req, res) => {
  const userId = getUserId(req);
  ensureUser(userId);
  await refreshPendingStripeOrders(userId);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const orders = listRecentOrdersStmt.all(userId, limit);
  res.json({ userId, orders });
});

app.get("/api/provider-events", (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const events = listProviderEventsStmt.all(limit);
  res.json({ events });
});

app.post("/api/privacy/delete-request", express.json(), (req, res) => {
  const parseResult = deletionRequestSchema.safeParse(req.body || {});
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.issues[0]?.message || "Invalid deletion request." });
    return;
  }

  const userId = getUserId(req);
  const body = parseResult.data;
  ensureUser(userId);
  const requestedAt = now();
  const result = insertDeletionRequestStmt.run(
    userId,
    body.email || null,
    body.displayName || null,
    body.reason || null,
    "requested",
    requestedAt
  );

  res.status(201).json({
    ok: true,
    requestId: result.lastInsertRowid,
    userId,
    status: "requested",
    requestedAt
  });
});

app.get("/api/admin/delete-requests", (req, res) => {
  const adminUser = requireAdmin(req, res);
  if (!adminUser) {
    return;
  }
  const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
  const requests = listDeletionRequestsStmt.all(limit);
  res.json({ ok: true, adminUser, requests });
});

app.post("/api/admin/delete-requests/:id/fulfill", express.json(), (req, res) => {
  const adminUser = requireAdmin(req, res);
  if (!adminUser) {
    return;
  }

  const requestId = Number(req.params.id);
  if (!Number.isInteger(requestId) || requestId <= 0) {
    res.status(400).json({ error: "Invalid deletion request id." });
    return;
  }

  const requestRecord = getDeletionRequestStmt.get(requestId);
  if (!requestRecord) {
    res.status(404).json({ error: "Deletion request not found." });
    return;
  }

  if (requestRecord.status === "fulfilled") {
    res.json({ ok: true, requestId, userId: requestRecord.user_id, status: "fulfilled" });
    return;
  }

  const resolvedAt = now();
  purgeUserData(requestRecord.user_id);
  updateDeletionRequestStmt.run("fulfilled", resolvedAt, adminUser, "User data purged", requestId);

  res.json({
    ok: true,
    requestId,
    userId: requestRecord.user_id,
    status: "fulfilled",
    resolvedAt,
    resolvedBy: adminUser
  });
});

function broadcastRoomMembers(sessionId) {
  const members = Array.from(roomMembers.get(sessionId) || []);
  io.to(sessionId).emit("roomMembers", { sessionId, members });
}

io.on("connection", (socket) => {
  socket.on("joinSession", ({ sessionId, senderId }) => {
    if (!sessionId || !senderId) {
      return;
    }

    socket.data.sessionId = sessionId;
    socket.data.senderId = senderId;
    socket.join(sessionId);

    if (!roomMembers.has(sessionId)) {
      roomMembers.set(sessionId, new Set());
    }

    roomMembers.get(sessionId).add(senderId);
    broadcastRoomMembers(sessionId);
  });

  socket.on("leaveSession", ({ sessionId, senderId }) => {
    if (!sessionId || !senderId) {
      return;
    }

    socket.leave(sessionId);
    if (!roomMembers.has(sessionId)) {
      return;
    }

    roomMembers.get(sessionId).delete(senderId);
    if (roomMembers.get(sessionId).size === 0) {
      roomMembers.delete(sessionId);
      return;
    }

    broadcastRoomMembers(sessionId);
  });

  socket.on("syncEvent", (payload) => {
    if (!payload?.sessionId) {
      return;
    }
    socket.to(payload.sessionId).emit("syncEvent", payload);
  });

  socket.on("disconnect", () => {
    const sessionId = socket.data.sessionId;
    const senderId = socket.data.senderId;
    if (!sessionId || !senderId || !roomMembers.has(sessionId)) {
      return;
    }

    roomMembers.get(sessionId).delete(senderId);
    if (roomMembers.get(sessionId).size === 0) {
      roomMembers.delete(sessionId);
    } else {
      broadcastRoomMembers(sessionId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Sync and payments server running on http://localhost:${PORT}`);
  console.log(`SQLite DB: ${DB_PATH}`);
});
