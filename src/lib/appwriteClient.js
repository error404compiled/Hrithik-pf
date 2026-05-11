import { Account, Client, Databases } from "appwrite";

function clean(value) {
  return String(value || "").trim();
}

export function getAppwriteConfig() {
  return {
    endpoint: clean(import.meta.env.VITE_APPWRITE_ENDPOINT),
    projectId: clean(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    databaseId: clean(import.meta.env.VITE_APPWRITE_DATABASE_ID || "portfolio"),
    contactCollectionId: clean(
      import.meta.env.VITE_APPWRITE_CONTACT_COLLECTION_ID || "contact_submissions",
    ),
    viewsCollectionId: clean(
      import.meta.env.VITE_APPWRITE_VIEWS_COLLECTION_ID || "post_views",
    ),
    postsCollectionId: clean(import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID || "posts"),
    adminEmail: clean(import.meta.env.VITE_ADMIN_EMAIL),
    contactFunctionUrl: clean(import.meta.env.VITE_APPWRITE_CONTACT_URL),
    viewsFunctionUrl: clean(import.meta.env.VITE_APPWRITE_VIEWS_URL),
  };
}

export function isAppwriteConfigured() {
  const cfg = getAppwriteConfig();
  return Boolean(cfg.endpoint && cfg.projectId);
}

let cached = null;

export function getAppwriteServices() {
  if (!isAppwriteConfigured()) return null;
  if (cached) return cached;

  const cfg = getAppwriteConfig();
  const client = new Client().setEndpoint(cfg.endpoint).setProject(cfg.projectId);
  cached = {
    account: new Account(client),
    databases: new Databases(client),
    config: cfg,
  };
  return cached;
}

