import http from "node:http";
import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import middleware from "../middleware.js";
import loginHandler from "../api/auth/login.js";
import logoutHandler from "../api/auth/logout.js";
import sessionHandler from "../api/auth/session.js";

if (process.platform === "win32") {
  const originalExec = childProcess.exec;

  childProcess.exec = function exec(command, options, callback) {
    if (command === "net use") {
      const done = typeof options === "function" ? options : callback;

      if (done) {
        queueMicrotask(() => done(null, "", ""));
      }

      return {
        kill() {},
        on() {
          return this;
        },
        once() {
          return this;
        },
      };
    }

    return originalExec.apply(this, arguments);
  };
  syncBuiltinESMExports();
}

const [{ createServer: createViteServer }, { default: react }] = await Promise.all([
  import("vite"),
  import("@vitejs/plugin-react"),
]);

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 5180);
const host = process.env.HOST || "0.0.0.0";
const apiHandlers = {
  "/api/auth/login": loginHandler,
  "/api/auth/logout": logoutHandler,
  "/api/auth/session": sessionHandler,
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

  const body = Buffer.from(await webResponse.arrayBuffer());
  nodeResponse.end(body);
}

function handleApiRequest(request, response) {
  const pathname = new URL(request.url ?? "/", `http://${request.headers.host}`).pathname;
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

const vite = await createViteServer({
  appType: "spa",
  clearScreen: false,
  configFile: false,
  plugins: [react()],
  root: projectRoot,
  server: {
    middlewareMode: true,
  },
});

const server = http.createServer(async (request, response) => {
  try {
    const middlewareResponse = await middleware(toWebRequest(request));

    if (middlewareResponse) {
      await sendWebResponse(request, response, middlewareResponse);
      return;
    }

    if (handleApiRequest(request, response)) {
      return;
    }

    vite.middlewares(request, response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end("Internal server error");
  }
});

server.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "localhost" : host;

  console.log(`Local auth dev server running at http://${displayHost}:${port}`);
  console.log("Set ACCESS_CODES and ACCESS_SESSION_SECRET before running this command.");
});
