import { Helmet } from "react-helmet-async";
import Projects from "@/components/Projects";

export default function ProjectsPage() {
  return (
    <>
      <Helmet>
        <title>Projects | HritikSharma.me</title>
      </Helmet>
      <article className="mt-8 flex flex-col gap-8 pb-16">
        <h1 className="title">my projects.</h1>
        <Projects />
      </article>
    </>
  );
}
