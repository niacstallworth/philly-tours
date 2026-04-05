const fs = require("fs");
const path = require("path");
const cors = require("cors");
const crypto = require("crypto");
const express = require("express");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Pool } = require("pg");
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

loadDotEnvFile(path.join(__dirname, "..", "server.local.env"));
loadDotEnvFile(path.join(__dirname, "..", ".env.server.local"));
loadDotEnvFile(path.join(__dirname, "..", ".env.server"));
loadDotEnvFile(path.join(__dirname, "..", ".env"));

const PORT = Number(process.env.PORT || 4000);
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
const AUTH_JWT_SECRET =
  process.env.AUTH_JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-local-auth-secret");
const LEGACY_ADMIN_API_KEY_ENABLED =
  process.env.ALLOW_LEGACY_ADMIN_API_KEY === "true" && process.env.NODE_ENV !== "production";
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
const BUILDER_ADMIN_ACCOUNTS_JSON = process.env.BUILDER_ADMIN_ACCOUNTS_JSON || "";
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || "";
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || "";
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const APPLE_IAP_ENABLED =
  !!APPLE_IAP_BUNDLE_ID && !!APPLE_IAP_ISSUER_ID && !!APPLE_IAP_KEY_ID && !!APPLE_IAP_PRIVATE_KEY;
const GOOGLE_IAP_ENABLED =
  !!GOOGLE_PLAY_PACKAGE_NAME && (!!GOOGLE_SERVICE_ACCOUNT_JSON || !!GOOGLE_SERVICE_ACCOUNT_FILE);
const CLOUDFLARE_TURNSTILE_SECRET_KEY = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const NEWSLETTER_FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL || "Philly Tours <newsletter@philly-tours.com>";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function toUserId(email) {
  return normalizeEmail(email).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "demo-user";
}

function parseBuilderAdminAccounts() {
  if (!BUILDER_ADMIN_ACCOUNTS_JSON.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(BUILDER_ADMIN_ACCOUNTS_JSON);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((entry) => {
        const email = normalizeEmail(entry?.email);
        const passwordHash = String(entry?.passwordHash || "").trim();
        const displayName = String(entry?.displayName || email || "Builder").trim();
        const roles = Array.isArray(entry?.roles)
          ? entry.roles.filter((role) => role === "builder" || role === "admin")
          : [];
        if (!email || !passwordHash || roles.length === 0) {
          return null;
        }
        return { email, passwordHash, displayName, roles };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn("Failed to parse BUILDER_ADMIN_ACCOUNTS_JSON", error);
    return [];
  }
}

const builderAdminAccounts = parseBuilderAdminAccounts();

const app = express();
app.set("trust proxy", 1);
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

function inferSupabaseProjectRef() {
  const match = SUPABASE_URL.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i);
  return match ? match[1] : "";
}

function createPool() {
  if (SUPABASE_DB_URL) {
    return new Pool({
      connectionString: SUPABASE_DB_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  const projectRef = inferSupabaseProjectRef();
  if (projectRef && SUPABASE_DB_PASSWORD) {
    return new Pool({
      host: `db.${projectRef}.supabase.co`,
      port: 5432,
      database: "postgres",
      user: "postgres",
      password: SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });
  }
  throw new Error("Supabase Postgres is not configured. Set SUPABASE_DB_URL or EXPO_PUBLIC_SUPABASE_URL with SUPABASE_DB_PASSWORD.");
}

const db = createPool();

async function dbQuery(text, params = []) {
  return db.query(text, params);
}

async function ensureSchema() {
  await dbQuery(`
    create table if not exists public.users (
      id text primary key,
      stripe_customer_id text,
      email text,
      display_name text,
      auth_provider text,
      created_at bigint not null,
      updated_at bigint,
      last_seen_at bigint
    );
    create table if not exists public.payment_orders (
      id bigint generated by default as identity primary key,
      user_id text not null,
      source text not null,
      stripe_payment_intent_id text,
      stripe_checkout_session_id text,
      amount integer not null,
      currency text not null,
      status text not null,
      description text,
      metadata_json text,
      created_at bigint not null,
      updated_at bigint not null
    );
    create table if not exists public.entitlements (
      user_id text not null,
      plan_id text not null,
      source text not null,
      status text not null,
      transaction_id text,
      platform text,
      expires_at bigint,
      raw_json text,
      created_at bigint not null,
      updated_at bigint not null,
      primary key(user_id, plan_id)
    );
    create table if not exists public.iap_receipts (
      id bigint generated by default as identity primary key,
      user_id text not null,
      platform text not null,
      product_id text not null,
      transaction_id text not null unique,
      purchase_token text,
      status text not null,
      raw_json text,
      created_at bigint not null
    );
    create table if not exists public.idempotency (
      id text primary key,
      endpoint text not null,
      request_hash text not null,
      response_json text not null,
      status_code integer not null,
      created_at bigint not null
    );
    create table if not exists public.provider_events (
      id bigint generated by default as identity primary key,
      provider text not null,
      event_id text not null unique,
      event_type text not null,
      payload_json text not null,
      created_at bigint not null
    );
    create table if not exists public.deletion_requests (
      id bigint generated by default as identity primary key,
      user_id text not null,
      email text,
      display_name text,
      reason text,
      status text not null,
      requested_at bigint not null,
      resolved_at bigint,
      resolved_by text,
      resolution_note text
    );
    create table if not exists public.newsletter_subscribers (
      email text primary key,
      source text not null,
      status text not null default 'active',
      subscribed_at bigint not null,
      updated_at bigint not null,
      metadata_json text
    );
  `);
  await dbQuery(`
    alter table public.users add column if not exists email text;
    alter table public.users add column if not exists display_name text;
    alter table public.users add column if not exists auth_provider text;
    alter table public.users add column if not exists updated_at bigint;
    alter table public.users add column if not exists last_seen_at bigint;
    create unique index if not exists users_email_idx
      on public.users (email)
      where email is not null;
  `);
}

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
  planId: z.string().min(1).max(120).optional(),
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

const newsletterSubscribeSchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().min(1).max(120).optional(),
  source: z.string().min(1).max(120).default("profile_settings")
});

const authSessionRequestSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(120).optional(),
  mode: z.enum(["tourist", "builder"]),
  password: z.string().min(1).max(256).optional(),
  turnstileToken: z.string().min(1).max(4096).optional()
}).superRefine((value, ctx) => {
  if (value.mode === "builder" && !value.password?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["password"],
      message: "Builder sign-in requires a password."
    });
  }
});

