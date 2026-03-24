import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "builder-admins.csv");
const outputPath = path.join(rootDir, "generated", "builder-admin-accounts.json");

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isActiveFlag(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized !== "false" && normalized !== "0" && normalized !== "no" && normalized !== "inactive";
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

const { records } = readCatalogCsv(csvPath);
const rows = [];
const seenEmails = new Set();

for (const record of records) {
  const email = normalizeEmail(record.email);
  const password = String(record.password || "").trim();
  const displayName = String(record.displayName || "").trim();
  const roles = String(record.roles || "builder").split("|").map((role) => role.trim()).filter(Boolean);
  const active = isActiveFlag(record.active);

  if (!email || !password || !active || seenEmails.has(email)) {
    continue;
  }

  seenEmails.add(email);
  rows.push({
    email,
    passwordHash: hashPassword(password),
    displayName: displayName || email,
    roles
  });
}

rows.sort((left, right) => left.email.localeCompare(right.email));

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(rows, null, 2)}\n`);

console.log(`Generated ${rows.length} builder/admin account record(s) at ${outputPath}`);
console.log("");
console.log("Set this in your server environment:");
console.log(`BUILDER_ADMIN_ACCOUNTS_JSON='${JSON.stringify(rows)}'`);
