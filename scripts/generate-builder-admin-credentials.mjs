import fs from "node:fs";
import path from "node:path";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "builder-admins.csv");
const outputPath = path.join(rootDir, "src", "data", "builderAdminCredentials.ts");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isActiveFlag(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized !== "false" && normalized !== "0" && normalized !== "no" && normalized !== "inactive";
}

const { records } = readCatalogCsv(csvPath);
const rows = [];
const seenEmails = new Set();

for (const record of records) {
  const email = normalizeEmail(record.email);
  const password = String(record.password || "").trim();
  const displayName = String(record.displayName || "").trim();
  const active = isActiveFlag(record.active);

  if (!email || !password || !active || seenEmails.has(email)) {
    continue;
  }

  seenEmails.add(email);
  rows.push({
    email,
    password,
    displayName
  });
}

rows.sort((left, right) => left.email.localeCompare(right.email));

const lines = [
  "export type BuilderAdminCredential = {",
  "  email: string;",
  "  password: string;",
  "  displayName?: string;",
  "};",
  "",
  "export const builderAdminCredentials: BuilderAdminCredential[] = ["
];

for (const row of rows) {
  lines.push("  {");
  lines.push(`    email: ${JSON.stringify(row.email)},`);
  lines.push(`    password: ${JSON.stringify(row.password)},`);
  if (row.displayName) {
    lines.push(`    displayName: ${JSON.stringify(row.displayName)},`);
  }
  lines.push("  },");
}

lines.push("];");
lines.push("");

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);

console.log(`Generated builder admin credential map with ${rows.length} active admin(s).`);