const oauthSessionRequestSchema = z.object({
  accessToken: z.string().min(1).max(4096),
  provider: z.enum(["google", "apple"]).optional()
});

const roomMembers = new Map();

let googleAuthClientPromise = null;

function now() {
  return Date.now();
}

function defaultDisplayNameFromEmail(email) {
  const localPart = String(email || "").split("@")[0] || "Guest";
  const normalized = localPart.replace(/[._-]+/g, " ").trim();
  if (!normalized) {
    return "Guest";
  }
  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .slice(0, 120);
}

function jsonHash(input) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function authConfigured() {
  return !!AUTH_JWT_SECRET;
}

function supabaseAuthConfigured() {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}

async function sendNewsletterConfirmationEmail({ email, displayName }) {
  if (!RESEND_API_KEY.trim()) {
    throw new Error("Newsletter email delivery is not configured. Set RESEND_API_KEY on the sync server.");
  }

  const name = String(displayName || "").trim() || defaultDisplayNameFromEmail(email);
  const html = [
    `<div style="font-family: Arial, sans-serif; color: #0b2035; line-height: 1.5;">`,
    `<h2 style="margin-bottom: 12px;">You're subscribed to Philly Tours updates</h2>`,
    `<p>Hi ${name},</p>`,
    `<p>You have successfully subscribed to the Philly Tours newsletter.</p>`,
    `<p>We'll send tour drops, launch updates, and Founders news to <strong>${email}</strong>.</p>`,
    `<p style="margin-top: 24px;">Thanks for riding with us,<br />Philly Tours by Founders</p>`,
    `</div>`
  ].join("");

  const text = [
    `Hi ${name},`,
    ``,
    `You have successfully subscribed to the Philly Tours newsletter.`,
    `We'll send tour drops, launch updates, and Founders news to ${email}.`,
    ``,
    `Thanks for riding with us,`,
    `Philly Tours by Founders`
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: NEWSLETTER_FROM_EMAIL,
      to: [email],
      subject: "You are successfully subscribed to Philly Tours updates",
      html,
      text
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Confirmation email delivery failed.");
  }
  return payload;
}

function hasRole(actor, role) {
  return Array.isArray(actor?.roles) && actor.roles.includes(role);
}

function turnstileConfigured() {
  return !!CLOUDFLARE_TURNSTILE_SECRET_KEY;
}

