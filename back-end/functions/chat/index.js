import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chatPostResponse } from "../shared/chatSupportCore.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadKnowledge() {
  const path = join(__dirname, "chatbot-knowledge.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const knowledge = loadKnowledge();

  const env = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
  };

  return chatPostResponse(env, knowledge, body);
}
