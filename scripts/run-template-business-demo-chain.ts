import path from "node:path";
import { readFile } from "node:fs/promises";
import { runTemplateBusinessDemoChain } from "@/lib/demo-library/template-business-demo-chain";
import type { TemplateBusinessDemoChainInput } from "@/lib/demo-library/template-business-demo-schemas";

type CliArgs = {
  inputFile?: string;
  url?: string;
  businessName?: string;
  category?: string;
  phone?: string;
  email?: string;
  address?: string;
  mapsUrl?: string;
  output?: string;
  profileSlug?: string;
  maxPages?: number;
  timeoutMs?: number;
  rateLimitMs?: number;
  captureScreenshots?: boolean;
  saveProfile?: boolean;
  json: boolean;
};

function printUsage() {
  console.log(`
Usage:
  npx tsx scripts/run-template-business-demo-chain.ts --url https://example.com [options]
  npx tsx scripts/run-template-business-demo-chain.ts --input-file ./business.json [options]

Options:
  --input-file <file>
  --url <value>
  --business-name <value>
  --category <value>
  --phone <value>
  --email <value>
  --address <value>
  --maps-url <value>
  --output <file>
  --profile-slug <value>
  --max-pages <number>       Default: 6
  --timeout-ms <number>      Default: 10000
  --rate-limit-ms <number>   Default: 1500
  --no-screenshots           Skip screenshot capture
  --no-save-profile          Only write the extraction artifact
  --json                     Emit a machine-readable summary
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
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    switch (token) {
      case "--input-file":
        args.inputFile = requireFlagValue(token, argv[index + 1]);
        index += 1;
        break;
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
      case "--profile-slug":
        args.profileSlug = requireFlagValue(token, argv[index + 1]);
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
      case "--no-save-profile":
        args.saveProfile = false;
        break;
      case "--json":
        args.json = true;
        break;
      case "--help":
        printUsage();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  if (!args.url && !args.inputFile) {
    throw new Error("Provide either --url or --input-file.");
  }

  return args;
}

function pickString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function mergeDefined(base: Record<string, unknown>, extra: Record<string, unknown>) {
  return Object.fromEntries(
    [...Object.entries(base), ...Object.entries(extra)].filter(([, value]) => value !== undefined),
  );
}

async function loadInputFile(inputFile?: string) {
  if (!inputFile) {
    return {};
  }

  const absolutePath = path.resolve(process.cwd(), inputFile);
  const raw = JSON.parse(await readFile(absolutePath, "utf8")) as unknown;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("--input-file must contain a single JSON object.");
  }

  return raw as Record<string, unknown>;
}

async function main() {
  const args = parseCli(process.argv.slice(2));
  const fileInput = await loadInputFile(args.inputFile);
  const input = mergeDefined(
    {
      url: pickString(fileInput, "url") ?? "",
      businessName: pickString(fileInput, "businessName", "business_name"),
      category: pickString(fileInput, "category"),
      phone: pickString(fileInput, "phone"),
      email: pickString(fileInput, "email"),
      address: pickString(fileInput, "address"),
      mapsUrl: pickString(fileInput, "mapsUrl", "maps_url"),
      output: pickString(fileInput, "output"),
      profileSlug: pickString(fileInput, "profileSlug", "profile_slug"),
      maxPages:
        typeof fileInput.maxPages === "number"
          ? fileInput.maxPages
          : typeof fileInput.max_pages === "number"
            ? fileInput.max_pages
            : undefined,
      timeoutMs:
        typeof fileInput.timeoutMs === "number"
          ? fileInput.timeoutMs
          : typeof fileInput.timeout_ms === "number"
            ? fileInput.timeout_ms
            : undefined,
      rateLimitMs:
        typeof fileInput.rateLimitMs === "number"
          ? fileInput.rateLimitMs
          : typeof fileInput.rate_limit_ms === "number"
            ? fileInput.rate_limit_ms
            : undefined,
      captureScreenshots:
        typeof fileInput.captureScreenshots === "boolean"
          ? fileInput.captureScreenshots
          : typeof fileInput.capture_screenshots === "boolean"
            ? fileInput.capture_screenshots
            : undefined,
      saveProfile:
        typeof fileInput.saveProfile === "boolean"
          ? fileInput.saveProfile
          : typeof fileInput.save_profile === "boolean"
            ? fileInput.save_profile
            : undefined,
    },
    {
      url: args.url,
      businessName: args.businessName,
      category: args.category,
      phone: args.phone,
      email: args.email,
      address: args.address,
      mapsUrl: args.mapsUrl,
      output: args.output,
      profileSlug: args.profileSlug,
      maxPages: args.maxPages,
      timeoutMs: args.timeoutMs,
      rateLimitMs: args.rateLimitMs,
      captureScreenshots: args.captureScreenshots,
      saveProfile: args.saveProfile,
    },
  ) as TemplateBusinessDemoChainInput;

  const result = await runTemplateBusinessDemoChain(input);
  const summary = {
    leadSlug: result.artifact.slug,
    canonicalName: result.artifact.extractionSummary.canonicalName,
    templateSlug: result.artifact.templateSlug,
    crawlStatus: result.artifact.crawl.status,
    liveDemoEligible: result.artifact.contactValidation.liveDemoEligibility,
    artifactPath: path.relative(process.cwd(), result.artifactPath),
    profilePath: result.profilePath ? path.relative(process.cwd(), result.profilePath) : undefined,
    preview: result.preview,
  };

  if (args.json) {
    console.log(`${JSON.stringify(summary, null, 2)}\n`);
    return;
  }

  console.log("");
  console.log("Template business demo chain complete");
  console.log(`Lead slug: ${summary.leadSlug}`);
  console.log(`Canonical name: ${summary.canonicalName}`);
  console.log(`Template slug: ${summary.templateSlug}`);
  console.log(`Crawl status: ${summary.crawlStatus}`);
  console.log(`Live demo eligible: ${summary.liveDemoEligible ? "yes" : "no"}`);
  console.log(`Extraction artifact: ${summary.artifactPath}`);

  if (summary.profilePath) {
    console.log(`Saved profile: ${summary.profilePath}`);
  }

  if (summary.preview) {
    console.log(`Clinic demo: ${summary.preview.clinicDemoUrl}`);
    console.log(`Mirror preview: ${summary.preview.mirrorUrl}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