async function fetchSupabaseUserProfile(accessToken) {
  if (!supabaseAuthConfigured()) {
    throw new Error("Supabase Auth is not configured.");
  }

  const response = await fetch(`${SUPABASE_URL.replace(/\/+$/, "")}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || payload.error || "Unable to verify Supabase session.");
  }

  return payload;
}

function buildSessionForVerifiedEmail(email, fallbackDisplayName = "") {
  const normalizedEmail = normalizeEmail(email);
  const account = builderAdminAccounts.find((entry) => entry.email === normalizedEmail);

  if (account) {
    return {
      userId: toUserId(normalizedEmail),
      email: normalizedEmail,
      displayName: account.displayName || fallbackDisplayName || defaultDisplayNameFromEmail(normalizedEmail),
      mode: "builder",
      roles: account.roles
    };
  }

  return {
    userId: toUserId(normalizedEmail),
    email: normalizedEmail,
    displayName: fallbackDisplayName || defaultDisplayNameFromEmail(normalizedEmail),
    mode: "tourist",
    roles: ["tourist"]
  };
}

async function verifyTurnstileToken(token, remoteIp) {
  if (!turnstileConfigured()) {
    return { ok: true, skipped: true };
  }

  if (!token?.trim()) {
    return { ok: false, error: "Complete the Cloudflare security check before signing in." };
  }

  const body = new URLSearchParams({
    secret: CLOUDFLARE_TURNSTILE_SECRET_KEY,
    response: token.trim()
  });
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) {
    const code = Array.isArray(payload["error-codes"]) ? payload["error-codes"][0] : null;
    return { ok: false, error: code ? `Cloudflare verification failed (${code}).` : "Cloudflare verification failed." };
  }

  return { ok: true, skipped: false };
}

function timingSafeEqualHex(aHex, bHex) {
  try {
    const a = Buffer.from(aHex, "hex");
    const b = Buffer.from(bHex, "hex");
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function verifyPasswordHash(password, encodedHash) {
  const [algorithm, saltHex, derivedKeyHex] = String(encodedHash || "").split("$");
  if (algorithm !== "scrypt" || !saltHex || !derivedKeyHex) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  return timingSafeEqualHex(derivedKey.toString("hex"), derivedKeyHex);
}

function signAuthToken(session) {
  if (!AUTH_JWT_SECRET) {
    throw new Error("AUTH_JWT_SECRET is not configured.");
  }
  return jwt.sign(
    {
      sub: session.userId,
      email: session.email,
      displayName: session.displayName,
      mode: session.mode,
      roles: session.roles
    },
    AUTH_JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "12h"
    }
  );
}

function decodeAuthToken(token) {
  if (!AUTH_JWT_SECRET) {
    throw new Error("AUTH_JWT_SECRET is not configured.");
  }
  return jwt.verify(token, AUTH_JWT_SECRET, { algorithms: ["HS256"] });
}

function getBearerToken(req) {
  const header = req.header("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function getAuthenticatedActor(req) {
  const bearerToken = getBearerToken(req);
  if (!bearerToken) {
    return null;
  }
  try {
    const payload = decodeAuthToken(bearerToken);
    return {
      userId: String(payload.sub || "").trim() || "demo-user",
      email: normalizeEmail(payload.email),
      displayName: String(payload.displayName || "").trim(),
      mode: payload.mode === "builder" ? "builder" : "tourist",
      roles: Array.isArray(payload.roles) ? payload.roles.filter(Boolean) : []
    };
  } catch {
    return null;
  }
}

function getUserId(req) {
  const actor = getAuthenticatedActor(req);
  if (actor?.userId) {
    return actor.userId;
  }
  const headerUserId = req.header("x-user-id");
  if (headerUserId && headerUserId.trim()) {
    return headerUserId.trim();
  }
  return "demo-user";
}

function requireRoles(req, res, roles) {
  const actor = getAuthenticatedActor(req);
  if (actor && roles.some((role) => hasRole(actor, role))) {
    return actor;
  }

  if (LEGACY_ADMIN_API_KEY_ENABLED && roles.includes("admin") && ADMIN_API_KEY) {
    const providedKey = req.header("x-admin-key");
    if (providedKey && providedKey === ADMIN_API_KEY) {
      return {
        userId: "legacy-admin",
        email: normalizeEmail(req.header("x-admin-user") || "admin@local"),
        displayName: req.header("x-admin-user") || "admin",
        mode: "builder",
        roles: ["admin"]
      };
    }
  }

  if (!authConfigured()) {
    res.status(503).json({ error: "Server auth is not configured." });
    return null;
  }

  res.status(401).json({ error: "Authorized session required." });
  return null;
}

async function purgeUserData(userId) {
  const client = await db.connect();
  try {
    await client.query("begin");
    await client.query("delete from public.payment_orders where user_id = $1", [userId]);
    await client.query("delete from public.entitlements where user_id = $1", [userId]);
    await client.query("delete from public.iap_receipts where user_id = $1", [userId]);
    await client.query("delete from public.users where id = $1", [userId]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
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

async function ensureUser(input) {
  const actor = typeof input === "string" ? { userId: input } : input || {};
  const userId = String(actor.userId || "").trim() || "demo-user";
  const email = actor.email ? normalizeEmail(actor.email) : null;
  const displayName = actor.displayName ? String(actor.displayName).trim().slice(0, 120) : null;
  const authProvider = actor.authProvider ? String(actor.authProvider).trim().slice(0, 40) : null;
  const timestamp = now();
  await dbQuery(
    `insert into public.users(id, email, display_name, auth_provider, created_at, updated_at, last_seen_at)
     values ($1, $2, $3, $4, $5, $5, $5)
     on conflict (id) do update
       set email = coalesce(excluded.email, public.users.email),
           display_name = coalesce(excluded.display_name, public.users.display_name),
           auth_provider = coalesce(excluded.auth_provider, public.users.auth_provider),
           updated_at = excluded.updated_at,
           last_seen_at = excluded.last_seen_at`,
    [userId, email, displayName, authProvider, timestamp]
  );
}

async function getOrCreateStripeCustomer(userId) {
  const { rows } = await dbQuery(
    `select id, stripe_customer_id
     from public.users
     where id = $1`,
    [userId]
  );
  return rows[0]?.stripe_customer_id || null;
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

async function handleIdempotency(req, res, endpoint, requestBody) {
  const headerKey = req.header("idempotency-key");
  const bodyKey = requestBody.idempotencyKey;
  const key = (headerKey || bodyKey || "").trim();
  if (!key) {
    return { hit: false, key: null, requestHash: null };
  }

  const requestHash = jsonHash(requestBody);
  const { rows } = await dbQuery(
    `select request_hash, response_json, status_code
     from public.idempotency
     where id = $1 and endpoint = $2`,
    [key, endpoint]
  );
  const existing = rows[0];
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

async function storeIdempotencyRecord(key, endpoint, requestHash, responseBody, statusCode) {
  if (!key || !requestHash) {
    return;
  }

  await dbQuery(
    `insert into public.idempotency(id, endpoint, request_hash, response_json, status_code, created_at)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (id) do update set
       endpoint = excluded.endpoint,
       request_hash = excluded.request_hash,
       response_json = excluded.response_json,
       status_code = excluded.status_code,
       created_at = excluded.created_at`,
    [key, endpoint, requestHash, JSON.stringify(responseBody), statusCode, now()]
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

async function upsertStripeCheckoutEntitlementFromSession(session) {
  const planId = String(session?.metadata?.planId || "").trim();
  const userId = String(session?.metadata?.userId || "").trim();
  if (!planId || !userId) {
    return;
  }

  await dbQuery(
    `insert into public.entitlements(
       user_id, plan_id, source, status, transaction_id, platform, expires_at, raw_json, created_at, updated_at
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     on conflict (user_id, plan_id)
     do update set
       source = excluded.source,
       status = excluded.status,
       transaction_id = excluded.transaction_id,
       platform = excluded.platform,
       expires_at = excluded.expires_at,
       raw_json = excluded.raw_json,
       updated_at = excluded.updated_at`,
    [userId, planId, "stripe_checkout", "active", session.id || null, "stripe", null, JSON.stringify(session), now(), now()]
  );
}

async function refreshPendingStripeOrders(userId) {
  if (!stripe) {
    return;
  }

  const { rows: pending } = await dbQuery(
    `select id, source, stripe_payment_intent_id, stripe_checkout_session_id, status
     from public.payment_orders
     where user_id = $1
       and source in ('stripe_payment_intent', 'stripe_checkout_session')
       and status in ('created', 'pending')
     order by id desc
     limit 50`,
    [userId]
  );
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
          await dbQuery(
            `update public.payment_orders
             set status = $1, updated_at = $2, metadata_json = $3
             where stripe_checkout_session_id = $4`,
            [nextStatus, updatedAt, JSON.stringify(session), order.stripe_checkout_session_id]
          );
        }
        if (nextStatus === "succeeded") {
          await upsertStripeCheckoutEntitlementFromSession(session);
        }
        continue;
      }

      if (order.source === "stripe_payment_intent" && order.stripe_payment_intent_id) {
        const intent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        const nextStatus = normalizeIntentStatus(intent.status);
        if (nextStatus !== order.status) {
          await dbQuery(
            `update public.payment_orders
             set status = $1, updated_at = $2, metadata_json = $3
             where stripe_payment_intent_id = $4`,
            [nextStatus, updatedAt, JSON.stringify(intent), order.stripe_payment_intent_id]
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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please wait and try again." }
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

  (async () => {
    try {
      await dbQuery(
        `insert into public.provider_events(provider, event_id, event_type, payload_json, created_at)
         values ($1, $2, $3, $4, $5)`,
        ["stripe", event.id, event.type, JSON.stringify(event), now()]
      );
    } catch (error) {
      if (error.code === "23505") {
        res.json({ received: true, duplicate: true });
        return;
      }
      throw error;
    }

    const object = event.data?.object || {};
    const updatedAt = now();

    if (event.type === "payment_intent.succeeded") {
      await dbQuery(
        `update public.payment_orders
         set status = $1, updated_at = $2, metadata_json = $3
         where stripe_payment_intent_id = $4`,
        ["succeeded", updatedAt, JSON.stringify(object), object.id || ""]
      );
    } else if (event.type === "payment_intent.payment_failed") {
      await dbQuery(
        `update public.payment_orders
         set status = $1, updated_at = $2, metadata_json = $3
         where stripe_payment_intent_id = $4`,
        ["failed", updatedAt, JSON.stringify(object), object.id || ""]
      );
    } else if (event.type === "checkout.session.completed") {
      await dbQuery(
        `update public.payment_orders
         set status = $1, updated_at = $2, metadata_json = $3
         where stripe_checkout_session_id = $4`,
        ["succeeded", updatedAt, JSON.stringify(object), object.id || ""]
      );
      await upsertStripeCheckoutEntitlementFromSession(object);
    } else if (event.type === "checkout.session.expired") {
      await dbQuery(
        `update public.payment_orders
         set status = $1, updated_at = $2, metadata_json = $3
         where stripe_checkout_session_id = $4`,
        ["expired", updatedAt, JSON.stringify(object), object.id || ""]
      );
    }

    res.json({ received: true });
  })().catch((error) => {
    console.error("Stripe webhook handling failed", error);
    res.status(500).json({ error: error.message || "Webhook processing failed." });
  });
});

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_, res) => {
  res.json({ ok: true, stripeConfigured: !!stripe, databaseConfigured: true });
});

app.get("/api/config/status", (_, res) => {
  const productionMode = process.env.NODE_ENV === "production";
  res.json({
    ok: true,
    mode: productionMode ? "production" : "development",
    authConfigured: authConfigured(),
    builderAuthConfigured: builderAdminAccounts.length > 0,
    databaseConfigured: true,
    stripeConfigured: !!stripe,
    appleIapConfigured: APPLE_IAP_ENABLED,
    appleIapEnv: APPLE_IAP_ENV,
    appleBundleId: APPLE_IAP_BUNDLE_ID || null,
    googleIapConfigured: GOOGLE_IAP_ENABLED,
    googlePackageName: GOOGLE_PLAY_PACKAGE_NAME || null,
    turnstileConfigured: turnstileConfigured()
  });
});

app.post("/api/auth/session", authLimiter, async (req, res) => {
  const parsed = authSessionRequestSchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid sign-in request." });
    return;
  }

  if (!authConfigured()) {
    res.status(503).json({ error: "Server auth is not configured." });
    return;
  }

  const body = parsed.data;
  const turnstileResult = await verifyTurnstileToken(body.turnstileToken, req.ip);
  if (!turnstileResult.ok) {
    res.status(403).json({ error: turnstileResult.error });
    return;
  }
  const normalizedEmail = normalizeEmail(body.email);
  const fallbackDisplayName = defaultDisplayNameFromEmail(normalizedEmail);

  let sessionRecord;
  if (body.mode === "builder") {
    const account = builderAdminAccounts.find((entry) => entry.email === normalizedEmail);
    if (!account || !verifyPasswordHash(body.password || "", account.passwordHash)) {
      res.status(401).json({ error: "Builder email or password is incorrect." });
      return;
    }
    sessionRecord = {
      userId: toUserId(normalizedEmail),
      email: normalizedEmail,
      displayName: account.displayName || body.displayName?.trim() || fallbackDisplayName,
      mode: "builder",
      roles: account.roles
    };
  } else {
    sessionRecord = buildSessionForVerifiedEmail(normalizedEmail, body.displayName?.trim() || fallbackDisplayName);
  }

  await ensureUser(sessionRecord);
  const token = signAuthToken(sessionRecord);
  const payload = decodeAuthToken(token);
  res.json({
    ok: true,
    token,
    expiresAt: typeof payload.exp === "number" ? payload.exp * 1000 : null,
    session: sessionRecord
  });
});

app.post("/api/auth/oauth-session", authLimiter, async (req, res) => {
  const parsed = oauthSessionRequestSchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid OAuth sign-in request." });
    return;
  }

  if (!authConfigured()) {
    res.status(503).json({ error: "Server auth is not configured." });
    return;
  }

  if (!supabaseAuthConfigured()) {
    res.status(503).json({ error: "Supabase Auth is not configured on the server." });
    return;
  }

  try {
    const body = parsed.data;
    const profile = await fetchSupabaseUserProfile(body.accessToken);
    const email = normalizeEmail(profile?.email);

    if (!email) {
      res.status(400).json({ error: "Provider sign-in did not return a verified email address." });
      return;
    }

    const metadataDisplayName =
      String(
        profile?.user_metadata?.full_name ||
          profile?.user_metadata?.name ||
          profile?.user_metadata?.display_name ||
          ""
      ).trim() || defaultDisplayNameFromEmail(email);

    const sessionRecord = buildSessionForVerifiedEmail(email, metadataDisplayName);
    await ensureUser({
      ...sessionRecord,
      authProvider: body.provider || "oauth"
    });
    const token = signAuthToken(sessionRecord);
    const payload = decodeAuthToken(token);

    res.json({
      ok: true,
      provider: body.provider || null,
      token,
      expiresAt: typeof payload.exp === "number" ? payload.exp * 1000 : null,
      session: sessionRecord
    });
  } catch (error) {
    res.status(401).json({ error: error.message || "Unable to complete provider sign-in." });
  }
});

app.get("/api/auth/session", async (req, res) => {
  const actor = requireRoles(req, res, ["tourist", "builder", "admin"]);
  if (!actor) {
    return;
  }

  await ensureUser(actor);
  res.json({
    ok: true,
    session: actor
  });
});

app.post("/api/payments/intent", async (req, res) => {
  const actor = requireRoles(req, res, ["tourist", "builder", "admin"]);
  if (!actor) {
    return;
  }
  if (!requireStripe(res)) {
    return;
  }

  const parsed = paymentIntentRequestSchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid request body." });
    return;
  }

  const body = parsed.data;
  const idem = await handleIdempotency(req, res, "payments_intent", body);
  if (idem.hit) {
    return;
  }

  const userId = actor.userId;
  await ensureUser(userId);

  let customerId = await getOrCreateStripeCustomer(userId);
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        metadata: { userId }
      });
      customerId = customer.id;
      await dbQuery(`update public.users set stripe_customer_id = $1 where id = $2`, [customerId, userId]);
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

    await dbQuery(
      `insert into public.payment_orders(
        user_id, source, stripe_payment_intent_id, stripe_checkout_session_id,
        amount, currency, status, description, metadata_json, created_at, updated_at
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
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
      ]
    );

    const responseBody = { clientSecret: intent.client_secret, paymentIntentId: intent.id };
    await storeIdempotencyRecord(idem.key, "payments_intent", idem.requestHash, responseBody, 200);
    res.json(responseBody);
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to create payment intent." });
  }
});

