export type PaymentIntentRequest = {
  amount: number;
  currency?: string;
  description?: string;
};

export type VerifyIapPurchaseRequest = {
  platform: "ios" | "android";
  planId: "plus" | "pro";
  productId: string;
  transactionId: string;
  purchaseToken?: string;
  receiptData?: string;
};

export type EntitlementRecord = {
  plan_id: string;
  status: string;
  source?: string;
  platform?: string | null;
  updated_at?: number;
};

export type OrderRecord = {
  id: number;
  source: string;
  amount: number;
  currency: string;
  status: string;
  description?: string | null;
  created_at: number;
};

export type ProviderEventRecord = {
  id: number;
  provider: string;
  event_id: string;
  event_type: string;
  created_at: number;
};

export type DeletionRequestResult = {
  ok: boolean;
  requestId: number;
  userId: string;
  status: string;
  requestedAt: number;
};

export type DeletionRequestRecord = {
  id: number;
  user_id: string;
  email?: string | null;
  display_name?: string | null;
  reason?: string | null;
  status: string;
  requested_at: number;
  resolved_at?: number | null;
  resolved_by?: string | null;
  resolution_note?: string | null;
};

let apiUserId = "demo-user";

export function setApiUserId(userId: string) {
  apiUserId = userId.trim() || "demo-user";
}

function getServerUrl() {
  const base = (process.env.EXPO_PUBLIC_SYNC_SERVER_URL || "http://localhost:4000").trim();
  return base.replace(/\/+$/, "");
}

export function getSyncServerUrl() {
  return getServerUrl();
}

function toApiError(error: unknown, fallbackMessage: string) {
  const asError = error as Error | undefined;
  const message = (asError?.message || "").toLowerCase();
  if (message.includes("network request failed") || message.includes("failed to fetch")) {
    return new Error(`${fallbackMessage} (sync server unreachable at ${getServerUrl()})`);
  }
  return new Error(asError?.message || fallbackMessage);
}

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getServerUrl()}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": apiUserId
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    throw toApiError(error, "Payment request failed.");
  }

  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || "Payment request failed.");
  }
  return data;
}

export async function createCheckoutIntent(request: PaymentIntentRequest) {
  return postJson<{ clientSecret: string }>("/api/payments/intent", request);
}

export async function createCheckoutSession(amount: number, title: string, planId?: string) {
  const appScheme =
    ((process.env.EXPO_PUBLIC_APP_SCHEME || "phillyartours").trim())
      .replace(/:\/\//g, "")
      .replace(/\/+$/g, "");
  return postJson<{ url: string | null }>("/api/payments/checkout-session", {
    amount,
    title,
    ...(planId ? { planId } : {}),
    successUrl: `${appScheme}://checkout/success`,
    cancelUrl: `${appScheme}://checkout/cancel`
  });
}

export async function verifyIapPurchase(request: VerifyIapPurchaseRequest) {
  return postJson<{ status: string; active: boolean; planId: string }>("/api/iap/verify", request);
}

export async function getEntitlements() {
  let response: Response;
  try {
    response = await fetch(`${getServerUrl()}/api/entitlements`, {
      method: "GET",
      headers: {
        "x-user-id": apiUserId
      }
    });
  } catch (error) {
    throw toApiError(error, "Unable to load entitlements.");
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string; entitlements?: EntitlementRecord[] };
  if (!response.ok) {
    throw new Error(data.error || "Unable to load entitlements.");
  }
  return data.entitlements || [];
}

export async function getOrders(limit = 10) {
  let response: Response;
  try {
    response = await fetch(`${getServerUrl()}/api/orders?limit=${Math.max(1, Math.min(limit, 100))}`, {
      method: "GET",
      headers: {
        "x-user-id": apiUserId
      }
    });
  } catch (error) {
    throw toApiError(error, "Unable to load orders.");
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string; orders?: OrderRecord[] };
  if (!response.ok) {
    throw new Error(data.error || "Unable to load orders.");
  }
  return data.orders || [];
}

export async function getProviderEvents(limit = 10) {
  let response: Response;
  try {
    response = await fetch(`${getServerUrl()}/api/provider-events?limit=${Math.max(1, Math.min(limit, 100))}`, {
      method: "GET"
    });
  } catch (error) {
    throw toApiError(error, "Unable to load provider events.");
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string; events?: ProviderEventRecord[] };
  if (!response.ok) {
    throw new Error(data.error || "Unable to load provider events.");
  }
  return data.events || [];
}

export async function getBackendConfigStatus() {
  let response: Response;
  try {
    response = await fetch(`${getServerUrl()}/api/config/status`, { method: "GET" });
  } catch (error) {
    throw toApiError(error, "Unable to load backend status.");
  }
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    mode?: "development" | "production";
    stripeConfigured?: boolean;
    appleIapConfigured?: boolean;
    googleIapConfigured?: boolean;
  };
  if (!response.ok) {
    throw new Error(data.error || "Unable to load backend status.");
  }
  return data;
}

export async function requestBackendDeletion(payload: { email?: string; displayName?: string; reason?: string }) {
  return postJson<DeletionRequestResult>("/api/privacy/delete-request", payload);
}

async function adminJson<T>(path: string, init: RequestInit & { adminKey: string; adminUser?: string }) {
  const { adminKey, adminUser, ...requestInit } = init;
  let response: Response;
  try {
    response = await fetch(`${getServerUrl()}${path}`, {
      ...requestInit,
      headers: {
        ...(requestInit.headers || {}),
        "x-admin-key": adminKey,
        ...(adminUser ? { "x-admin-user": adminUser } : {})
      }
    });
  } catch (error) {
    throw toApiError(error, "Unable to reach admin endpoint.");
  }

  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || "Admin request failed.");
  }
  return data;
}

export async function listDeletionRequests(adminKey: string, adminUser?: string, limit = 50) {
  const data = await adminJson<{ requests?: DeletionRequestRecord[] }>(
    `/api/admin/delete-requests?limit=${Math.max(1, Math.min(limit, 200))}`,
    { method: "GET", adminKey, adminUser }
  );
  return data.requests || [];
}

export async function fulfillDeletionRequest(requestId: number, adminKey: string, adminUser?: string) {
  return adminJson<{ ok: boolean; requestId: number; userId: string; status: string }>(
    `/api/admin/delete-requests/${requestId}/fulfill`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      adminKey,
      adminUser
    }
  );
}
