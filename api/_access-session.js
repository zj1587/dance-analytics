export const ACCESS_COOKIE_NAME = "__Host-las_access";
export const LOCAL_ACCESS_COOKIE_NAME = "las_access_local";
export const ACCESS_SESSION_MAX_AGE = 60 * 60 * 24 * 3;

const encoder = new TextEncoder();

function getEnv(name) {
  return globalThis.process?.env?.[name] ?? "";
}

function base64UrlEncode(input) {
  const bytes = typeof input === "string" ? encoder.encode(input) : input;
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new TextDecoder().decode(bytes);
}

function constantTimeEqual(left, right) {
  const maxLength = Math.max(left.length, right.length);
  let result = left.length === right.length ? 0 : 1;

  for (let index = 0; index < maxLength; index += 1) {
    result |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return result === 0;
}

function getSessionSecret() {
  return getEnv("ACCESS_SESSION_SECRET") || getEnv("ACCESS_AUTH_SECRET") || getAccessCodes().join("\n");
}

export function getAccessCodes() {
  const combined = [getEnv("ACCESS_CODES"), getEnv("ACCESS_CODE")].filter(Boolean).join("\n");

  return combined
    .split(/[\n,;]+/)
    .map((code) => code.trim())
    .filter(Boolean);
}

export function hasAccessAuthConfig() {
  return getAccessCodes().length > 0 && Boolean(getSessionSecret());
}

export function isValidAccessCode(input) {
  const normalizedInput = String(input ?? "").trim();

  if (!normalizedInput) {
    return false;
  }

  return getAccessCodes().some((code) => constantTimeEqual(normalizedInput, code));
}

async function sign(value) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("Missing ACCESS_CODES or ACCESS_CODE environment variable.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return base64UrlEncode(new Uint8Array(signature));
}

export async function createAccessSessionToken() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    v: 1,
    kind: "access-code",
    iat: issuedAt,
    exp: issuedAt + ACCESS_SESSION_MAX_AGE,
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(body);

  return `${body}.${signature}`;
}

export async function verifyAccessSessionToken(token) {
  const [body, signature] = String(token ?? "").split(".");

  if (!body || !signature) {
    return false;
  }

  let expectedSignature = "";

  try {
    expectedSignature = await sign(body);
  } catch {
    return false;
  }

  if (!constantTimeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body));
    const expiresAt = Number(payload.exp);

    return payload.v === 1 && payload.kind === "access-code" && expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function parseCookieHeader(cookieHeader) {
  return String(cookieHeader ?? "")
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((cookies, cookie) => {
      const separatorIndex = cookie.indexOf("=");

      if (separatorIndex > -1) {
        cookies[cookie.slice(0, separatorIndex)] = decodeURIComponent(cookie.slice(separatorIndex + 1));
      }

      return cookies;
    }, {});
}

export function getAccessSessionToken(cookieHeader) {
  const cookies = parseCookieHeader(cookieHeader);

  return cookies[ACCESS_COOKIE_NAME] || cookies[LOCAL_ACCESS_COOKIE_NAME] || "";
}

function isSecureRequest(requestLike) {
  const forwardedProto = requestLike?.headers?.["x-forwarded-proto"] ?? requestLike?.headers?.get?.("x-forwarded-proto");
  const host = requestLike?.headers?.host ?? requestLike?.headers?.get?.("host") ?? "";

  return forwardedProto === "https" || !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

export function buildAccessCookie(token, requestLike) {
  const secure = isSecureRequest(requestLike);
  const cookieName = secure ? ACCESS_COOKIE_NAME : LOCAL_ACCESS_COOKIE_NAME;
  const attributes = [
    `${cookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${ACCESS_SESSION_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (secure) {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

export function buildClearAccessCookies() {
  return [
    `${ACCESS_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`,
    `${LOCAL_ACCESS_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
  ];
}
