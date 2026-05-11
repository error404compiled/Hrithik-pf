import { apiUrl } from "./apiBase";
import { ID } from "appwrite";
import { getAppwriteServices, isAppwriteConfigured } from "./appwriteClient";

/**
 * Frontend-only contact submission. Point VITE_API_BASE_URL at your Appwrite
 * function or BFF that replaces the former Next.js server action.
 */
export async function sendContactEmail(data) {
  try {
    if (isAppwriteConfigured()) {
      const services = getAppwriteServices();
      const { databases, config } = services;

      await databases.createDocument(
        config.databaseId,
        config.contactCollectionId,
        ID.unique(),
        {
          name: data.name,
          email: data.email,
          message: data.message,
          createdAt: new Date().toISOString(),
        },
      );

      // Optional email notification via Appwrite function URL.
      if (config.contactFunctionUrl) {
        try {
          await fetch(config.contactFunctionUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } catch (err) {
          console.warn("Contact email function call failed:", err);
        }
      }

      return { success: true };
    }

    const res = await fetch(apiUrl("/api/contact"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    let body;
    try {
      body = await res.json();
    } catch {
      body = {};
    }

    if (!res.ok) {
      return { error: body?.error ?? { _form: ["Request failed"] } };
    }

    return { success: true, ...body };
  } catch (error) {
    return {
      error: {
        _form: [
          error instanceof Error
            ? error.message
            : "Contact submission failed. Check Appwrite setup.",
        ],
      },
    };
  }
}
