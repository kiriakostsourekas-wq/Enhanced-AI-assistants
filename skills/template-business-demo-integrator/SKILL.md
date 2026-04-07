---
name: template-business-demo-integrator
description: Scan a public business website, crawl key pages, extract verified demo-relevant facts, and merge them into a template/business demo workflow without inventing missing details. Use when building clinic or service-business demo overlays, refreshing local lead snapshots, or turning a live site into structured demo inputs.
---

# Template Business Demo Integrator

Use this when the task starts from a real business website and the goal is to produce demo-ready business facts, a safe template match, or a merged business demo.

## What this skill does

- Crawls a public website with the repo's existing site-snapshot pipeline
- Scans key pages conservatively: homepage, about, services, contact, booking, team, and FAQ when present
- Extracts demo-relevant facts only from the source:
  - business name
  - category / specialty
  - services
  - phone, email, address
  - contact, booking, maps, and website links
  - opening hours
  - doctor / team names
  - qualifications, trust markers, testimonials, social links, image references
  - unresolved fields and live-demo blockers
- Builds a structured knowledge artifact that can be used to populate a template or compact demo profile
- Keeps base templates read-only, including `virtualprosmax/` and the clean mirror route under `/industries/<template-slug>/mirror`

## Choose the right entrypoint

For the full single-URL workflow that saves both the extractor artifact and a reusable demo profile, use:

```bash
npx tsx scripts/run-template-business-demo-chain.ts --url https://example.com
```

You can also drive that workflow from a JSON file:

```bash
npx tsx scripts/run-template-business-demo-chain.ts --input-file ./business.json
```

The JSON file can contain the same keys as the CLI flags, for example `url`, `businessName`, `category`, `phone`, `email`, `address`, `mapsUrl`, and `profileSlug`.

For a single public URL that is not already tied to the clinic CSV, use the helper script:

```bash
npx tsx skills/template-business-demo-integrator/scripts/extract-business-demo-data.ts --url https://example.com
```

Useful optional flags:

```bash
npx tsx skills/template-business-demo-integrator/scripts/extract-business-demo-data.ts \
  --url https://example.com \
  --business-name "Example Clinic" \
  --category "Dental clinic" \
  --maps-url "https://maps.google.com/..." \
  --output artifacts/template-business-demo-integrator/example-clinic.json
```

For a lead that already exists in `clinics/athens_clinics_leads.csv`, prefer the existing profile builder:

```bash
npx tsx scripts/build-clinic-demo-profiles.ts retina-eye-clinic --refresh
```

For batch snapshot refresh across the CSV, use:

```bash
npx tsx scripts/enrich-clinic-site-snapshots.ts
```

## Expected outputs

The LangChain workflow writes:

- an extraction artifact under `artifacts/template-business-demo-integrator/` unless `--output` is provided
- a saved compact profile under `artifacts/clinic-demo-profiles/`
- a previewable route at `/clinic-demos/<lead-slug>` and `/industries/<template-slug>/mirror?lead=<lead-slug>`

The legacy single-URL extraction helper still writes just the JSON artifact under `artifacts/template-business-demo-integrator/` unless `--output` is provided.

That artifact is the source of truth for:

- matched template slug
- crawl status and scanned page URLs
- extracted contact and location facts
- extracted services, people, trust, and booking signals
- unresolved fields that must stay conservative
- knowledge-pack material for downstream demo work

For CSV-backed leads, the saved profile lives under `artifacts/clinic-demo-profiles/` and can be opened through:

- `/clinic-demos/<lead-slug>`
- `/industries/<template-slug>/mirror?lead=<lead-slug>`

## Integration workflow

1. Start from the website or lead selector.
2. Reuse an existing saved profile or snapshot when it is already present and still usable.
3. Refresh the crawl only when the snapshot is missing, stale, or the user explicitly asks for a fresh scan.
4. Use the extracted artifact as the source of truth when filling a template:
   - replace placeholder branding with the verified business name
   - populate phone, email, address, and links only when present
   - use services, category, and trust markers to shape headings, chips, and supporting sections
   - leave unresolved fields blank or clearly conservative
5. Keep the underlying template structure intact unless the user explicitly asks for layout changes.

## Guardrails

- Do not modify anything inside `virtualprosmax/` unless explicitly asked.
- Do not fabricate contact details, services, qualifications, hours, testimonials, reviews, or claims.
- Do not bypass robots or blocked crawl targets.
- Prefer existing local artifacts over unnecessary re-scans.
- Treat the extractor as strongest for clinics and appointment-based service businesses; for broader businesses, keep the output more conservative and expect manual cleanup.
- If the site is heavily client-rendered or sparse, inspect the generated artifact and unresolved fields before integrating anything into a demo.