app.post("/api/payments/checkout-session", async (req, res) => {
  const actor = requireRoles(req, res, ["tourist", "builder", "admin"]);
  if (!actor) {
    return;
  }
  if (!requireStripe(res)) {
    return;
  }

  const parsed = checkoutSessionRequestSchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid request body." });
    return;
  }

  const body = parsed.data;
  const idem = await handleIdempotency(req, res, "checkout_session", body);
  if (idem.hit) {
    return;
  }

  const userId = actor.userId;
  await ensureUser(userId);

  let customerId = await getOrCreateStripeCustomer(userId);
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        metadata: { userId }
      });
      customerId = customer.id;
      await dbQuery(`update public.users set stripe_customer_id = $1 where id = $2`, [customerId, userId]);
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
          userId,
          ...(body.planId ? { planId: body.planId } : {})
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

    await dbQuery(
      `insert into public.payment_orders(
        user_id, source, stripe_payment_intent_id, stripe_checkout_session_id,
        amount, currency, status, description, metadata_json, created_at, updated_at
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        userId,
        "stripe_checkout_session",
        null,
        session.id,
        body.amount,
        "usd",
        "created",
        body.title,
        JSON.stringify(body.planId ? { planId: body.planId } : {}),
        now(),
        now()
      ]
    );

    const responseBody = { url: session.url, checkoutSessionId: session.id };
    await storeIdempotencyRecord(idem.key, "checkout_session", idem.requestHash, responseBody, 200);
    res.json(responseBody);
  } catch (error) {
    res.status(500).json({ error: error.message || "Unable to create checkout session." });
  }
});

app.post("/api/iap/verify", async (req, res) => {
  const actor = requireRoles(req, res, ["tourist", "builder", "admin"]);
  if (!actor) {
    return;
  }
  const parsed = iapVerifySchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid request body." });
    return;
  }

  const body = parsed.data;
  const userId = actor.userId;
  await ensureUser(userId);

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
    await dbQuery(
      `insert into public.iap_receipts(
        user_id, platform, product_id, transaction_id, purchase_token, status, raw_json, created_at
      ) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, body.platform, body.productId, body.transactionId, body.purchaseToken || null, verificationStatus, storedRaw, now()]
    );
  } catch (error) {
    if (error.code !== "23505") {
      res.status(500).json({ error: error.message || "Unable to record receipt." });
      return;
    }
  }

  if (isActive) {
    await dbQuery(
      `insert into public.entitlements(
        user_id, plan_id, source, status, transaction_id, platform, expires_at, raw_json, created_at, updated_at
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      on conflict (user_id, plan_id)
      do update set
        source = excluded.source,
        status = excluded.status,
        transaction_id = excluded.transaction_id,
        platform = excluded.platform,
        expires_at = excluded.expires_at,
        raw_json = excluded.raw_json,
        updated_at = excluded.updated_at`,
      [userId, body.planId, "iap", "active", body.transactionId, body.platform, expiresAt, storedRaw, now(), now()]
    );
  } else {
    await dbQuery(
      `insert into public.entitlements(
        user_id, plan_id, source, status, transaction_id, platform, expires_at, raw_json, created_at, updated_at
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      on conflict (user_id, plan_id)
      do update set
        source = excluded.source,
        status = excluded.status,
        transaction_id = excluded.transaction_id,
        platform = excluded.platform,
        expires_at = excluded.expires_at,
        raw_json = excluded.raw_json,
        updated_at = excluded.updated_at`,
      [userId, body.planId, "iap", verificationStatus, body.transactionId, body.platform, expiresAt, storedRaw, now(), now()]
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

app.get("/api/entitlements", async (req, res) => {
  const actor = requireRoles(req, res, ["tourist", "builder", "admin"]);
  if (!actor) {
    return;
  }
  const userId = actor.userId;
  await ensureUser(userId);
  await refreshPendingStripeOrders(userId);
  const { rows } = await dbQuery(
    `select user_id, plan_id, source, status, transaction_id, platform, expires_at, updated_at
     from public.entitlements
     where user_id = $1`,
    [userId]
  );
  res.json({ userId, entitlements: rows });
});

app.get("/api/orders", async (req, res) => {
  const actor = requireRoles(req, res, ["tourist", "builder", "admin"]);
  if (!actor) {
    return;
  }
  const userId = actor.userId;
  await ensureUser(userId);
  await refreshPendingStripeOrders(userId);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const { rows: orders } = await dbQuery(
    `select id, source, amount, currency, status, description, created_at, updated_at
     from public.payment_orders
     where user_id = $1
     order by id desc
     limit $2`,
    [userId, limit]
  );
  res.json({ userId, orders });
});

app.get("/api/provider-events", async (req, res) => {
  const actor = requireRoles(req, res, ["admin"]);
  if (!actor) {
    return;
  }
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const { rows: events } = await dbQuery(
    `select id, provider, event_id, event_type, created_at
     from public.provider_events
     order by id desc
     limit $1`,
    [limit]
  );
  res.json({ adminUser: actor.email, events });
});

app.post("/api/privacy/delete-request", express.json(), async (req, res) => {
  const actor = requireRoles(req, res, ["tourist", "builder", "admin"]);
  if (!actor) {
    return;
  }
  const parseResult = deletionRequestSchema.safeParse(req.body || {});
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.issues[0]?.message || "Invalid deletion request." });
    return;
  }

  const userId = actor.userId;
  const body = parseResult.data;
  await ensureUser(userId);
  const requestedAt = now();
  const { rows } = await dbQuery(
    `insert into public.deletion_requests(
      user_id, email, display_name, reason, status, requested_at
    ) values ($1, $2, $3, $4, $5, $6)
    returning id`,
    [userId, body.email || null, body.displayName || null, body.reason || null, "requested", requestedAt]
  );

  res.status(201).json({
    ok: true,
    requestId: rows[0].id,
    userId,
    status: "requested",
    requestedAt
  });
});

