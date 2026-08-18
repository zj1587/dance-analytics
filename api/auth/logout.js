import { buildClearAccessCookies } from "../_access-session.js";

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.statusCode = 405;
    response.end(JSON.stringify({ ok: false, message: "Method not allowed" }));
    return;
  }

  response.setHeader("Set-Cookie", buildClearAccessCookies());
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.statusCode = 200;
  response.end(JSON.stringify({ ok: true }));
}
