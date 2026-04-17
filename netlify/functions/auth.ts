import type { Handler, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
import { connectDB } from "./lib/db";
import { AdminUser } from "./lib/models/AdminUser";
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

  try {
    await connectDB();

    // Look up admin by email
    const admin = await AdminUser.findOne({ email: email.toLowerCase() }).select("+passwordHash");

    // Always run bcrypt compare to prevent timing attacks (even if admin not found)
    const dummyHash = "$2a$12$invalidhashpadding000000000000000000000000000000000000";
    const passwordMatch = await bcrypt.compare(password, admin?.passwordHash ?? dummyHash);

    if (!admin || !passwordMatch) {
      return jsonResponse({ ok: false, message: "Invalid credentials." }, 401, headers);
    }

    const token = signAdminToken(admin.email);
    return jsonResponse({ ok: true, token }, 200, headers);
  } catch (err) {
    console.error("[auth] Error:", err);
    return jsonResponse({ ok: false, message: "Internal server error." }, 500, headers);
  }
};
