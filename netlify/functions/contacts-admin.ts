import type { Handler, HandlerEvent } from "@netlify/functions";
import { corsHeaders, jsonResponse } from "./lib/http";
import { verifyAdminToken } from "./lib/jwt";
import { connectDB } from "./lib/db";
import { Contact } from "./lib/models/Contact";

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = corsHeaders(event.headers["origin"]);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Auth guard
  const authHeader = event.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  try {
    if (!token) throw new Error("No token");
    verifyAdminToken(token);
  } catch {
    return jsonResponse({ ok: false, message: "Unauthorised." }, 401, headers);
  }

  await connectDB();

  // GET /api/contacts/admin  — list all contacts
  if (event.httpMethod === "GET" && !event.path.includes("/read/") && !event.path.includes("/delete/")) {
    const page   = Math.max(1, Number(event.queryStringParameters?.page  ?? 1));
    const limit  = Math.min(100, Number(event.queryStringParameters?.limit ?? 50));
    const source = event.queryStringParameters?.source; // optional filter

    const filter: Record<string, unknown> = {};
    if (source === "contact_form" || source === "tracking_audit_offer") {
      filter.source = source;
    }

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Contact.countDocuments(filter),
    ]);

    return jsonResponse({ ok: true, contacts, total, page, limit }, 200, headers);
  }

  // PUT /api/contacts/admin/read/:id  — mark as read
  const readMatch = event.path.match(/\/read\/([a-f0-9]{24})$/);
  if (event.httpMethod === "PUT" && readMatch) {
    const id = readMatch[1];
    const contact = await Contact.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!contact) return jsonResponse({ ok: false, message: "Not found." }, 404, headers);
    return jsonResponse({ ok: true, contact }, 200, headers);
  }

  // DELETE /api/contacts/admin/:id
  const deleteMatch = event.path.match(/\/([a-f0-9]{24})$/);
  if (event.httpMethod === "DELETE" && deleteMatch) {
    const id = deleteMatch[1];
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) return jsonResponse({ ok: false, message: "Not found." }, 404, headers);
    return jsonResponse({ ok: true }, 200, headers);
  }

  return jsonResponse({ ok: false, message: "Not found." }, 404, headers);
};
