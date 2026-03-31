# Antigravity Demo Subdomain Notes

## Recommended shape

- Serve the preview experience from a dedicated subdomain such as `preview.yourdomain.com`.
- Keep the Next.js route path as `/antigravity-previews/:campaignSlug/:prospectSlug`.
- Expose the embedded clinic chat API at `/api/antigravity-chat/:campaignSlug/:prospectSlug`.

Example:

- Page: `https://preview.yourdomain.com/antigravity-previews/athens-dental/athens-dental-clinic`
- Chat API: `https://preview.yourdomain.com/api/antigravity-chat/athens-dental/athens-dental-clinic`

## How deployment works in this codebase

- The `deploy_preview_url` stage writes `landing-page.json`, `chatbot-config.json`, and `knowledge-pack.json` into `public/antigravity-previews/:campaignSlug/:prospectSlug/`.
- The Next.js route at `app/antigravity-previews/[campaignSlug]/[prospectSlug]/page.tsx` reads those artifacts at request time and renders the React template.
- This means previews stay data-driven. You do not need to generate custom page source files per clinic.

## Operational guidance

- Run the Next app on a Node runtime, not export-only static hosting, because the preview page and embedded chat both read server-side artifacts.
- Put the `public/antigravity-previews/` directory on persistent storage if your runtime has ephemeral disks.
- If you want a different public URL shape, add an edge or app-server rewrite to the fixed `/antigravity-previews/*` route instead of changing the app route itself.
- Cache the preview page HTML lightly, but do not aggressively cache the chat API.

## Safe sending workflow

- Keep `previewBaseUrl` pointed at the preview subdomain.
- Send owners the preview page URL, not the raw JSON artifacts.
- Only send routes whose artifact bundle includes a valid `landing-page.json`, `chatbot-config.json`, and `knowledge-pack.json`.
