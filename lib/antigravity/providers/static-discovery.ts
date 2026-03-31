import type { ProspectDiscoveryProvider } from "@/lib/antigravity/stages/interfaces";
import { DiscoveryBatchSchema } from "@/lib/antigravity/schemas";
import { buildFactSource, slugify } from "@/lib/antigravity/runtime/utils";

function safeDomain(url?: string) {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

export class StaticSeedProspectDiscoveryProvider implements ProspectDiscoveryProvider {
  async discoverProspects({ campaign, logger }: Parameters<ProspectDiscoveryProvider["discoverProspects"]>[0]) {
    logger.info("discovering_static_seed_prospects", {
      seedProspectCount: campaign.discovery.seedProspects.length,
    });

    return DiscoveryBatchSchema.parse({
      prospects: campaign.discovery.seedProspects
        .slice(0, campaign.targetLeadCount)
        .map((seedProspect, index) => ({
          prospectId: `${campaign.campaignId}-${slugify(seedProspect.businessName)}-${index + 1}`,
          businessName: seedProspect.businessName,
          websiteDomain: safeDomain(seedProspect.websiteUrl),
          category: seedProspect.category,
          address: seedProspect.address,
          city: campaign.geography.city,
          country: campaign.geography.countryCode === "GR" ? "Greece" : undefined,
          phone: seedProspect.phone,
          visibleEmail: undefined,
          contactPageUrl: undefined,
          websiteUrl: seedProspect.websiteUrl,
          mapsUrl: seedProspect.mapsUrl,
          sourceUrl: seedProspect.mapsUrl ?? seedProspect.websiteUrl,
          scoring: {
            icpFit: 0.95,
            websitePresent: seedProspect.websiteUrl ? 1 : 0,
            contactability: seedProspect.phone ? 0.6 : 0.2,
            localRelevance: 0.9,
            overall: seedProspect.websiteUrl ? 0.87 : 0.76,
          },
          notes: seedProspect.notes,
          confidence: 0.95,
          provenance: [
            buildFactSource({
              sourceType: "campaign_seed",
              label: "campaign seed prospect",
              uri: seedProspect.mapsUrl ?? seedProspect.websiteUrl ?? `seed:${seedProspect.businessName}`,
            }),
          ],
        })),
      requestedLeadCount: campaign.targetLeadCount,
      returnedLeadCount: Math.min(campaign.discovery.seedProspects.length, campaign.targetLeadCount),
      providerName: "static_seed",
    });
  }
}
