import {
  ACCESS_SESSION_MAX_AGE,
  buildAccessCookie,
  createAccessSessionToken,
  hasAccessAuthConfig,
  isValidAccessCode,
} from "../_access-session.js";

async function readJsonBody(request) {
  if (typeof request.body === "string") {
    return request.body ? JSON.parse(request.body) : {};
  }

  if (Buffer.isBuffer(request.body)) {
    const rawBody = request.body.toString("utf8");

    return rawBody ? JSON.parse(rawBody) : {};
  }

  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");

  return rawBody ? JSON.parse(rawBody) : {};
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { ok: false, message: "Method not allowed" });
    return;
  }

  if (!hasAccessAuthConfig()) {
    sendJson(response, 500, { ok: false, message: "Access auth is not configured." });
    return;
  }

  try {
    const body = await readJsonBody(request);

    if (!isValidAccessCode(body.code)) {
      sendJson(response, 401, { ok: false, message: "访问码不正确" });
      return;
    }

    const token = await createAccessSessionToken();
    response.setHeader("Set-Cookie", buildAccessCookie(token, request));
    sendJson(response, 200, { ok: true, expiresIn: ACCESS_SESSION_MAX_AGE });
  } catch (error) {
    console.error(error);
    sendJson(response, 400, { ok: false, message: "请求格式不正确" });
  }
}
