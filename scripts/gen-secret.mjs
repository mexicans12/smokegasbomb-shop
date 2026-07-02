#!/usr/bin/env node
/* Generate a random value for SESSION_SECRET.
   Usage:  node scripts/gen-secret.mjs */
import { randomBytes } from "node:crypto";
console.log(randomBytes(48).toString("base64url"));
