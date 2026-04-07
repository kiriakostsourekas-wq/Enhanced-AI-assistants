import path from "node:path";
import {
  buildClinicDemoProfile,
  hasLocalClinicLeadDataset,
  listClinicLeadSummaries,
  resolveClinicLeadSelectors,
  saveClinicDemoProfile,
} from "@/lib/demo-library/clinic-demo-profiles";

function parseCli() {
  const rawArgs = process.argv.slice(2);
  const refreshSnapshot = rawArgs.includes("--refresh");
  const selectors = rawArgs.filter((value) => value !== "--refresh");

  return {
    refreshSnapshot,
    selectors,
  };
}

async function main() {
  const { refreshSnapshot, selectors } = parseCli();

  if (!(await hasLocalClinicLeadDataset())) {
    throw new Error(
      "Local clinic dataset was not found at clinics/athens_clinics_leads.csv. Add your local CSV first, then rerun this command.",
    );
  }

  const leads =
    selectors.length > 0
      ? await resolveClinicLeadSelectors(selectors)
      : (await listClinicLeadSummaries()).filter((lead) => Boolean(lead.websiteUrl));

  if (leads.length === 0) {
    console.log("No clinic leads matched the requested selectors.");
    return;
  }

  console.log("");
  console.log(`Building compact clinic demo profiles for ${leads.length} lead(s)...`);
  console.log(`Refresh snapshots: ${refreshSnapshot ? "yes" : "no"}`);
  console.log("");

  for (const lead of leads) {
    try {
      const profile = await buildClinicDemoProfile(lead.slug, { refreshSnapshot });

      if (!profile) {
        console.log(`- ${lead.businessName}`);
        console.log("  status: skipped (profile could not be built)");
        continue;
      }

      const outputPath = await saveClinicDemoProfile(profile);

      console.log(`- ${profile.businessName}`);
      console.log(`  template: ${profile.template.title}`);
      console.log(`  summary: ${profile.summary}`);
      console.log(`  profile: ${path.relative(process.cwd(), outputPath)}`);
      console.log(`  merged_demo: /clinic-demos/${profile.slug}`);
      console.log(`  clean_mirror: ${profile.template.mirrorHref}`);
      console.log(`  overlay_mirror: ${profile.template.mirrorHref}?lead=${profile.slug}`);
    } catch (error) {
      console.log(`- ${lead.businessName}`);
      console.log(`  status: skipped (${error instanceof Error ? error.message : String(error)})`);
    }
  }

  console.log("");
  console.log("Clinic demo profile build finished.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
