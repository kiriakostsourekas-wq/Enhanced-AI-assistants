import { DiscoveryBatchSchema } from "@/lib/antigravity/schemas";
import type { DiscoveredProspect } from "@/lib/antigravity/schemas";
import type { ProspectDiscoveryProvider } from "@/lib/antigravity/stages/interfaces";
import type { LeadDiscoverySource } from "@/lib/antigravity/discovery/sources/interfaces";
import {
  dedupeKey,
  normalizeCandidate,
  shouldExcludeCandidate,
  toDiscoveredProspect,
  type NormalizedDiscoveryCandidate,
} from "@/lib/antigravity/discovery/normalize";
import { probeWebsite } from "@/lib/antigravity/discovery/website-vetting";
import { buildFactSource } from "@/lib/antigravity/runtime/utils";

type AppointmentSmbLeadDiscoveryProviderArgs = {
  sources: LeadDiscoverySource[];
  minimumIcpFit?: number;
  minimumLocalRelevance?: number;
};

async function mapWithConcurrency<T, R>(
  values: T[],
  worker: (value: T, index: number) => Promise<R>,
  concurrency: number,
) {
  const results = new Array<R>(values.length);
  let cursor = 0;

  async function runWorker() {
    while (true) {
      const currentIndex = cursor;
      cursor += 1;

      if (currentIndex >= values.length) {
        return;
      }

      results[currentIndex] = await worker(values[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => runWorker()));
  return results;
}

function candidateSortScore(candidate: NormalizedDiscoveryCandidate) {
  return (
    candidate.scoring.overall * 100 +
    candidate.scoring.websitePresent * 10 +
    candidate.scoring.contactability * 8 +
    candidate.scoring.localRelevance * 7
  );
}

export class AppointmentSmbLeadDiscoveryProvider implements ProspectDiscoveryProvider {
  private readonly minimumIcpFit: number;
  private readonly minimumLocalRelevance: number;

  constructor(private readonly args: AppointmentSmbLeadDiscoveryProviderArgs) {
    this.minimumIcpFit = args.minimumIcpFit ?? 0.45;
    this.minimumLocalRelevance = args.minimumLocalRelevance ?? 0.7;
  }

  private async vetCandidateWebsite(candidate: NormalizedDiscoveryCandidate) {
    if (candidate.website?.kind !== "official") {
      return candidate;
    }

    const probe = await probeWebsite(candidate.website.url);
    if (!probe.ok) {
      return null;
    }

    return {
      ...candidate,
      website: {
        kind: "official" as const,
        url: probe.finalUrl,
        domain: probe.domain,
      },
      confidence: Math.min(1, candidate.confidence + 0.06),
      provenance: [
        ...candidate.provenance,
        buildFactSource({
          sourceType: "discovery_provider",
          label: "website probe",
          uri: probe.finalUrl,
        }),
      ],
    };
  }

  async discoverProspects({ campaign, logger }: Parameters<ProspectDiscoveryProvider["discoverProspects"]>[0]) {
    logger.info("discovering_appointment_smb_prospects", {
      sourceCount: this.args.sources.length,
      vertical: campaign.vertical,
      city: campaign.geography.city,
      countryCode: campaign.geography.countryCode,
    });

    const sourceBatches = await Promise.all(
      this.args.sources.map((source) =>
        source.discoverCandidates({
          campaign,
          logger: logger.child({ discoverySource: source.sourceName }),
        }),
      ),
    );

    const normalized = sourceBatches
      .flatMap((batch) => batch.candidates)
      .map((candidate) => normalizeCandidate(candidate, campaign))
      .filter((candidate) => {
        const website = candidate.website ?? { kind: "missing" as const };
        return !shouldExcludeCandidate(
          {
            externalId: candidate.externalId,
            businessName: candidate.businessName,
            category: candidate.category,
            address: candidate.address,
            city: candidate.city,
            country: candidate.country,
            phone: candidate.phone,
            visibleEmail: candidate.visibleEmail,
            websiteUrl: candidate.website?.kind === "official" ? candidate.website.url : undefined,
            officialWebsiteUrl: candidate.website?.kind === "official" ? candidate.website.url : undefined,
            contactPageUrl: candidate.contactPageUrl,
            mapsUrl: candidate.mapsUrl,
            sourceUrl: candidate.sourceUrl,
            sourceName: "normalized",
            notes: candidate.notes,
            confidence: candidate.confidence,
            provenance: candidate.provenance,
          },
          campaign,
          website,
        );
      })
      .filter((candidate) => candidate.scoring.icpFit >= this.minimumIcpFit)
      .filter((candidate) => candidate.scoring.localRelevance >= this.minimumLocalRelevance)
      .filter((candidate) => candidate.scoring.overall >= campaign.discovery.minimumOverallScore)
      .sort((left, right) => candidateSortScore(right) - candidateSortScore(left));

    const deduped = new Map<string, NormalizedDiscoveryCandidate>();
    for (const candidate of normalized) {
      const key = dedupeKey(candidate);
      const existing = deduped.get(key);

      if (!existing || candidateSortScore(candidate) > candidateSortScore(existing)) {
        deduped.set(key, candidate);
      }
    }

    const rankedCandidates = [...deduped.values()].sort((left, right) => candidateSortScore(right) - candidateSortScore(left));
    const websiteCandidates = rankedCandidates.filter((candidate) => candidate.website.kind === "official");
    const nonWebsiteCandidates = rankedCandidates.filter((candidate) => candidate.website.kind !== "official");
    const websiteProbeBudget = Math.max(campaign.targetLeadCount * 5, 50);

    const vettedWebsiteCandidates = (
      await mapWithConcurrency(websiteCandidates.slice(0, websiteProbeBudget), (candidate) => this.vetCandidateWebsite(candidate), 6)
    ).filter((candidate): candidate is NormalizedDiscoveryCandidate => candidate !== null);

    const vettedCandidates = [...vettedWebsiteCandidates, ...nonWebsiteCandidates];

    const finalProspects: DiscoveredProspect[] = vettedCandidates
      .sort((left, right) => candidateSortScore(right) - candidateSortScore(left))
      .slice(0, campaign.targetLeadCount)
      .map((candidate, index) => toDiscoveredProspect(candidate, campaign, index));

    logger.info("appointment_smb_discovery_completed", {
      rawCandidateCount: sourceBatches.reduce((sum, batch) => sum + batch.candidates.length, 0),
      normalizedCandidateCount: normalized.length,
      dedupedCandidateCount: deduped.size,
      finalLeadCount: finalProspects.length,
    });

    return DiscoveryBatchSchema.parse({
      prospects: finalProspects,
      requestedLeadCount: campaign.targetLeadCount,
      returnedLeadCount: finalProspects.length,
      providerName: "appointment_smb_discovery",
    });
  }
}
