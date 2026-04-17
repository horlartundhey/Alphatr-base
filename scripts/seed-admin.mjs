/**
 * Seed the admin user into MongoDB.
 * Run from server/ folder:
 *   node scripts/seed-admin.mjs
 *
 * Safe to re-run — skips if email already exists.
 * To change password: update ADMIN_PASSWORD below and add --force flag or delete the user first.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = resolve(__dirname, "../.env");
try {
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.error("Could not read .env file");
  process.exit(1);
}

// ── Configure these ──────────────────────────────────────────────────────────
const ADMIN_EMAIL    = "admin@alphatrack.digital";
const ADMIN_PASSWORD = "AlphaAdmin2026";
// ─────────────────────────────────────────────────────────────────────────────

const AdminUserSchema = new mongoose.Schema(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const AdminUser =
  mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("❌  MONGODB_URI not set"); process.exit(1); }

  console.log("📡  Connecting to MongoDB...");
  await mongoose.connect(uri, { dbName: "alphatrack" });
  console.log("✅  Connected.\n");

  const existing = await AdminUser.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`⏭️   Admin already exists: ${ADMIN_EMAIL}`);
    console.log("     To reset the password, delete the document and re-run.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await AdminUser.create({ email: ADMIN_EMAIL, passwordHash });

  console.log(`✅  Admin created: ${ADMIN_EMAIL}`);
  console.log(`🔑  Password: ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
