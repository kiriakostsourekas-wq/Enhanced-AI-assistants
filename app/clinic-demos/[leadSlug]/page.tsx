import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getClinicLeadSummaryBySlug,
  getSavedClinicDemoProfile,
} from "@/lib/demo-library/clinic-demo-profiles";
import { getTemplateBySlug } from "@/lib/demo-library/template-catalog";

type ClinicDemoPageProps = {
  params: Promise<{
    leadSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ClinicDemoPageProps): Promise<Metadata> {
  const leadSlug = (await params).leadSlug;
  const savedProfile = await getSavedClinicDemoProfile(leadSlug);

  if (savedProfile) {
    return {
      title: `${savedProfile.businessName} Demo`,
      description: savedProfile.category ?? "Saved clinic demo profile.",
    };
  }

  const lead = await getClinicLeadSummaryBySlug(leadSlug);

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
  const leadSlug = (await params).leadSlug;
  const savedProfile = await getSavedClinicDemoProfile(leadSlug);

  if (savedProfile) {
    redirect(`${savedProfile.template.mirrorHref}?lead=${encodeURIComponent(savedProfile.slug)}`);
  }

  const lead = await getClinicLeadSummaryBySlug(leadSlug);
  if (!lead) {
    notFound();
  }

  const template = await getTemplateBySlug(lead.templateSlug);
  if (!template) {
    notFound();
  }

  redirect(`${template.mirrorHref}?lead=${encodeURIComponent(lead.slug)}`);
}