app.post("/api/newsletter/subscribe", express.json(), async (req, res) => {
  const actor = requireRoles(req, res, ["tourist", "builder", "admin"]);
  if (!actor) {
    return;
  }

  const parseResult = newsletterSubscribeSchema.safeParse(req.body || {});
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.issues[0]?.message || "Invalid newsletter signup." });
    return;
  }

  const body = parseResult.data;
  const email = normalizeEmail(body.email || actor.email);
  if (!email) {
    res.status(400).json({ error: "A valid email is required to subscribe to the newsletter." });
    return;
  }

  const subscribedAt = now();
  const metadataJson = JSON.stringify({
    userId: actor.userId,
    displayName: body.displayName || actor.displayName || null
  });

  await dbQuery(
    `insert into public.newsletter_subscribers(email, source, status, subscribed_at, updated_at, metadata_json)
     values ($1, $2, 'active', $3, $3, $4)
     on conflict (email)
     do update set
       source = excluded.source,
       status = 'active',
       updated_at = excluded.updated_at,
       metadata_json = excluded.metadata_json`,
    [email, body.source, subscribedAt, metadataJson]
  );

  await sendNewsletterConfirmationEmail({
    email,
    displayName: body.displayName || actor.displayName || ""
  });

  res.status(201).json({
    ok: true,
    email,
    status: "active",
    subscribedAt
  });
});

