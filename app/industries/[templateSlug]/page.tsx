import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTemplateBySlug } from "@/lib/demo-library/template-catalog";

type TemplatePageProps = {
  params: Promise<{
    templateSlug: string;
  }>;
};

async function loadTemplate(params: Awaited<TemplatePageProps["params"]>) {
  const template = await getTemplateBySlug(params.templateSlug);

  if (!template) {
    notFound();
  }

  return template;
}

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  const template = await loadTemplate(await params);

  return {
    title: `${template.title} Core Demo`,
    description: template.description,
  };
}

export default async function TemplateDetailPage({ params }: TemplatePageProps) {
  const template = await loadTemplate(await params);
  redirect(template.mirrorHref);
}
