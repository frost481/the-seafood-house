const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "catch.json");
const PORT = process.env.PORT || 8733;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "TheSeafoodHouse1";

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ availability: {}, updatedAt: null }, null, 2));
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon"
};

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (e) {
    return { availability: {}, updatedAt: null };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function isAuthorized(req) {
  const header = req.headers["authorization"] || "";
  const match = header.match(/^Bearer (.+)$/);
  return !!match && match[1] === ADMIN_TOKEN;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(req, res, pathname) {
  let rel = pathname === "/" ? "/index.html" : pathname;
  rel = path.normalize(rel).replace(/^(\.\.[/\\])+/, "");
  const fullPath = path.join(ROOT, rel);
  if (!fullPath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(fullPath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === "/api/health") {
    sendJSON(res, 200, { ok: true });
    return;
  }

  if (pathname === "/api/catch" && req.method === "GET") {
    sendJSON(res, 200, readData());
    return;
  }

  if (pathname === "/api/catch/bulk" && req.method === "POST") {
    if (!isAuthorized(req)) return sendJSON(res, 401, { error: "Unauthorized" });
    try {
      const parsed = await readBody(req);
      const data = readData();
      (parsed.ids || []).forEach((id) => {
        data.availability[id] = !!parsed.available;
      });
      data.updatedAt = new Date().toISOString();
      writeData(data);
      sendJSON(res, 200, data);
    } catch (e) {
      sendJSON(res, 400, { error: "Bad JSON" });
    }
    return;
  }

  if (pathname.startsWith("/api/catch/") && req.method === "POST") {
    if (!isAuthorized(req)) return sendJSON(res, 401, { error: "Unauthorized" });
    const id = decodeURIComponent(pathname.slice("/api/catch/".length));
    try {
      const parsed = await readBody(req);
      const data = readData();
      data.availability[id] = !!parsed.available;
      data.updatedAt = new Date().toISOString();
      writeData(data);
      sendJSON(res, 200, data);
    } catch (e) {
      sendJSON(res, 400, { error: "Bad JSON" });
    }
    return;
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`The Seafood House site running at http://localhost:${PORT}`);
  console.log(`Admin token: ${ADMIN_TOKEN}${process.env.ADMIN_TOKEN ? " (from ADMIN_TOKEN env var)" : " (default — set ADMIN_TOKEN env var to change it)"}`);
});
