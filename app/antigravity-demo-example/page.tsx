import { ClinicDemoPage } from "@/components/antigravity/clinic-demo-page";
import { exampleDemoLandingPage } from "@/lib/antigravity/demo-site/example-fixture";

export default function AntigravityDemoExamplePage() {
  return (
    <ClinicDemoPage
      landingPage={{
        ...exampleDemoLandingPage,
        chatbot: {
          ...exampleDemoLandingPage.chatbot,
          endpointPath: "/api/antigravity-demo-example/chat",
        },
      }}
    />
  );
}
