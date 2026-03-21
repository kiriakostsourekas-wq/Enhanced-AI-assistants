# Northline AI Marketing Site

A multi-page Next.js marketing website for an AI-powered lead capture and appointment-booking business focused on SMBs.

## What is included

- Home page with hero, interactive chatbot demo, benefits, industries, results preview, testimonials, FAQ, and CTA sections
- Solutions page covering chatbot lead capture, booking automation, website creation, and workflow support
- How It Works page with process flow and launch phases
- Industries page with vertical-specific positioning
- Contact / Book Demo page with a working local demo form stored in browser `localStorage`
- Sticky navigation, mobile menu, animated section reveals, hover states, and responsive layouts

## Tech stack

- Next.js 16.2.0
- React 19.2.4
- TypeScript
- Custom CSS with reusable components and centralized brand/content data

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

## Project structure

```text
enhanced_chatbot/
├── app/
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
│   │   ├── chat-demo.tsx
│   │   ├── contact-form.tsx
│   │   └── faq-accordion.tsx
│   └── ui/
│       ├── page-hero.tsx
│       ├── reveal.tsx
│       └── section-intro.tsx
├── lib/
│   └── site-content.ts
├── public/
│   └── favicon.svg
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
- Shared UI and interactive components:
  `components/`

## Local-demo assumptions

- The contact form is demo-friendly and stores submissions only in the current browser using `localStorage`.
- The chatbot demo uses mock conversation scenarios and mock booking slots.
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
