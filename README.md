# Northline AI Marketing Site

A multi-page Next.js marketing website for an AI-powered lead capture and appointment-booking business focused on SMBs.

## What is included

- Home page with hero, interactive chatbot demo, benefits, industries, results preview, testimonials, FAQ, and CTA sections
- Solutions page covering chatbot lead capture, booking automation, website creation, and workflow support
- How It Works page with process flow and launch phases
- Industries page with vertical-specific positioning
- Contact / Book Demo page with a working local demo form stored in browser `localStorage`
- Chatbot backend route at `POST /api/chat`
- Server-side knowledge-pack loading from `knowledge-pack.md`
- Minimal local chatbot test page at `/chatbot-test`
- Sticky navigation, mobile menu, animated section reveals, hover states, and responsive layouts

## Tech stack

- Next.js 16.2.0
- React 19.2.4
- TypeScript
- Custom CSS with reusable components and centralized brand/content data

## Environment setup

1. Create a local env file:

```bash
cp .env.example .env.local
```

2. Add your values to `.env.local`:

```bash
OPENAI_API_KEY=your_real_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_DEMO_URL=/contact
```

Notes:
- `OPENAI_API_KEY` must stay server-side in `.env.local`.
- `OPENAI_MODEL` is optional. If you leave it out, the project defaults to `gpt-4.1-mini`.
- `NEXT_PUBLIC_DEMO_URL` can stay as `/contact` until you have a real calendar or demo page link.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open:

```text
http://127.0.0.1:3000
```

## Useful scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

## Chatbot backend

What was added:
- A secure app-router API route at `app/api/chat/route.ts`
- A small server utility layer in `lib/chatbot/` for:
  - env/config loading
  - request validation
  - knowledge-pack loading and caching
  - system prompt construction
  - OpenAI provider calls
- A minimal test page at `/chatbot-test`

Request format:

```json
{
  "message": "What exactly do you help with?",
  "history": [
    { "role": "assistant", "content": "Hi, how can I help?" },
    { "role": "user", "content": "We run a dental clinic." }
  ]
}
```

Response format:

```json
{
  "ok": true,
  "reply": "We help appointment-based businesses respond faster and guide more enquiries into booked appointments.",
  "cta": {
    "label": "Book a Demo",
    "href": "/contact"
  },
  "meta": {
    "model": "gpt-4.1-mini",
    "brandName": "Northline AI",
    "provider": "openai"
  }
}
```

## How to test the chatbot locally

1. Make sure `.env.local` contains a real `OPENAI_API_KEY`.
2. Start the app with `npm run dev`.
3. Open `http://127.0.0.1:3000/chatbot-test`.
4. Ask questions about the business, industries, website support, or what happens after booking a demo.

If you want to test the API route directly:

```bash
curl -X POST http://127.0.0.1:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What do you do?","history":[]}'
```

## Project structure

```text
enhanced_chatbot/
├── app/
│   ├── api/
│   │   └── chat/route.ts
│   ├── chatbot-test/page.tsx
│   ├── contact/page.tsx
│   ├── how-it-works/page.tsx
│   ├── industries/page.tsx
│   ├── solutions/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── site-footer.tsx
│   │   └── site-header.tsx
│   ├── sections/
│   │   ├── chatbot-test-panel.tsx
│   │   ├── chat-demo.tsx
│   │   ├── contact-form.tsx
│   │   └── faq-accordion.tsx
│   └── ui/
│       ├── page-hero.tsx
│       ├── reveal.tsx
│       └── section-intro.tsx
├── lib/
│   ├── chatbot/
│   │   ├── config.ts
│   │   ├── knowledge-pack.ts
│   │   ├── prompt.ts
│   │   ├── service.ts
│   │   ├── types.ts
│   │   ├── validation.ts
│   │   └── providers/
│   │       └── openai.ts
│   └── site-content.ts
├── public/
│   └── favicon.svg
├── .env.example
├── knowledge-pack.md
├── .gitignore
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

## Where to edit things later

- Brand name, contact details, CTA labels, testimonials, FAQs, industries, and most marketing copy:
  `lib/site-content.ts`
- Colors, spacing, typography, layout, motion, button styles, and section styling:
  `app/globals.css`
- Homepage structure:
  `app/page.tsx`
- Route-specific messaging:
  `app/solutions/page.tsx`
  `app/how-it-works/page.tsx`
  `app/industries/page.tsx`
  `app/contact/page.tsx`
- Chatbot knowledge and behavior:
  `knowledge-pack.md`
  `lib/chatbot/prompt.ts`
  `lib/chatbot/config.ts`
- Shared UI and interactive components:
  `components/`

## Local-demo assumptions

- The contact form is demo-friendly and stores submissions only in the current browser using `localStorage`.
- The chatbot demo uses mock conversation scenarios and mock booking slots.
- The real chatbot backend uses OpenAI and requires `OPENAI_API_KEY` in `.env.local`.
- The chatbot uses `knowledge-pack.md` as its server-side business context source.
- There is no external backend, CRM, calendar sync, or paid service dependency in this MVP.
- The site is structured so those integrations can be added later without rebuilding the project from scratch.

## Verification completed

- `npm run typecheck`
- `npm run build`
- `npm run dev -- --hostname 127.0.0.1 --port 3000`
- Route checks returned `200` for:
  `/`
  `/solutions`
  `/how-it-works`
  `/industries`
  `/contact`
