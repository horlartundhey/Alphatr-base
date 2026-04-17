import type { Handler, HandlerEvent } from "@netlify/functions";
import { connectDB } from "./lib/db";
import { BlogPost } from "./lib/models/BlogPost";
import { verifyAdminToken, extractBearerToken } from "./lib/jwt";
import { corsHeaders, jsonResponse } from "./lib/http";

function requireAuth(event: HandlerEvent): { email: string } | null {
  const token = extractBearerToken(event.headers["authorization"]);
  if (!token) return null;
  try {
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = corsHeaders(event.headers["origin"]);

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Auth check on every non-OPTIONS request
  const admin = requireAuth(event);
  if (!admin) {
    return jsonResponse({ ok: false, message: "Unauthorized." }, 401, headers);
  }

  try {
    await connectDB();

    const { httpMethod, path: reqPath, body: rawBody } = event;

    // Extract optional slug from path: /api/blog/admin/:slug
    const pathParts = (reqPath || "").split("/").filter(Boolean);
    // ["api","blog","admin"] or ["api","blog","admin","my-post-slug"]
    const slug = pathParts.length >= 4 ? pathParts[pathParts.length - 1] : null;

    // ── GET /api/blog/admin  — list all posts (drafts + published) ──
    if (httpMethod === "GET" && !slug) {
      const page = Number(event.queryStringParameters?.page ?? 1);
      const limit = Number(event.queryStringParameters?.limit ?? 50);
      const status = event.queryStringParameters?.status;

      const filter: Record<string, unknown> = {};
      if (status === "draft" || status === "published") filter.status = status;

      const [posts, total] = await Promise.all([
        BlogPost.find(filter)
          .select("-content")
          .sort({ updatedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        BlogPost.countDocuments(filter),
      ]);

      return jsonResponse({ ok: true, posts, total, page, limit }, 200, headers);
    }

    // ── GET /api/blog/admin/:slug — get single post with content ──
    if (httpMethod === "GET" && slug) {
      const post = await BlogPost.findOne({ slug }).lean();
      if (!post) return jsonResponse({ ok: false, message: "Post not found." }, 404, headers);
      return jsonResponse({ ok: true, post }, 200, headers);
    }

    // ── POST /api/blog/admin — create new post ──
    if (httpMethod === "POST") {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(rawBody || "{}");
      } catch {
        return jsonResponse({ ok: false, message: "Invalid JSON." }, 400, headers);
      }

      const { title, excerpt, content, image, category, readTime, author, status } = data as {
        title?: string;
        excerpt?: string;
        content?: string;
        image?: string;
        category?: string;
        readTime?: string;
        author?: string;
        status?: "draft" | "published";
      };

      if (!title || !excerpt || !content || !category) {
        return jsonResponse(
          { ok: false, message: "title, excerpt, content, and category are required." },
          400,
          headers
        );
      }

      const generatedSlug = slugify(title as string);
      const publishedAt = status === "published" ? new Date() : null;

      const post = await BlogPost.create({
        title,
        slug: generatedSlug,
        excerpt,
        content,
        image: image || "",
        category,
        readTime: readTime || "5 min read",
        author: author || "Alphatrack Team",
        status: status || "draft",
        publishedAt,
      });

      return jsonResponse({ ok: true, post }, 201, headers);
    }

    // ── PUT /api/blog/admin/:slug — update post ──
    if (httpMethod === "PUT" && slug) {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(rawBody || "{}");
      } catch {
        return jsonResponse({ ok: false, message: "Invalid JSON." }, 400, headers);
      }

      const update: Record<string, unknown> = { ...data };

      // If publishing for the first time, set publishedAt
      if (data.status === "published") {
        const existing = await BlogPost.findOne({ slug }).select("publishedAt").lean();
        if (!existing?.publishedAt) {
          update.publishedAt = new Date();
        }
      }

      const post = await BlogPost.findOneAndUpdate({ slug }, { $set: update }, { new: true, runValidators: true });
      if (!post) return jsonResponse({ ok: false, message: "Post not found." }, 404, headers);

      return jsonResponse({ ok: true, post }, 200, headers);
    }

    // ── DELETE /api/blog/admin/:slug — delete post ──
    if (httpMethod === "DELETE" && slug) {
      const post = await BlogPost.findOneAndDelete({ slug });
      if (!post) return jsonResponse({ ok: false, message: "Post not found." }, 404, headers);
      return jsonResponse({ ok: true, message: "Post deleted." }, 200, headers);
    }

    return jsonResponse({ ok: false, message: "Route not found." }, 404, headers);
  } catch (err) {
    console.error("[blog-admin] Error:", err);
    return jsonResponse({ ok: false, message: "Internal server error." }, 500, headers);
  }
};
