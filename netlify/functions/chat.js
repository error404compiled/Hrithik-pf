import { chatPostResponse } from "../../back-end/functions/shared/chatSupportCore.js";
import knowledge from "./chatbot-knowledge.json";

/**
 * Netlify Function — same contract as Vite dev `/api/chat` (plain text or JSON error).
 * Set `GOOGLE_API_KEY` (and optional `GEMINI_MODEL`) in Netlify → Site configuration → Environment variables.
 */
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    body = {};
  }

  const env = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
  };

  const response = await chatPostResponse(env, knowledge, body);
  const text = await response.text();
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    statusCode: response.status,
    headers,
    body: text,
  };
}
