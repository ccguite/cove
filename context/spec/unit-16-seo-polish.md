# Spec: Unit 16 — SEO Audit & Final Polish

## Goal

Perform a comprehensive search engine optimization (SEO) audit and visual polish across all public-facing pages (Homepage, Rooms, Room Details, Menu, Features, and Login), confirming correct page tags, OpenGraph sharing attributes, semantic structures, responsive breakpoints, and custom micro-animations that respect accessibility preferences.

---

## Design

The visual design system is grounded in the **Seoul Serenity** theme. The polish phase focuses on:
- **Responsive Layout Integrity**: Ensures layout components scale down to `375px` (mobile viewport) and up to `1280px` (maximum content canvas width) without horizontal scroll bails or clipping.
- **Accessible Micro-animations**: Adding visual interactions across interactive primitives:
  - Hero image and main text fade-in transitions.
  - Card hover highlights: Y-axis translate lift (e.g., `-4px`) with an ambient shadow increase.
  - Button active/pressed states: scale transformation (e.g. `scale(0.98)`).
  - Focus ring outlines: Amber-tinted outlines (`--color-accent-300`) for input controls when focused.
- **Reduced Motion Support**: Ensuring all visual transitions are disabled when user preferences request reduced motion.

---

## Implementation

### Folder Layout
Create/modify files to build dynamic config components:

```
cove/
├── app/
│   ├── robots.ts                   # Dynamic robots.txt generation
│   ├── sitemap.ts                  # Dynamic sitemap.xml generator
│   └── (public)/
│       ├── page.tsx                # Homepage metadata check
│       ├── rooms/
│       │   ├── page.tsx            # Rooms catalog SEO check
│       │   └── [slug]/
│       │       └── page.tsx        # Dynamic metadata generation
│       ├── menu/
│       │   └── page.tsx            # Menu page metadata check
│       └── features/
│           └── page.tsx            # Features page SEO check
```

---

### Dynamic Metadata Generation
For dynamic detail routes like the Room Detail page (`/rooms/[slug]`), implement the Next.js `generateMetadata` function to dynamically pull details from the database:

```ts
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = createSupabaseServerClient();
  
  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!room) {
    return {
      title: 'Room Not Found — COVE',
    };
  }

  return {
    title: `${room.name} Experience Room — COVE`,
    description: `${room.description} Book starting at ₹${room.price_per_hour}/hour.`,
    openGraph: {
      title: `${room.name} Lounge — COVE`,
      description: `Reserve the ${room.name} lounge room in Aizawl, Mizoram.`,
      images: [
        {
          url: `/images/og-${room.slug}.jpg`,
          width: 1200,
          height: 630,
          alt: `${room.name} Experience Room`,
        },
      ],
    },
  };
}
```

---

### Dynamic Robots and Sitemap Generator

#### 1. Robots Configuration — `app/robots.ts`
```ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveaizawl.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/account/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

#### 2. Sitemap Configuration — `app/sitemap.ts`
```ts
import { MetadataRoute } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveaizawl.com';
  const supabase = createSupabaseServerClient();

  // Fetch dynamic rooms slugs
  const { data: rooms } = await supabase.from('rooms').select('slug');
  const roomEntries = (rooms || []).map((room) => ({
    url: `${baseUrl}/rooms/${room.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/rooms`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/menu`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
  ];

  return [...staticPages, ...roomEntries];
}
```

---

### Global Transition Accessibility Tokens — `styles/tokens.css`
Append standardized animation definitions and reduced motion queries:

```css
:root {
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Global focus state outline */
:focus-visible {
  outline: 2px solid var(--color-accent-300);
  outline-offset: 2px;
}

/* Accessibility overrides for prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
    scroll-behavior: auto !important;
    transform: none !important;
  }
}
```

---

## Dependencies

No extra packages to install. Built-in Next.js metadata and route configurations are utilized.

---

## Verification Checklist

### SEO & Metadata Validation
- [ ] Every public route (`/`, `/rooms`, `/rooms/[slug]`, `/menu`, `/features`, `/login`) has a unique and descriptive `<title>`.
- [ ] Every public page has a `<meta name="description">` that captures its specific purpose.
- [ ] OpenGraph sharing tags are verified in the build head output.
- [ ] Each page features exactly one `<h1>` header, maintaining logical hierarchy down through sub-headings.
- [ ] Dynamic sitemap output generates correctly at `/sitemap.xml`, containing static routes and room slug routes.
- [ ] Robots directive output compiles successfully at `/robots.txt`, verifying dashboard blocking rules.

### Performance & Accessibility
- [ ] Semantic HTML5 elements are utilized throughout (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- [ ] Next.js `next/image` is utilized on all images, featuring descriptive `alt` tags.
- [ ] Icon-only buttons (such as search boxes, menu triggers, or drawer dismiss buttons) have appropriate `aria-label` parameters.

### Breakpoints & Micro-animations
- [ ] UI displays correct layouts at `375px` mobile viewport widths, without horizontal scrolling.
- [ ] Hover card translations (`translate-y-[-4px]`) render smoothly.
- [ ] Form input focus triggers outline accents.
- [ ] Button hover and pressed scale transformations operate correctly.
- [ ] **Reduced Motion check**: Activating "Reduce Motion" in system settings immediately halts all sliding, zooming, or scaling transformations.
