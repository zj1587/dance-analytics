import { getAccessSessionToken, verifyAccessSessionToken } from "../_access-session.js";

export default async function handler(request, response) {
  const token = getAccessSessionToken(request.headers.cookie);
  const authorized = token ? await verifyAccessSessionToken(token) : false;

  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.statusCode = authorized ? 200 : 401;
  response.end(JSON.stringify({ authorized }));
}
