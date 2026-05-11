import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import BlogImage from "@/components/BlogImage";
import LinkWithIcon from "@/components/LinkWithIcon";
import MDXContent from "@/components/MDXContent";
import NotFoundPage from "@/pages/NotFoundPage";
import ViewCounter from "@/components/ViewCounter";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { getPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  Edit3Icon,
  EyeIcon,
  UsersIcon,
} from "lucide-react";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await getPostBySlug(slug);
      if (!cancelled) setPost(p);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (post === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  if (!post) {
    return <NotFoundPage />;
  }

  const {
    title,
    image,
    publishedAt,
    updatedAt,
    tags,
    summary,
    readingTime,
    draft,
    coAuthors,
    views,
    externalUrl,
  } = post;

  const initialViewCount = typeof views === "number" ? views : 0;

  const shouldShowUpdated =
    updatedAt &&
    updatedAt !== publishedAt &&
    new Date(updatedAt).getTime() >
      new Date(publishedAt || updatedAt).getTime();

  return (
    <>
      <Helmet>
        <title>{`${title} | HritikSharma.me`}</title>
        {summary && <meta name="description" content={summary} />}
        {summary && <meta property="og:title" content={title} />}
        {summary && <meta property="og:description" content={summary} />}
        {image && <meta property="og:image" content={image} />}
      </Helmet>
      <div className="min-h-screen bg-background">
        <nav className="mb-12">
          <LinkWithIcon
            href="/blog"
            position="left"
            icon={<ArrowLeftIcon className="size-4" />}
            text="Back to blog"
            className="text-muted-foreground transition-colors hover:text-foreground"
          />
        </nav>

        <article className="mx-auto max-w-4xl px-4">
          {draft && (
            <div className="mb-12">
              <div className="overflow-hidden rounded-lg border border-orange-200 bg-orange-50 shadow-sm dark:border-orange-800 dark:bg-orange-950">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <AlertTriangleIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <p className="text-sm leading-relaxed text-orange-700 dark:text-orange-300">
                      This content is in progress and may contain incomplete or
                      unpolished sections.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {image && <BlogImage src={image} alt={title || ""} />}

          <header className="mb-16">
            <div className="space-y-6">
              <h1 className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                {title}
              </h1>

              {summary && (
                <p className="max-w-3xl text-xl leading-relaxed text-muted-foreground/90">
                  {summary}
                </p>
              )}

              <div className="flex flex-col gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4" />
                    <span>{readingTime}</span>
                  </div>

                  <Separator
                    orientation="vertical"
                    className="hidden h-4 sm:block"
                  />

                  <div className="flex items-center gap-1.5">
                    <EyeIcon className="h-4 w-4" />
                    <ViewCounter slug={slug} initialCount={initialViewCount} />
                  </div>

                  <Separator
                    orientation="vertical"
                    className="hidden h-4 sm:block"
                  />

                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Published {formatDate(publishedAt ?? "")}</span>
                  </div>

                  {shouldShowUpdated && updatedAt && (
                    <>
                      <Separator
                        orientation="vertical"
                        className="hidden h-4 sm:block"
                      />
                      <div className="flex items-center gap-1.5">
                        <Edit3Icon className="h-4 w-4" />
                        <span>Updated {formatDate(updatedAt)}</span>
                      </div>
                    </>
                  )}
                </div>

                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-3 py-1 text-xs font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {coAuthors && coAuthors.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <UsersIcon className="h-4 w-4" />
                    <span>
                      Co-authored with{" "}
                      <span className="font-semibold text-foreground">
                        {coAuthors.join(", ")}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="prose prose-lg max-w-none dark:prose-invert">
            {externalUrl ? (
              <div className="rounded-lg border bg-muted/30 p-6">
                <p className="text-sm text-muted-foreground">
                  This article is hosted externally.
                </p>
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block underline underline-offset-4"
                >
                  Open article
                </a>
              </div>
            ) : (
              <MDXContent source={post.content} />
            )}
          </main>

          <footer className="mt-24">
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="p-6">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {draft && (
                      <p className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <Edit3Icon className="h-3.5 w-3.5" />
                        <span className="font-semibold">Draft</span>
                      </p>
                    )}

                    <div className="flex flex-col gap-1">
                      {shouldShowUpdated && updatedAt ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span className="font-medium">
                              Published {formatDate(publishedAt ?? "")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Edit3Icon className="h-3.5 w-3.5" />
                            <span className="font-medium">
                              Updated {formatDate(updatedAt)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span className="font-medium">
                            Published {formatDate(publishedAt ?? "")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <LinkWithIcon
                    href="/blog"
                    position="right"
                    icon={<ArrowLeftIcon className="size-4 rotate-180" />}
                    text="More posts"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  />
                </div>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </>
  );
}
