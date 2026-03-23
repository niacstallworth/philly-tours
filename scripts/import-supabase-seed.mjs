import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const envPath = path.join(repoRoot, ".env");
const seedDir = path.join(repoRoot, "supabase", "seed-data");
const psqlPath = "/opt/homebrew/opt/libpq/bin/psql";
const connectionString = "sslmode=require host=db.inqopeveskosnfjhuein.supabase.co port=5432 dbname=postgres user=postgres";

function readEnvValue(key) {
  const text = fs.readFileSync(envPath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (!line.startsWith(`${key}=`)) continue;
    return line.slice(key.length + 1);
  }
  return "";
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function jsonRows(name) {
  const filePath = path.join(seedDir, `${name}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function insertRows(table, columns, rows, conflictClause) {
  if (!rows.length) {
    return `-- ${table}: no rows\n`;
  }
  const values = rows
    .map((row) => `(${columns.map((column) => sqlLiteral(row[column])).join(", ")})`)
    .join(",\n");
  return `insert into public.${table} (${columns.join(", ")})\nvalues\n${values}\n${conflictClause};\n`;
}

const password = readEnvValue("SUPABASE_DB_PASSWORD");
if (!password) {
  console.error("SUPABASE_DB_PASSWORD is missing in .env");
  process.exit(1);
}

const sql = `
begin;

${insertRows(
  "users",
  ["id", "stripe_customer_id", "created_at"],
  jsonRows("users"),
  "on conflict (id) do update set stripe_customer_id = excluded.stripe_customer_id, created_at = excluded.created_at"
)}

${insertRows(
  "payment_orders",
  ["id", "user_id", "source", "stripe_payment_intent_id", "stripe_checkout_session_id", "amount", "currency", "status", "description", "metadata_json", "created_at", "updated_at"],
  jsonRows("payment_orders"),
  "on conflict (id) do update set user_id = excluded.user_id, source = excluded.source, stripe_payment_intent_id = excluded.stripe_payment_intent_id, stripe_checkout_session_id = excluded.stripe_checkout_session_id, amount = excluded.amount, currency = excluded.currency, status = excluded.status, description = excluded.description, metadata_json = excluded.metadata_json, created_at = excluded.created_at, updated_at = excluded.updated_at"
)}

${insertRows(
  "entitlements",
  ["user_id", "plan_id", "source", "status", "transaction_id", "platform", "expires_at", "raw_json", "created_at", "updated_at"],
  jsonRows("entitlements"),
  "on conflict (user_id, plan_id) do update set source = excluded.source, status = excluded.status, transaction_id = excluded.transaction_id, platform = excluded.platform, expires_at = excluded.expires_at, raw_json = excluded.raw_json, created_at = excluded.created_at, updated_at = excluded.updated_at"
)}

${insertRows(
  "iap_receipts",
  ["id", "user_id", "platform", "product_id", "transaction_id", "purchase_token", "status", "raw_json", "created_at"],
  jsonRows("iap_receipts"),
  "on conflict (transaction_id) do update set user_id = excluded.user_id, platform = excluded.platform, product_id = excluded.product_id, purchase_token = excluded.purchase_token, status = excluded.status, raw_json = excluded.raw_json, created_at = excluded.created_at"
)}

${insertRows(
  "idempotency",
  ["id", "endpoint", "request_hash", "response_json", "status_code", "created_at"],
  jsonRows("idempotency"),
  "on conflict (id) do update set endpoint = excluded.endpoint, request_hash = excluded.request_hash, response_json = excluded.response_json, status_code = excluded.status_code, created_at = excluded.created_at"
)}

${insertRows(
  "provider_events",
  ["id", "provider", "event_id", "event_type", "payload_json", "created_at"],
  jsonRows("provider_events"),
  "on conflict (event_id) do update set provider = excluded.provider, event_type = excluded.event_type, payload_json = excluded.payload_json, created_at = excluded.created_at"
)}

${insertRows(
  "deletion_requests",
  ["id", "user_id", "email", "display_name", "reason", "status", "requested_at", "resolved_at", "resolved_by", "resolution_note"],
  jsonRows("deletion_requests"),
  "on conflict (id) do update set user_id = excluded.user_id, email = excluded.email, display_name = excluded.display_name, reason = excluded.reason, status = excluded.status, requested_at = excluded.requested_at, resolved_at = excluded.resolved_at, resolved_by = excluded.resolved_by, resolution_note = excluded.resolution_note"
)}

select setval(pg_get_serial_sequence('public.payment_orders', 'id'), coalesce((select max(id) from public.payment_orders), 1), true);
select setval(pg_get_serial_sequence('public.iap_receipts', 'id'), coalesce((select max(id) from public.iap_receipts), 1), true);
select setval(pg_get_serial_sequence('public.provider_events', 'id'), coalesce((select max(id) from public.provider_events), 1), true);
select setval(pg_get_serial_sequence('public.deletion_requests', 'id'), coalesce((select max(id) from public.deletion_requests), 1), true);

commit;
`;

const tempFile = path.join(os.tmpdir(), `philly-tours-supabase-import-${Date.now()}.sql`);
fs.writeFileSync(tempFile, sql, "utf8");

try {
  execFileSync(psqlPath, [connectionString, "-v", "ON_ERROR_STOP=1", "-f", tempFile], {
    stdio: "inherit",
    env: {
      ...process.env,
      PGPASSWORD: password
    }
  });
} finally {
  fs.unlinkSync(tempFile);
}
