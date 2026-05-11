import { getAppwriteServices } from "../shared/appwriteClient.js";

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function maybeSendResendEmail({ name, email, message }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) return { skipped: true };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `New contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend failed: ${detail}`);
  }
  return { skipped: false };
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const message = String(body?.message || "").trim();

    if (!name || !email || !message) {
      return json(400, { error: "name, email, and message are required" });
    }

    const { databases, ID } = getAppwriteServices();
    const databaseId = process.env.APPWRITE_DATABASE_ID || "portfolio";
    const collectionId =
      process.env.APPWRITE_CONTACT_COLLECTION_ID || "contact_submissions";

    const now = new Date().toISOString();
    const doc = await databases.createDocument(databaseId, collectionId, ID.unique(), {
      name,
      email,
      message,
      createdAt: now,
    });

    await maybeSendResendEmail({ name, email, message });

    return json(200, { success: true, id: doc.$id });
  } catch (error) {
    console.error("[contact function]", error);
    return json(500, {
      error: "Internal Server Error",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

