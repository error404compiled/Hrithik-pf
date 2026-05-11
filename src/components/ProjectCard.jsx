import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import RouterLink from "@/components/RouterLink";
import Markdown from "react-markdown";
import Icon from "./Icon";
import ImageWithSkeleton from "./ImageWithSkeleton";

export function ProjectCard({ project }) {
  const { name, href, description, image, tags, links } = project;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        {image && (
          <RouterLink href={href || image}>
            <ImageWithSkeleton
              src={image}
              alt={name}
              width={500}
              height={300}
              sizes="(max-width: 640px) calc(100vw - 4rem), 344px"
              quality={75}
              containerClassName="h-40 w-full"
              className="h-40 w-full object-cover object-top"
            />
          </RouterLink>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CardTitle>{name}</CardTitle>
        <div className="prose max-w-full text-pretty font-sans text-xs text-muted-foreground dark:prose-invert">
          <Markdown>{description}</Markdown>
        </div>
      </CardContent>
      <CardFooter className="flex h-full flex-col items-start justify-between gap-4">
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {[...tags].sort().map((tag) => (
              <Badge
                key={tag}
                className="px-1 py-0 text-[10px]"
                variant="secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {links && links.length > 0 && (
          <div className="flex flex-row flex-wrap items-start gap-1">
            {[...links].sort().map((link, idx) => (
              <RouterLink href={link?.href} key={idx} target="_blank">
                <Badge className="flex gap-2 px-2 py-1 text-[10px]">
                  <Icon name={link.icon} className="size-3" />
                  {link.name}
                </Badge>
              </RouterLink>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
