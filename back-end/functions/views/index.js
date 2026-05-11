import { getAppwriteServices } from "../shared/appwriteClient.js";

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const body = await req.json();
    const slug = String(body?.slug || "").trim();
    if (!slug) return json(400, { error: "slug is required" });

    const { databases, ID, Query } = getAppwriteServices();
    const databaseId = process.env.APPWRITE_DATABASE_ID || "portfolio";
    const collectionId = process.env.APPWRITE_VIEWS_COLLECTION_ID || "post_views";
    const now = new Date().toISOString();

    const existing = await databases.listDocuments(databaseId, collectionId, [
      Query.equal("slug", slug),
      Query.limit(1),
    ]);

    if (existing.documents.length === 0) {
      const created = await databases.createDocument(databaseId, collectionId, ID.unique(), {
        slug,
        views: 1,
        updatedAt: now,
      });
      return json(200, { slug, views: created.views ?? 1 });
    }

    const doc = existing.documents[0];
    const nextViews = Number(doc.views || 0) + 1;
    const updated = await databases.updateDocument(databaseId, collectionId, doc.$id, {
      views: nextViews,
      updatedAt: now,
    });

    return json(200, { slug, views: updated.views ?? nextViews });
  } catch (error) {
    console.error("[views function]", error);
    return json(500, {
      error: "Internal Server Error",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

