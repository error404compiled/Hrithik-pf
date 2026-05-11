import { cn } from "@/lib/utils";
import RouterLink from "@/components/RouterLink";

export default function LinkWithIcon({
  href,
  icon,
  position,
  text,
  className,
}) {
  return (
    <RouterLink
      href={href}
      className={cn("link flex items-center gap-2 font-light", className)}
    >
      {position === "left" && icon}
      <span>{text}</span>
      {position === "right" && icon}
    </RouterLink>
  );
}
