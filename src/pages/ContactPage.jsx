import { Helmet } from "react-helmet-async";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact | HritikSharma.me</title>
      </Helmet>
      <article className="mt-8 flex flex-col gap-8 pb-16">
        <h1 className="title">contact me.</h1>
        <ContactForm />
      </article>
    </>
  );
}
