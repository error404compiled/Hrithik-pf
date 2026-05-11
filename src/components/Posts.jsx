import { formatDate, formatViews } from "@/lib/utils";
import { Calendar, Clock, Edit3, Eye } from "lucide-react";
import RouterLink from "@/components/RouterLink";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

const MAX_TAGS_DISPLAYED = 3;

export default function Posts({ posts }) {
  return (
    posts.length > 0 && (
      <Card className="overflow-hidden">
        <ul className="divide-y divide-border">
          {posts.map((post) => {
            const viewCount = typeof post.views === "number" ? post.views : 0;
            const href = post.externalUrl || `/blog/${post.slug}`;
            const isExternal = Boolean(post.externalUrl);
            return (
              <li key={post.slug} className="group">
                <RouterLink
                  href={href}
                  className="block"
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
                  <article className="p-6 transition-colors hover:bg-muted/30">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="line-clamp-2 min-h-[2.5em] text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                            {post.title}
                          </h3>

                          {post.draft && (
                            <Badge className="bg-orange-500 text-xs text-white">
                              Draft
                            </Badge>
                          )}
                        </div>

                        <p className="mb-3 line-clamp-2 min-h-[3.25em] text-sm leading-relaxed text-muted-foreground">
                          {post.summary ?? ""}
                        </p>

                        <div className="flex min-h-6 flex-wrap gap-1.5">
                          {post.tags
                            ?.slice(0, MAX_TAGS_DISPLAYED)
                            .map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="px-2 py-1 text-xs font-medium"
                              >
                                {tag}
                              </Badge>
                            ))}
                          {(post.tags?.length ?? 0) > MAX_TAGS_DISPLAYED && (
                            <Badge
                              variant="outline"
                              className="px-2 py-1 text-xs"
                            >
                              +{post.tags.length - MAX_TAGS_DISPLAYED}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 flex-col items-start gap-2 text-sm text-muted-foreground sm:items-end">
                        {post.publishedAt && (
                          <div className="flex items-center gap-1.5">
                            {post.updatedAt ? (
                              <>
                                <Edit3 className="h-3.5 w-3.5" />
                                <span className="font-medium">Updated</span>
                                <span>{formatDate(post.updatedAt)}</span>
                              </>
                            ) : (
                              <>
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(post.publishedAt)}</span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{post.readingTime} read</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{formatViews(viewCount)} views</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </RouterLink>
              </li>
            );
          })}
        </ul>
      </Card>
    )
  );
}
