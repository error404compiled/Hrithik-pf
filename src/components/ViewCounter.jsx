import { formatViews } from "@/lib/utils";
import { apiUrl } from "@/lib/apiBase";
import { ID, Query } from "appwrite";
import {
  getAppwriteServices,
  isAppwriteConfigured,
} from "@/lib/appwriteClient";
import { useEffect, useState } from "react";

export default function ViewCounter({ slug, initialCount }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const incrementViews = async () => {
      try {
        if (isAppwriteConfigured()) {
          const services = getAppwriteServices();
          const { databases, config } = services;

          const existing = await databases.listDocuments(
            config.databaseId,
            config.viewsCollectionId,
            [Query.equal("slug", slug), Query.limit(1)],
          );

          if (!isMounted) return;

          if (existing.documents.length === 0) {
            const created = await databases.createDocument(
              config.databaseId,
              config.viewsCollectionId,
              ID.unique(),
              {
                slug,
                views: 1,
                updatedAt: new Date().toISOString(),
              },
            );
            if (isMounted && typeof created.views === "number") {
              setCount(created.views);
            } else if (isMounted) {
              setCount(1);
            }
            return;
          }

          const doc = existing.documents[0];
          const nextViews = Number(doc.views || 0) + 1;
          const updated = await databases.updateDocument(
            config.databaseId,
            config.viewsCollectionId,
            doc.$id,
            {
              views: nextViews,
              updatedAt: new Date().toISOString(),
            },
          );
          if (isMounted && typeof updated.views === "number") {
            setCount(updated.views);
          } else if (isMounted) {
            setCount(nextViews);
          }
          return;
        }

        // Legacy fallback (if Appwrite is not configured)
        const res = await fetch(apiUrl(`/api/views/${slug}`), {
          method: "POST",
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.views === "number") {
            setCount(data.views);
          }
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        console.error("Unexpected error incrementing views", error);
      }
    };

    incrementViews();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [slug]);

  return <span>{formatViews(count)} views</span>;
}
