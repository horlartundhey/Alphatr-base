import type { Handler, HandlerEvent } from "@netlify/functions";
import { corsHeaders, jsonResponse } from "./lib/http";
import { connectDB } from "./lib/db";
import { Contact } from "./lib/models/Contact";

type LeadSource = "contact_form" | "tracking_audit_offer";

interface LeadPayload {
  source: LeadSource;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  message?: string;
  websiteUrl?: string;
  monthlyAdSpend?: string;
  adPlatforms?: string;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
const buckets = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const existing = buckets.get(ip);
  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    buckets.set(ip, { count: 1, windowStart: now });
    return false;
  }
  existing.count += 1;
  return existing.count > RATE_LIMIT_MAX;
}

function isValidLeadPayload(payload: unknown): payload is LeadPayload {
  if (!payload || typeof payload !== "object") return false;
  const d = payload as Record<string, unknown>;
  if (d.source !== "contact_form" && d.source !== "tracking_audit_offer") return false;
  if (typeof d.firstName !== "string" || !d.firstName.trim()) return false;
  if (typeof d.lastName !== "string" || !d.lastName.trim()) return false;
  if (typeof d.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return false;
  if (d.source === "contact_form") {
    if (typeof d.message !== "string" || d.message.trim().length < 10) return false;
  }
  if (d.source === "tracking_audit_offer") {
    if (typeof d.websiteUrl !== "string" || !d.websiteUrl.trim()) return false;
    if (typeof d.monthlyAdSpend !== "string" || !d.monthlyAdSpend.trim()) return false;
    if (typeof d.adPlatforms !== "string" || !d.adPlatforms.trim()) return false;
  }
  return true;
}

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = corsHeaders(event.headers["origin"]);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse({ ok: false, message: "Method not allowed." }, 405, headers);
  }

  // Rate limiting by IP
  const ip =
    (event.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    event.headers["client-ip"] ||
    "unknown";

  if (isRateLimited(ip)) {
    return jsonResponse({ ok: false, message: "Too many requests. Please try again later." }, 429, headers);
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    return jsonResponse({ ok: false, message: "Server configuration error." }, 500, headers);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse({ ok: false, message: "Invalid JSON." }, 400, headers);
  }

  if (!isValidLeadPayload(payload)) {
    return jsonResponse({ ok: false, message: "Invalid lead payload." }, 400, headers);
  }

  const contactListId = Number(process.env.BREVO_CONTACT_LIST_ID ?? 2);
  const auditListId = Number(process.env.BREVO_AUDIT_LIST_ID ?? 3);
  const listId = payload.source === "contact_form" ? contactListId : auditListId;

  try {
    // Save to MongoDB (non-blocking — don't fail the request if DB is down)
    try {
      await connectDB();
      await Contact.create({
        source: payload.source,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        company: payload.company || "",
        message: payload.message || "",
        websiteUrl: payload.websiteUrl || "",
        monthlyAdSpend: payload.monthlyAdSpend || "",
        adPlatforms: payload.adPlatforms || "",
        ip,
      });
    } catch (dbErr) {
      console.error("[leads] DB save error (non-fatal):", dbErr);
    }

    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        email: payload.email,
        attributes: {
          FIRSTNAME: payload.firstName,
          LASTNAME: payload.lastName,
          COMPANY: payload.company || "",
          MESSAGE: payload.message || "",
          WEBSITE: payload.websiteUrl || "",
          AD_SPEND: payload.monthlyAdSpend || "",
          AD_PLATFORMS: payload.adPlatforms || "",
          SOURCE: payload.source === "contact_form" ? "Contact Form" : "Tracking Audit Landing Page",
        },
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error("[leads] Brevo error:", errText);
      return jsonResponse({ ok: false, message: "Failed to submit lead." }, 502, headers);
    }

    return jsonResponse({ ok: true }, 200, headers);
  } catch (err) {
    console.error("[leads] Network error:", err);
    return jsonResponse({ ok: false, message: "Lead submission failed." }, 500, headers);
  }
};
