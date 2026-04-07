import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getClinicLeadSummaryBySlug } from "@/lib/demo-library/clinic-demo-profiles";
import { getTemplateBySlug } from "@/lib/demo-library/template-catalog";

type ClinicDemoPageProps = {
  params: Promise<{
    leadSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ClinicDemoPageProps): Promise<Metadata> {
  const lead = await getClinicLeadSummaryBySlug((await params).leadSlug);

  if (!lead) {
    return {
      title: "Clinic Demo Not Found",
    };
  }

  return {
    title: `${lead.businessName} Demo`,
    description: lead.category ?? "Clinic demo generated from the local lead dataset.",
  };
}

export default async function ClinicDemoLeadPage({ params }: ClinicDemoPageProps) {
  const lead = await getClinicLeadSummaryBySlug((await params).leadSlug);
  if (!lead) {
    notFound();
  }

  const template = await getTemplateBySlug(lead.templateSlug);
  if (!template) {
    notFound();
  }

  redirect(`${template.mirrorHref}?lead=${encodeURIComponent(lead.slug)}`);
}
