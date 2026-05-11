import { ID, Permission, Query, Role } from "appwrite";
import { getAppwriteServices, isAppwriteConfigured } from "./appwriteClient";

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeExternalUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function toPostSummary(doc, viewsBySlug) {
  const views = Number(viewsBySlug?.[doc.slug] ?? doc.views ?? 0);
  return {
    id: doc.$id,
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary || "",
    image: doc.image || "",
    publishedAt: doc.publishedAt || "",
    updatedAt: doc.updatedAt || "",
    tags: splitCsv(doc.tags),
    readingTime: doc.readingTime || "5 min",
    draft: Boolean(doc.draft),
    coAuthors: splitCsv(doc.coAuthors),
    views,
    externalUrl: doc.externalUrl || "",
  };
}

function toPostDetail(doc, viewsBySlug) {
  return {
    ...toPostSummary(doc, viewsBySlug),
    content: doc.content || "",
  };
}

async function getViewsBySlugMap(databases, databaseId, viewsCollectionId) {
  const response = await databases.listDocuments(databaseId, viewsCollectionId, [
    Query.limit(5000),
  ]);
  const bySlug = {};
  for (const doc of response.documents) {
    if (!doc.slug) continue;
    bySlug[doc.slug] = Number(doc.views || 0);
  }
  return bySlug;
}

export async function getPosts(limit) {
  if (!isAppwriteConfigured()) return [];
  try {
    const { databases, config } = getAppwriteServices();
    const [postsRes, viewsBySlug] = await Promise.all([
      databases.listDocuments(config.databaseId, config.postsCollectionId, [
        Query.orderDesc("publishedAt"),
        Query.limit(5000),
      ]),
      getViewsBySlugMap(databases, config.databaseId, config.viewsCollectionId),
    ]);

    const posts = postsRes.documents.map((doc) => toPostSummary(doc, viewsBySlug));
    return typeof limit === "number" ? posts.slice(0, limit) : posts;
  } catch (err) {
    console.error("Error fetching posts from Appwrite:", err);
    return [];
  }
}

export async function getPostBySlug(slug) {
  if (!isAppwriteConfigured()) return null;
  if (!slug) return null;
  try {
    const { databases, config } = getAppwriteServices();
    const [postsRes, viewsBySlug] = await Promise.all([
      databases.listDocuments(config.databaseId, config.postsCollectionId, [
        Query.equal("slug", slug),
        Query.limit(1),
      ]),
      getViewsBySlugMap(databases, config.databaseId, config.viewsCollectionId),
    ]);

    const doc = postsRes.documents[0];
    if (!doc) return null;
    return toPostDetail(doc, viewsBySlug);
  } catch (err) {
    console.error(`Error fetching post ${slug} from Appwrite:`, err);
    return null;
  }
}

export async function listPostsForAdmin() {
  if (!isAppwriteConfigured()) return [];
  const { databases, config } = getAppwriteServices();
  const response = await databases.listDocuments(config.databaseId, config.postsCollectionId, [
    Query.orderDesc("updatedAt"),
    Query.limit(5000),
  ]);
  return response.documents.map((doc) => ({
    id: doc.$id,
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary || "",
    image: doc.image || "",
    content: doc.content || "",
    publishedAt: doc.publishedAt || "",
    updatedAt: doc.updatedAt || "",
    tags: doc.tags || "",
    coAuthors: doc.coAuthors || "",
    readingTime: doc.readingTime || "5 min",
    draft: Boolean(doc.draft),
    externalUrl: doc.externalUrl || "",
  }));
}

export async function createPostForAdmin(payload, userId) {
  const { databases, config } = getAppwriteServices();
  const now = new Date().toISOString();
  return databases.createDocument(
    config.databaseId,
    config.postsCollectionId,
    ID.unique(),
    {
      ...payload,
      externalUrl: normalizeExternalUrl(payload.externalUrl),
      updatedAt: payload.updatedAt || now,
      publishedAt: payload.publishedAt || now,
    },
    [
      Permission.read(Role.any()),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  );
}

export async function updatePostForAdmin(documentId, payload) {
  const { databases, config } = getAppwriteServices();
  return databases.updateDocument(
    config.databaseId,
    config.postsCollectionId,
    documentId,
    {
      ...payload,
      externalUrl: normalizeExternalUrl(payload.externalUrl),
      updatedAt: new Date().toISOString(),
    },
  );
}

function parseCsvRows(csvText) {
  const lines = String(csvText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes("title") && (header.includes("url") || header.includes("link"));
  const body = hasHeader ? lines.slice(1) : lines;

  const rows = [];
  for (const line of body) {
    const firstComma = line.indexOf(",");
    if (firstComma === -1) continue;
    const first = line.slice(0, firstComma).trim().replace(/^"|"$/g, "");
    const second = line.slice(firstComma + 1).trim().replace(/^"|"$/g, "");

    const looksLikeUrl = /^(https?:\/\/|www\.)/i.test(first);
    const title = looksLikeUrl ? second : first;
    const externalUrl = looksLikeUrl ? first : second;
    if (!title || !externalUrl) continue;
    rows.push({ title, externalUrl: normalizeExternalUrl(externalUrl) });
  }
  return rows;
}

export async function replacePostsFromCsvForAdmin(csvText, userId) {
  const { databases, config } = getAppwriteServices();
  const parsed = parseCsvRows(csvText);

  const deduped = [];
  const seen = new Set();
  for (const row of parsed) {
    const key = `${row.title.toLowerCase()}|${row.externalUrl.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }

  // Rewrite set: delete all current posts, then insert deduped CSV rows.
  const existing = await databases.listDocuments(config.databaseId, config.postsCollectionId, [
    Query.limit(5000),
  ]);
  await Promise.all(
    existing.documents.map((doc) =>
      databases.deleteDocument(config.databaseId, config.postsCollectionId, doc.$id),
    ),
  );

  const slugCounts = new Map();
  for (const row of deduped) {
    const base = slugify(row.title || row.externalUrl) || "post";
    const n = slugCounts.get(base) || 0;
    slugCounts.set(base, n + 1);
    const slug = n === 0 ? base : `${base}-${n + 1}`;

    await createPostForAdmin(
      {
        slug,
        title: row.title,
        summary: "",
        image: "",
        // Keep a small body so post schema stays valid even for external-link mode.
        content: `Read this article on external source: ${row.externalUrl}`,
        tags: "",
        coAuthors: "",
        readingTime: "External",
        draft: false,
        externalUrl: row.externalUrl,
        publishedAt: new Date().toISOString(),
      },
      userId,
    );
  }

  return {
    imported: deduped.length,
    removedDuplicates: parsed.length - deduped.length,
  };
}
