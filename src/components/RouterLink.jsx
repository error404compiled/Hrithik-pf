import { Link } from "react-router-dom";

/**
 * Drop-in replacement for next/link: internal paths use React Router; http(s)/mailto use <a>.
 */
export default function RouterLink({ href, children, className, ...rest }) {
  if (!href) return null;
  const isExternal =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("//");
  if (isExternal) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
