# Local Clinic Lead Data

This folder is intentionally kept local-first.

What stays out of Git:
- `athens_clinics_leads.csv`
- raw scrape exports
- enriched contact datasets
- screenshots and crawl artifacts
- one-off operator scripts with local credentials

Safe files kept in Git:
- `athens_clinics_leads.template.csv` as a schema/template only

To use the Athens clinic CSV discovery source locally:

```bash
cp clinics/athens_clinics_leads.template.csv clinics/athens_clinics_leads.csv
```

Then replace the sample rows with your real local lead data before running:

```bash
npm run antigravity:run -- examples/antigravity/athens-clinic-discovery.json
```
