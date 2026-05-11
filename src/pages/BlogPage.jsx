import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import PostsSkeleton from "@/components/PostsSkeleton";
import PostsWithSearch from "@/components/PostsWithSearch";
import { getPosts } from "@/lib/posts";

export default function BlogPage() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await getPosts();
      if (!cancelled) setPosts(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Blog | HritikSharma.me</title>
      </Helmet>
      <article className="mt-8 flex flex-col gap-8 pb-16">
        <h1 className="title">my blog.</h1>

        {posts === null ? (
          <PostsSkeleton rows={6} showControls />
        ) : (
          <PostsWithSearch posts={posts} />
        )}
      </article>
    </>
  );
}
