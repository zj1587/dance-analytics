import fs from "node:fs";
import http from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import middleware from "../middleware.js";
import loginHandler from "../api/auth/login.js";
import logoutHandler from "../api/auth/logout.js";
import sessionHandler from "../api/auth/session.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = join(projectRoot, "dist");
const port = Number(process.env.PORT || 5180);
const host = process.env.HOST || "0.0.0.0";
const apiHandlers = {
  "/api/auth/login": loginHandler,
  "/api/auth/logout": logoutHandler,
  "/api/auth/session": sessionHandler,
};
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function toWebRequest(nodeRequest) {
  const headers = new Headers();

  for (const [name, value] of Object.entries(nodeRequest.headers)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(name, item));
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  return new Request(`http://${nodeRequest.headers.host}${nodeRequest.url}`, {
    headers,
    method: nodeRequest.method,
  });
}

async function sendWebResponse(nodeRequest, nodeResponse, webResponse) {
  nodeResponse.statusCode = webResponse.status;
  webResponse.headers.forEach((value, name) => {
    nodeResponse.setHeader(name, value);
  });

  if (nodeRequest.method === "HEAD" || !webResponse.body) {
    nodeResponse.end();
    return;
  }

  nodeResponse.end(Buffer.from(await webResponse.arrayBuffer()));
}

function handleApiRequest(request, response, pathname) {
  const handler = apiHandlers[pathname];

  if (!handler) {
    return false;
  }

  void Promise.resolve(handler(request, response)).catch((error) => {
    console.error(error);
    if (!response.headersSent) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    response.end(JSON.stringify({ ok: false, message: "Internal server error" }));
  });

  return true;
}

function getStaticFilePath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const safePath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const requestedFilePath = join(distRoot, safePath);

  if (requestedFilePath.startsWith(distRoot) && fs.existsSync(requestedFilePath) && fs.statSync(requestedFilePath).isFile()) {
    return requestedFilePath;
  }

  return join(distRoot, "index.html");
}

function serveStaticFile(request, response, pathname) {
  const filePath = getStaticFilePath(pathname);
  const extension = extname(filePath);

  response.statusCode = 200;
  response.setHeader("Content-Type", contentTypes[extension] || "application/octet-stream");
  response.setHeader("Cache-Control", extension === ".html" ? "no-store" : "public, max-age=31536000, immutable");

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  fs.createReadStream(filePath).pipe(response);
}

if (!fs.existsSync(join(distRoot, "index.html"))) {
  console.error("dist/index.html not found. Run npm run build before npm run preview:auth.");
  process.exit(1);
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    const middlewareResponse = await middleware(toWebRequest(request));

    if (middlewareResponse) {
      await sendWebResponse(request, response, middlewareResponse);
      return;
    }

    if (handleApiRequest(request, response, url.pathname)) {
      return;
    }

    serveStaticFile(request, response, url.pathname);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end("Internal server error");
  }
});

server.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "localhost" : host;

  console.log(`Local auth preview server running at http://${displayHost}:${port}`);
});
