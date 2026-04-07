import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClinicDemoPage } from "@/components/antigravity/clinic-demo-page";
import { loadPreviewArtifacts } from "@/lib/antigravity/demo-site/artifacts";

type PreviewPageProps = {
  params: Promise<{
    campaignSlug: string;
    prospectSlug: string;
  }>;
};

async function loadPageData(params: Awaited<PreviewPageProps["params"]>) {
  try {
    return await loadPreviewArtifacts(params);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const data = await loadPageData(await params);

  return {
    title: data.landingPage.title,
    description: data.landingPage.metaDescription ?? data.landingPage.subheadline,
  };
}

export default async function AntigravityPreviewPage({ params }: PreviewPageProps) {
  const data = await loadPageData(await params);

  return <ClinicDemoPage landingPage={data.landingPage} designSchema={data.designSchema} />;
}
