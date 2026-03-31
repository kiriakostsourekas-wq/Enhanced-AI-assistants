import type { AntigravityDependencies } from "@/lib/antigravity/stages/interfaces";
import { RoutedProspectDiscoveryProvider } from "@/lib/antigravity/providers/routed-discovery";

// Extension point: add more discovery sources to RoutedProspectDiscoveryProvider
// without changing the orchestrator entrypoint or stage contracts.
export function createDefaultAntigravityDependencies(): AntigravityDependencies {
  return {
    prospectDiscovery: new RoutedProspectDiscoveryProvider(),
  };
}
