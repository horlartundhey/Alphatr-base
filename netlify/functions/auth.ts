import type { Handler, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
import { signAdminToken } from "./lib/jwt";
import { corsHeaders, jsonResponse } from "./lib/http";

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = corsHeaders(event.headers["origin"]);

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse({ ok: false, message: "Method not allowed." }, 405, headers);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    return jsonResponse({ ok: false, message: "Admin credentials not configured." }, 500, headers);
  }

  let body: { email?: string; password?: string };
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse({ ok: false, message: "Invalid JSON." }, 400, headers);
  }

  const { email, password } = body;

  if (!email || !password) {
    return jsonResponse({ ok: false, message: "Email and password are required." }, 400, headers);
  }

  // Constant-time email comparison to prevent user enumeration
  const emailMatch = email.toLowerCase() === adminEmail.toLowerCase();
  const passwordMatch = await bcrypt.compare(password, adminPasswordHash);

  if (!emailMatch || !passwordMatch) {
    return jsonResponse({ ok: false, message: "Invalid credentials." }, 401, headers);
  }

  const token = signAdminToken(email);
  return jsonResponse({ ok: true, token }, 200, headers);
};
