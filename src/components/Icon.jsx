import { lazy, Suspense } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

const fallback = <div style={{ background: "#ddd", width: 24, height: 24 }} />;

export default function Icon({ name, ...props }) {
  const importer = dynamicIconImports[name];
  if (!importer) return fallback;
  const LucideIcon = lazy(importer);

  return (
    <Suspense fallback={fallback}>
      <LucideIcon {...props} />
    </Suspense>
  );
}
