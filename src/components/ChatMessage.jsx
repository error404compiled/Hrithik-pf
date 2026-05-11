import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import Markdown from "react-markdown";
import RouterLink from "@/components/RouterLink";

export default function ChatMessage({
  message: { role, content },
}) {
  const isBot = role === "assistant";

  return (
    <div
      className={cn(
        "mb-3 flex items-start sm:mb-4",
        isBot ? "justify-start" : "justify-end",
      )}
    >
      {isBot && <Bot className="mr-2 mt-0.5 size-4 sm:mr-2.5 sm:size-5" />}
      <div
        className={cn(
          "min-w-0 max-w-[220px] break-words rounded-lg border px-3 py-2 text-sm shadow-sm sm:max-w-72 sm:px-4 sm:py-2.5 sm:text-base",
          isBot ? "bg-background" : "bg-foreground text-background",
        )}
      >
        <Markdown
          components={{
            a: ({ href, children, ...props }) => (
              <RouterLink
                href={href ?? ""}
                className="break-words underline underline-offset-2"
                {...props}
              >
                {children}
              </RouterLink>
            ),
            p: ({ ...props }) => <p className="mt-3 first:mt-0" {...props} />,
            ul: ({ ...props }) => (
              <ul
                className="mt-3 list-inside list-disc first:mt-0"
                {...props}
              />
            ),
          }}
        >
          {content}
        </Markdown>
      </div>
    </div>
  );
}
