import Markdown from "react-markdown";
import { Helmet } from "react-helmet-async";
import privacyMarkdown from "@/data/privacy.md?raw";

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy | HritikSharma.me</title>
      </Helmet>
      <article className="mt-8 flex flex-col gap-8 pb-16">
        <h1 className="title">privacy policy.</h1>
        <div className="prose dark:prose-invert">
          <Markdown>{privacyMarkdown}</Markdown>
        </div>
      </article>
    </>
  );
}
