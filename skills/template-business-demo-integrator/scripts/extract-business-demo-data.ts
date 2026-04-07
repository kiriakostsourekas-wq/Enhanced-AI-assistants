import path from "node:path";
import {
  extractTemplateBusinessDemoArtifact,
  normalizeTemplateBusinessDemoChainInput,
  writeTemplateBusinessDemoArtifact,
} from "@/lib/demo-library/template-business-demo-chain";

type CliArgs = {
  url: string;
  businessName?: string;
  category?: string;
  phone?: string;
  email?: string;
  address?: string;
  mapsUrl?: string;
  output?: string;
  maxPages: number;
  timeoutMs: number;
  rateLimitMs: number;
  captureScreenshots: boolean;
};

function printUsage() {
  console.log(`
Usage:
  npx tsx skills/template-business-demo-integrator/scripts/extract-business-demo-data.ts --url https://example.com [options]

Options:
  --business-name <value>
  --category <value>
  --phone <value>
  --email <value>
  --address <value>
  --maps-url <value>
  --output <file>
  --max-pages <number>       Default: 6
  --timeout-ms <number>      Default: 10000
  --rate-limit-ms <number>   Default: 1500
  --no-screenshots           Skip screenshot capture
  --help
`.trim());
}

function requireFlagValue(flag: string, value?: string) {
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

function parsePositiveInt(value: string, flag: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer.`);
  }

  return parsed;
}

function parseCli(argv: string[]): CliArgs {
  const args: CliArgs = {
    url: "",
    maxPages: 6,
    timeoutMs: 10_000,
    rateLimitMs: 1_500,
    captureScreenshots: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    switch (token) {
      case "--url":
        args.url = requireFlagValue(token, argv[index + 1]);
        index += 1;
        break;
      case "--business-name":
        args.businessName = requireFlagValue(token, argv[index + 1]);
        index += 1;
        break;
      case "--category":
        args.category = requireFlagValue(token, argv[index + 1]);
        index += 1;
        break;
      case "--phone":
        args.phone = requireFlagValue(token, argv[index + 1]);
        index += 1;
        break;
      case "--email":
        args.email = requireFlagValue(token, argv[index + 1]);
        index += 1;
        break;
      case "--address":
        args.address = requireFlagValue(token, argv[index + 1]);
        index += 1;
        break;
      case "--maps-url":
        args.mapsUrl = requireFlagValue(token, argv[index + 1]);
        index += 1;
        break;
      case "--output":
        args.output = requireFlagValue(token, argv[index + 1]);
        index += 1;
        break;
      case "--max-pages":
        args.maxPages = parsePositiveInt(requireFlagValue(token, argv[index + 1]), token);
        index += 1;
        break;
      case "--timeout-ms":
        args.timeoutMs = parsePositiveInt(requireFlagValue(token, argv[index + 1]), token);
        index += 1;
        break;
      case "--rate-limit-ms":
        args.rateLimitMs = parsePositiveInt(requireFlagValue(token, argv[index + 1]), token);
        index += 1;
        break;
      case "--no-screenshots":
        args.captureScreenshots = false;
        break;
      case "--help":
        printUsage();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  if (!args.url) {
    throw new Error("--url is required.");
  }

  return args;
}

async function main() {
  const args = parseCli(process.argv.slice(2));
  const normalized = normalizeTemplateBusinessDemoChainInput({
    url: args.url,
    businessName: args.businessName,
    category: args.category,
    phone: args.phone,
    email: args.email,
    address: args.address,
    mapsUrl: args.mapsUrl,
    output: args.output,
    maxPages: args.maxPages,
    timeoutMs: args.timeoutMs,
    rateLimitMs: args.rateLimitMs,
    captureScreenshots: args.captureScreenshots,
    saveProfile: false,
  });
  const payload = await extractTemplateBusinessDemoArtifact(normalized);
  const outputPath = await writeTemplateBusinessDemoArtifact(payload, normalized.outputPath);

  console.log("");
  console.log("Template business demo extraction complete");
  console.log(`Output: ${path.relative(process.cwd(), outputPath)}`);
  console.log(`Template slug: ${payload.templateSlug}`);
  console.log(`Canonical name: ${payload.extractionSummary.canonicalName}`);
  console.log(`Crawl status: ${payload.crawl.status}`);
  if (payload.crawl.status === "success") {
    console.log(`Pages fetched: ${payload.crawl.fetchedPageCount}`);
    console.log(`Artifact directory: ${payload.crawl.artifactDirectory ?? "n/a"}`);
  } else {
    console.log(`Blocked reason: ${payload.crawl.blockedReason}`);
  }
  console.log(`Live demo eligible: ${payload.extractionSummary.liveDemoEligibility.eligible ? "yes" : "no"}`);
  console.log(`Services extracted: ${payload.extractionSummary.services.length}`);
  console.log(`Unresolved fields: ${payload.extractionSummary.unresolvedFields.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
