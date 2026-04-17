import type { Handler, HandlerEvent } from "@netlify/functions";
import { connectDB } from "./lib/db";
import { BlogPost } from "./lib/models/BlogPost";
import { corsHeaders, jsonResponse } from "./lib/http";

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = corsHeaders(event.headers["origin"]);

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return jsonResponse({ ok: false, message: "Method not allowed." }, 405, headers);
  }

  try {
    await connectDB();

    // Extract slug from path: /api/blog/:slug  or  /api/blog
    const pathParts = (event.path || "").split("/").filter(Boolean);
    // pathParts looks like ["api", "blog"] or ["api", "blog", "my-slug"]
    const slug = pathParts.length >= 3 ? pathParts[pathParts.length - 1] : null;

    if (slug && slug !== "blog") {
      // Single post by slug
      const post = await BlogPost.findOne({ slug, status: "published" }).lean();
      if (!post) {
        return jsonResponse({ ok: false, message: "Post not found." }, 404, headers);
      }
      return jsonResponse({ ok: true, post }, 200, headers);
    }

    // List all published posts — newest first, exclude full content for performance
    const page = Number(event.queryStringParameters?.page ?? 1);
    const limit = Number(event.queryStringParameters?.limit ?? 20);
    const category = event.queryStringParameters?.category;

    const filter: Record<string, unknown> = { status: "published" };
    if (category) filter.category = category;

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .select("-content")
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    return jsonResponse({ ok: true, posts, total, page, limit }, 200, headers);
  } catch (err) {
    console.error("[blog] Error:", err);
    return jsonResponse({ ok: false, message: "Internal server error." }, 500, headers);
  }
};
