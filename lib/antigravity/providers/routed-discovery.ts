import type { ProspectDiscoveryProvider } from "@/lib/antigravity/stages/interfaces";
import type { CampaignConfig } from "@/lib/antigravity/schemas";
import type { AntigravityLogger } from "@/lib/antigravity/runtime/logger";
import { StaticSeedProspectDiscoveryProvider } from "@/lib/antigravity/providers/static-discovery";
import { AppointmentSmbLeadDiscoveryProvider } from "@/lib/antigravity/discovery/provider";
import { AthensClinicsCsvDiscoverySource } from "@/lib/antigravity/discovery/sources/athens-clinics-csv";

type RoutedDiscoveryArgs = {
  staticSeedProvider?: ProspectDiscoveryProvider;
  appointmentSmbProvider?: ProspectDiscoveryProvider;
};

export class RoutedProspectDiscoveryProvider implements ProspectDiscoveryProvider {
  private readonly staticSeedProvider: ProspectDiscoveryProvider;
  private readonly appointmentSmbProvider: ProspectDiscoveryProvider;

  constructor(args: RoutedDiscoveryArgs = {}) {
    this.staticSeedProvider = args.staticSeedProvider ?? new StaticSeedProspectDiscoveryProvider();
    this.appointmentSmbProvider =
      args.appointmentSmbProvider ??
      new AppointmentSmbLeadDiscoveryProvider({
        sources: [new AthensClinicsCsvDiscoverySource()],
      });
  }

  private selectProvider(campaign: CampaignConfig, logger: AntigravityLogger) {
    if (campaign.discovery.provider === "static_seed") {
      logger.info("using_static_seed_discovery_provider");
      return this.staticSeedProvider;
    }

    if (campaign.discovery.provider === "appointment_smb_csv") {
      logger.info("using_appointment_smb_csv_discovery_provider");
      return this.appointmentSmbProvider;
    }

    throw new Error(`Unsupported discovery provider: ${campaign.discovery.provider}`);
  }

  async discoverProspects(args: Parameters<ProspectDiscoveryProvider["discoverProspects"]>[0]) {
    const provider = this.selectProvider(args.campaign, args.logger);
    return provider.discoverProspects(args);
  }
}
