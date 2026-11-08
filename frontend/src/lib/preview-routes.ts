import { existsSync } from "node:fs";
import path from "node:path";
import type { PortalModule } from "@/lib/modules";

/** Server/build-only: een configuratiewaarde alleen maakt nog geen previewroute. */
export function getImplementedPreviewPath(module: Pick<PortalModule, "previewPath">): string | undefined {
  const previewPath = module.previewPath;
  // Alleen lokale, concrete App Router-pagina's. Geen documentatie, URL's of padtraversal.
  if (!previewPath || !/^\/previews\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(previewPath)) return undefined;
  const routeDirectory = path.join(process.cwd(), "src", "app", ...previewPath.slice(1).split("/"));
  return ["tsx", "ts", "jsx", "js"].some(extension => existsSync(path.join(routeDirectory, `page.${extension}`)))
    ? previewPath : undefined;
}
