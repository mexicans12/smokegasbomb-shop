#!/usr/bin/env node
/* Generate an scrypt password hash for ADMIN_PASSWORD_HASH.
   Usage:  node scripts/hash-password.mjs 'your-password'
   Output: salt:hash  (paste into ADMIN_PASSWORD_HASH) */
import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs 'your-password'");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
console.log(`${salt}:${hash}`);
