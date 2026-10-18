# Maison Noir — Fragrance as Memory

An editorial storefront for a fictional fine-fragrance house, built with Next.js App Router, React, Tailwind CSS v4, and TypeScript.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To create a production build, run `npm run build` and `npm run start`.

## Experience

- Responsive, dark-first editorial layout across eight boutique and journal sections.
- Six original fragrance still-life images served locally as optimized WebP assets, with lazy loading and tiny blur-up placeholders.
- Scroll-reactive navigation, mobile menu, Lenis smooth scrolling, and reduced-motion-aware reveal effects.
- Searchable fragrance catalogue, persistent cart with quantity controls and subtotal, atmosphere toggle, testimonial controls, and newsletter form with inline confirmation.
- WhatsApp checkout directs to `https://wa.me/2349049205568` and prepares an order-specific message with each fragrance, its notes, quantity, unit price, and the order total. Override `NEXT_PUBLIC_WHATSAPP_LINK` in `.env.local` if the vendor link changes.
- Locally bundled Fraunces, Cormorant Garamond, Inter Tight, and IBM Plex Mono fonts.
- Custom Tailwind theme tokens for the Maison Noir palette, type, radius, and warm shadows, defined in `app/globals.css`.
