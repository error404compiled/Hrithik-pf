import { Client, Databases, Permission, Role } from "node-appwrite";
import fs from "node:fs";
import path from "node:path";

function loadDotEnvLikeFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function req(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

async function ensureDatabase(databases, databaseId) {
  try {
    await databases.get(databaseId);
    console.log(`Database exists: ${databaseId}`);
  } catch {
    await databases.create(databaseId, "Portfolio");
    console.log(`Created database: ${databaseId}`);
  }
}

async function ensureCollection(databases, databaseId, collectionId, name) {
  try {
    await databases.getCollection(databaseId, collectionId);
    console.log(`Collection exists: ${collectionId}`);
  } catch {
    await databases.createCollection(databaseId, collectionId, name, [
      Permission.read(Role.any()),
      Permission.create(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ]);
    console.log(`Created collection: ${collectionId}`);
  }
}

async function ensurePostsCollection(databases, databaseId, collectionId, name) {
  try {
    await databases.getCollection(databaseId, collectionId);
    console.log(`Collection exists: ${collectionId}`);
  } catch {
    await databases.createCollection(databaseId, collectionId, name, [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ]);
    console.log(`Created collection: ${collectionId}`);
  }
}

async function ensureStringAttr(databases, databaseId, collectionId, key, size, required) {
  try {
    await databases.createStringAttribute(databaseId, collectionId, key, size, required);
    console.log(`Created string attribute: ${collectionId}.${key}`);
  } catch {
    console.log(`Attribute exists/skipped: ${collectionId}.${key}`);
  }
}

async function ensureIntegerAttr(databases, databaseId, collectionId, key, required, def) {
  try {
    await databases.createIntegerAttribute(databaseId, collectionId, key, required, undefined, undefined, def);
    console.log(`Created integer attribute: ${collectionId}.${key}`);
  } catch {
    console.log(`Attribute exists/skipped: ${collectionId}.${key}`);
  }
}

async function ensureBooleanAttr(databases, databaseId, collectionId, key, required, def) {
  try {
    await databases.createBooleanAttribute(databaseId, collectionId, key, required, def);
    console.log(`Created boolean attribute: ${collectionId}.${key}`);
  } catch {
    console.log(`Attribute exists/skipped: ${collectionId}.${key}`);
  }
}

async function ensureIndex(databases, databaseId, collectionId, key, type, attributes) {
  try {
    await databases.createIndex(databaseId, collectionId, key, type, attributes);
    console.log(`Created index: ${collectionId}.${key}`);
  } catch {
    console.log(`Index exists/skipped: ${collectionId}.${key}`);
  }
}

async function main() {
  const localEnvPath = path.resolve(process.cwd(), ".env");
  loadDotEnvLikeFile(localEnvPath);

  const endpoint = req("APPWRITE_ENDPOINT");
  const projectId = req("APPWRITE_PROJECT_ID");
  const apiKey = req("APPWRITE_API_KEY");
  const databaseId = process.env.APPWRITE_DATABASE_ID || "portfolio";
  const contactCollectionId =
    process.env.APPWRITE_CONTACT_COLLECTION_ID || "contact_submissions";
  const viewsCollectionId = process.env.APPWRITE_VIEWS_COLLECTION_ID || "post_views";
  const postsCollectionId = process.env.APPWRITE_POSTS_COLLECTION_ID || "posts";

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  await ensureDatabase(databases, databaseId);

  await ensureCollection(databases, databaseId, contactCollectionId, "Contact Submissions");
  await ensureStringAttr(databases, databaseId, contactCollectionId, "name", 200, true);
  await ensureStringAttr(databases, databaseId, contactCollectionId, "email", 320, true);
  await ensureStringAttr(databases, databaseId, contactCollectionId, "message", 10000, true);
  await ensureStringAttr(databases, databaseId, contactCollectionId, "createdAt", 64, true);
  await ensureIndex(databases, databaseId, contactCollectionId, "contact_createdAt", "key", [
    "createdAt",
  ]);

  await ensureCollection(databases, databaseId, viewsCollectionId, "Post Views");
  await ensureStringAttr(databases, databaseId, viewsCollectionId, "slug", 300, true);
  await ensureIntegerAttr(databases, databaseId, viewsCollectionId, "views", true, 0);
  await ensureStringAttr(databases, databaseId, viewsCollectionId, "updatedAt", 64, true);
  await ensureIndex(databases, databaseId, viewsCollectionId, "views_slug_unique", "unique", [
    "slug",
  ]);

  await ensurePostsCollection(databases, databaseId, postsCollectionId, "Blog Posts");
  await ensureStringAttr(databases, databaseId, postsCollectionId, "slug", 300, true);
  await ensureStringAttr(databases, databaseId, postsCollectionId, "title", 300, true);
  await ensureStringAttr(databases, databaseId, postsCollectionId, "summary", 5000, false);
  await ensureStringAttr(databases, databaseId, postsCollectionId, "image", 2000, false);
  await ensureStringAttr(databases, databaseId, postsCollectionId, "externalUrl", 2000, false);
  await ensureStringAttr(databases, databaseId, postsCollectionId, "content", 100000, true);
  await ensureStringAttr(databases, databaseId, postsCollectionId, "tags", 5000, false);
  await ensureStringAttr(databases, databaseId, postsCollectionId, "coAuthors", 5000, false);
  await ensureStringAttr(databases, databaseId, postsCollectionId, "readingTime", 100, false);
  await ensureBooleanAttr(databases, databaseId, postsCollectionId, "draft", true, true);
  await ensureStringAttr(databases, databaseId, postsCollectionId, "publishedAt", 64, true);
  await ensureStringAttr(databases, databaseId, postsCollectionId, "updatedAt", 64, true);
  await ensureIntegerAttr(databases, databaseId, postsCollectionId, "views", false, 0);
  await ensureIndex(databases, databaseId, postsCollectionId, "posts_slug_unique", "unique", [
    "slug",
  ]);

  console.log("Appwrite bootstrap completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

