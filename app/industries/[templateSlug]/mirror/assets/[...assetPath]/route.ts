import { readFile } from "node:fs/promises";
import path from "node:path";
import { getTemplateBySlug } from "@/lib/demo-library/template-catalog";

type AssetRouteProps = {
  params: Promise<{
    templateSlug: string;
    assetPath: string[];
  }>;
};

export const runtime = "nodejs";

function contentTypeForAsset(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

export async function GET(_request: Request, { params }: AssetRouteProps) {
  const resolvedParams = await params;
  const template = await getTemplateBySlug(resolvedParams.templateSlug);

  if (!template) {
    return new Response("Template not found.", { status: 404 });
  }

  const assetsRoot = path.join(process.cwd(), "virtualprosmax", template.slug, "mirror", "assets");
  const assetPath = path.join(assetsRoot, ...resolvedParams.assetPath);
  const normalizedAssetPath = path.normalize(assetPath);

  if (!normalizedAssetPath.startsWith(`${assetsRoot}${path.sep}`)) {
    return new Response("Invalid asset path.", { status: 400 });
  }

  try {
    const contents = await readFile(normalizedAssetPath);

    return new Response(contents, {
      headers: {
        "content-type": contentTypeForAsset(normalizedAssetPath),
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return new Response("Asset not found.", { status: 404 });
    }

    throw error;
  }
}

