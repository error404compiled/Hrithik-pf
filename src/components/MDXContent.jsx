import { evaluate } from "@mdx-js/mdx";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { highlight } from "sugar-high";
import Counter from "./Counter";
import Mermaid from "./Mermaid";
import {
  Table as UITable,
  TableBody as UITableBody,
  TableCell as UITableCell,
  TableHead as UITableHead,
  TableHeader as UITableHeader,
  TableRow as UITableRow,
} from "./ui/table";
import { cn } from "@/lib/utils";

const EMPTY_COMPONENTS = {};
const EMPTY_OPTIONS = {};

function Code({ children, ...props }) {
  const className = props.className ?? "";

  if (className.includes("language-mermaid")) {
    return <Mermaid chart={String(children).trim()} />;
  }

  const codeHTML = highlight(String(children));
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
}

function Table(props) {
  const { className, ...rest } = props;
  return (
    <div className="my-8">
      <UITable
        className={cn(
          "w-full text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3",
          className,
        )}
        {...rest}
      />
    </div>
  );
}

function TableHeaderSection(props) {
  const { className, ...rest } = props;
  return (
    <UITableHeader
      {...rest}
      className={cn(
        "bg-muted/70 text-foreground [&_tr]:border-b [&_tr]:border-border/60",
        "[&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide",
        className,
      )}
    />
  );
}

const baseComponents = {
  code: Code,
  Counter,
  table: Table,
  thead: TableHeaderSection,
  tbody: UITableBody,
  th: UITableHead,
  td: UITableCell,
  tr: UITableRow,
};

export default function MDXContent({
  source,
  components: componentsProp = EMPTY_COMPONENTS,
  options: optionsProp = EMPTY_OPTIONS,
}) {
  const [Content, setContent] = useState(null);
  const [useMarkdownFallback, setUseMarkdownFallback] = useState(false);

  const mergedComponents = useMemo(
    () => ({
      ...baseComponents,
      ...componentsProp,
    }),
    [componentsProp],
  );

  const remarkPlugins = useMemo(
    () => [remarkGfm, ...(optionsProp?.mdxOptions?.remarkPlugins || [])],
    [optionsProp],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await evaluate(source, {
          Fragment,
          jsx,
          jsxs,
          development: false,
          baseUrl: import.meta.url,
          remarkPlugins,
          useMDXComponents: () => mergedComponents,
        });
        if (!cancelled) {
          setContent(() => mod.default);
          setUseMarkdownFallback(false);
        }
      } catch (err) {
        console.error("MDX evaluate failed:", err);
        if (!cancelled) {
          setContent(null);
          setUseMarkdownFallback(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, mergedComponents, remarkPlugins]);

  if (useMarkdownFallback) {
    return (
      <ReactMarkdown remarkPlugins={remarkPlugins} components={mergedComponents}>
        {source}
      </ReactMarkdown>
    );
  }

  if (!Content) {
    return null;
  }

  return <Content />;
}
