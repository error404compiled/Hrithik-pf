import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { chatPostResponse } from "./back-end/functions/shared/chatSupportCore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Dev-only: same contract as Next `/api/chat` (plain text). Keys read from `.env` (not VITE_*). */
function chatSupportDevPlugin(rootDir) {
  return {
    name: "chat-support-dev",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url ?? "").split("?")[0] ?? "";
        if (pathname !== "/api/chat" || req.method !== "POST") {
          next();
          return;
        }
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("error", next);
        req.on("end", async () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            let body = {};
            try {
              body = raw ? JSON.parse(raw) : {};
            } catch {
              body = {};
            }
            const knowledgePath = path.join(
              rootDir,
              "src/data/chatbot-knowledge.json"
            );
            const knowledge = JSON.parse(readFileSync(knowledgePath, "utf8"));
            const mode = server.config.mode;
            const env = loadEnv(mode, rootDir, "");
            const response = await chatPostResponse(
              {
                GOOGLE_API_KEY: env.GOOGLE_API_KEY,
                GEMINI_MODEL: env.GEMINI_MODEL,
              },
              knowledge,
              body
            );
            res.statusCode = response.status;
            response.headers.forEach((value, key) => {
              res.setHeader(key, value);
            });
            const buf = Buffer.from(await response.arrayBuffer());
            res.end(buf);
          } catch (err) {
            next(err);
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), chatSupportDevPlugin(__dirname)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // zod-to-json-schema (transitive via `ai`) imports `zod/v3`; Zod 3.x has no subpath — map to root.
      "zod/v3": path.resolve(__dirname, "node_modules/zod"),
    },
  },
  optimizeDeps: {
    include: ["@mdx-js/mdx", "react/jsx-runtime"],
  },
});