app.get("/api/admin/delete-requests", async (req, res) => {
  const actor = requireRoles(req, res, ["admin"]);
  if (!actor) {
    return;
  }
  const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
  const { rows: requests } = await dbQuery(
    `select id, user_id, email, display_name, reason, status, requested_at, resolved_at, resolved_by, resolution_note
     from public.deletion_requests
     order by id desc
     limit $1`,
    [limit]
  );
  res.json({ ok: true, adminUser: actor.email, requests });
});

app.post("/api/admin/delete-requests/:id/fulfill", express.json(), async (req, res) => {
  const actor = requireRoles(req, res, ["admin"]);
  if (!actor) {
    return;
  }

  const requestId = Number(req.params.id);
  if (!Number.isInteger(requestId) || requestId <= 0) {
    res.status(400).json({ error: "Invalid deletion request id." });
    return;
  }

  const { rows } = await dbQuery(
    `select id, user_id, email, display_name, reason, status, requested_at, resolved_at, resolved_by, resolution_note
     from public.deletion_requests
     where id = $1`,
    [requestId]
  );
  const requestRecord = rows[0];
  if (!requestRecord) {
    res.status(404).json({ error: "Deletion request not found." });
    return;
  }

  if (requestRecord.status === "fulfilled") {
    res.json({ ok: true, requestId, userId: requestRecord.user_id, status: "fulfilled" });
    return;
  }

  const resolvedAt = now();
  await purgeUserData(requestRecord.user_id);
  await dbQuery(
    `update public.deletion_requests
     set status = $1, resolved_at = $2, resolved_by = $3, resolution_note = $4
     where id = $5`,
    ["fulfilled", resolvedAt, actor.email, "User data purged", requestId]
  );

  res.json({
    ok: true,
    requestId,
    userId: requestRecord.user_id,
    status: "fulfilled",
    resolvedAt,
    resolvedBy: actor.email
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

(async () => {
  try {
    await ensureSchema();
    server.listen(PORT, () => {
      console.log(`Sync and payments server running on http://localhost:${PORT}`);
      console.log(`Postgres backend connected via Supabase.`);
    });
  } catch (error) {
    console.error("Unable to start sync server", error);
    process.exit(1);
  }
})();
