export function corsHeaders(origin?: string) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const requestOrigin = origin || "";
  const isAllowed =
    allowedOrigins.length === 0 || allowedOrigins.includes(requestOrigin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? requestOrigin : allowedOrigins[0] || "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };
}

export function jsonResponse(
  body: unknown,
  statusCode: number,
  headers: Record<string, string> = {}
) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  };
}
