import { getAccessSessionToken, hasAccessAuthConfig, verifyAccessSessionToken } from "./api/_access-session.js";

const AUTH_PATH = "/access";
const PUBLIC_API_PREFIX = "/api/auth/";
const STATIC_PATH_PATTERN = /\.(?:avif|css|gif|ico|jpg|jpeg|js|json|map|png|svg|txt|webmanifest|webp|woff2?)$/i;
const LOCAL_DEV_ASSET_PREFIXES = ["/@fs/", "/@id/", "/@react-refresh", "/@vite/", "/node_modules/", "/src/"];

function isLocalDevRequest(url) {
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(url.host);
}

function isPublicPath(pathname, url) {
  return (
    pathname === AUTH_PATH ||
    pathname.startsWith(PUBLIC_API_PREFIX) ||
    pathname.startsWith("/assets/") ||
    (isLocalDevRequest(url) && LOCAL_DEV_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) ||
    STATIC_PATH_PATTERN.test(pathname)
  );
}

function redirectToAccess(request, url) {
  const redirectUrl = new URL(AUTH_PATH, request.url);
  const nextPath = `${url.pathname}${url.search}`;

  if (nextPath !== "/" && !nextPath.startsWith(AUTH_PATH)) {
    redirectUrl.searchParams.set("next", nextPath);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl.toString(),
      "Cache-Control": "no-store",
    },
  });
}

function unauthorizedApiResponse() {
  return new Response(JSON.stringify({ authorized: false }), {
    status: 401,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function getSafeNextPath(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/api/")) {
    return "/home";
  }

  return value === AUTH_PATH ? "/home" : value;
}

export default async function middleware(request) {
  const url = new URL(request.url);

  if (!hasAccessAuthConfig()) {
    return;
  }

  if (isPublicPath(url.pathname, url)) {
    const token = getAccessSessionToken(request.headers.get("cookie"));
    const authorized = token ? await verifyAccessSessionToken(token) : false;

    if (authorized && url.pathname === AUTH_PATH) {
      return new Response(null, {
        status: 302,
        headers: { Location: getSafeNextPath(url.searchParams.get("next")) },
      });
    }

    return;
  }

  const token = getAccessSessionToken(request.headers.get("cookie"));
  const authorized = token ? await verifyAccessSessionToken(token) : false;

  if (authorized) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return unauthorizedApiResponse();
  }

  return redirectToAccess(request, url);
}

export const config = {
  matcher: ["/((?!assets/).*)"],
};
