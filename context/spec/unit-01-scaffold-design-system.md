# Spec: Unit 1 — Project Scaffold & Design System

## Goal

Initialise the Next.js 14 project with TypeScript and App Router, wire up the complete Seoul Serenity design token system as CSS custom properties, load the required Google Fonts, and render a proof-of-life homepage that visually confirms every token is working correctly in the browser.

---

## Design

### Visual Target
The proof-of-life page must show:
- Page background: `#FEF9F1` (cream — `--color-background`)
- A single `<h1>` using Playfair Display Bold, color `#321F14` (`--color-text-heading`)
- A paragraph using Inter Regular, color `#1D1C17` (`--color-text-primary`)
- A primary button (espresso brown background, white label)
- A CTA button (amber background, white label)
- No hardcoded hex or pixel values anywhere — every value comes from a CSS custom property

### Layout Structure
- Max content width: `1280px` centred with `auto` margins
- Desktop horizontal padding: `64px` (`--space-16`)
- Mobile horizontal padding: `20px` (`--space-5`)
- The page content is centred vertically and horizontally on the viewport for this proof-of-life step

### Font Loading
- Playfair Display: weights `500`, `600`, `700`
- Inter: weights `400`, `500`, `600`, `700`
- Load via `next/font/google` in `app/layout.tsx` — not via a `<link>` tag in `<head>`
- Font variables must be applied to the `<html>` element so they are inherited globally

---

## Implementation

### 2.1 Project Initialisation

Run the following command to create the Next.js project in the current `cove/` directory:

```bash
npx create-next-app@latest ./ --typescript --app --no-src-dir --no-tailwind --import-alias "@/*" --eslint
```

Flags explained:
- `--typescript` — TypeScript enabled
- `--app` — App Router (not Pages Router)
- `--no-src-dir` — files live at project root, not under `/src`
- `--no-tailwind` — Tailwind is not used; vanilla CSS only
- `--import-alias "@/*"` — path alias for clean imports
- `--eslint` — ESLint wired in from the start

After initialisation, delete the following generated files that will be replaced:
- `app/globals.css` (replaced by `styles/tokens.css` and `styles/global.css`)
- `app/page.tsx` (replaced by our proof-of-life page)
- `app/page.module.css` (not used — no CSS modules in this project)
- `public/next.svg`, `public/vercel.svg` (not needed)

---

### 2.2 Folder Structure

Create the following directories after initialisation (they do not exist by default):

```
cove/
├── styles/           # All global CSS files
├── components/
│   ├── ui/           # Primitive components
│   └── shared/       # Composite components
├── lib/              # Business logic (empty for now)
└── public/           # Static assets
```

No files are created inside `lib/` or `components/` in this unit. The folders are created so the structure is established.

---

### 2.3 Design Token File — `styles/tokens.css`

Create `styles/tokens.css`. This file contains every CSS custom property for the design system. It must be the single source of truth — no hex values or pixel values may appear in any other CSS file.

Define the following custom properties on `:root`:

#### Color — Core Palette
```css
:root {
  --color-espresso: #4A3428;
  --color-espresso-deep: #321F14;
  --color-cream: #F8F3EB;
  --color-beige: #E8DCCB;
  --color-amber: #C98A3D;
  --color-amber-dim: #A86F2A;
  --color-amber-subtle: #F5E6CC;
}
```

#### Color — Semantic Surfaces
```css
:root {
  --color-background: #FEF9F1;
  --color-surface: #F8F3EB;
  --color-surface-low: #F2EDE5;
  --color-surface-high: #ECE8E0;
  --color-surface-highest: #E7E2DA;
  --color-surface-white: #FFFFFF;
  --color-surface-inverse: #32302B;
}
```

#### Color — Semantic Text
```css
:root {
  --color-text-primary: #1D1C17;
  --color-text-secondary: #4F453F;
  --color-text-heading: #321F14;
  --color-text-on-dark: #F5F0E8;
  --color-text-on-primary: #FFFFFF;
  --color-text-on-amber: #FFFFFF;
  --color-text-disabled: #B0A89F;
}
```

#### Color — Interactive / Brand
```css
:root {
  --color-primary: #4A3428;
  --color-primary-deep: #321F14;
  --color-primary-container: #E1C0AF;
  --color-secondary: #665D50;
  --color-secondary-container: #EADECD;
  --color-accent: #C98A3D;
  --color-accent-hover: #A86F2A;
  --color-accent-subtle: #F5E6CC;
  --color-tertiary: #D69547;
}
```

#### Color — Accent Scale
```css
:root {
  --color-accent-100: #FDF3E3;
  --color-accent-200: #F5E6CC;
  --color-accent-300: #E8C98A;
  --color-accent-400: #D9A85C;
  --color-accent-500: #C98A3D;
  --color-accent-600: #A86F2A;
  --color-accent-700: #86561A;
  --color-accent-800: #634010;
}
```

#### Color — Borders
```css
:root {
  --color-border: #D3C3BC;
  --color-border-strong: #81746F;
  --color-border-subtle: #EAE4DC;
}
```

#### Color — Feedback
```css
:root {
  --color-error: #BA1A1A;
  --color-error-container: #FFDAD6;
  --color-error-on-container: #93000A;
  --color-success: #2E7D32;
  --color-success-container: #D4EDDA;
  --color-warning: #C98A3D;
  --color-warning-container: #F5E6CC;
}
```

#### Elevation — Shadows (espresso-tinted, not black)
```css
:root {
  --shadow-sm: 0 1px 4px rgba(74, 52, 40, 0.08);
  --shadow-md: 0 4px 16px rgba(74, 52, 40, 0.10);
  --shadow-lg: 0 8px 32px rgba(74, 52, 40, 0.12);
  --shadow-xl: 0 16px 48px rgba(74, 52, 40, 0.14);
}
```

#### Typography — Font Families
These reference the CSS variables injected by `next/font/google` (see section 2.4):
```css
:root {
  --font-display: var(--font-playfair), Georgia, serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
}
```

#### Typography — Type Scale
```css
:root {
  /* Size */
  --text-size-display-xl: 64px;
  --text-size-headline-lg: 48px;
  --text-size-headline-lg-mobile: 32px;
  --text-size-headline-md: 32px;
  --text-size-headline-sm: 24px;
  --text-size-body-lg: 18px;
  --text-size-body-md: 16px;
  --text-size-body-sm: 14px;
  --text-size-label-md: 14px;
  --text-size-label-sm: 12px;
  --text-size-price: 20px;
  --text-size-display-number: 40px;

  /* Line height */
  --text-lh-display-xl: 72px;
  --text-lh-headline-lg: 56px;
  --text-lh-headline-lg-mobile: 40px;
  --text-lh-headline-md: 40px;
  --text-lh-headline-sm: 32px;
  --text-lh-body-lg: 28px;
  --text-lh-body-md: 24px;
  --text-lh-body-sm: 20px;
  --text-lh-label-md: 20px;
  --text-lh-label-sm: 16px;
  --text-lh-price: 28px;
  --text-lh-display-number: 48px;

  /* Letter spacing */
  --text-ls-display-xl: -0.02em;
  --text-ls-label-md: 0.05em;
  --text-ls-label-sm: 0.04em;
  --text-ls-display-number: -0.01em;
}
```

#### Border Radius Scale
```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-3xl: 32px;
  --radius-full: 9999px;
}
```

#### Spacing Scale
```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
  --container-max: 1280px;
}
```

---

### 2.4 Global CSS File — `styles/global.css`

Create `styles/global.css`. This file imports `tokens.css` and defines base resets and element defaults. It must not contain any hardcoded values — it references only custom properties from `tokens.css`.

```css
@import './tokens.css';

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  line-height: var(--text-lh-body-md);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-height: 100vh;
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  color: var(--color-text-heading);
  font-weight: 600;
}

a {
  color: inherit;
  text-decoration: none;
}

img, video {
  max-width: 100%;
  display: block;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: var(--font-body);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 2.5 Root Layout — `app/layout.tsx`

Replace the generated `app/layout.tsx` with the following:

- Import Playfair Display (`weights: [500, 600, 700]`, `subsets: ['latin']`, `variable: '--font-playfair'`)
- Import Inter (`weights: [400, 500, 600, 700]`, `subsets: ['latin']`, `variable: '--font-inter'`)
- Import `styles/global.css`
- Apply both font variables to the `<html>` element's `className`
- Set the default `<html>` `lang` attribute to `"en"`
- Export a `metadata` object with a default `title` of `"COVE — Korean-Inspired Café & Lounge, Aizawl"` and a default `description`

```tsx
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import '../styles/global.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'COVE — Korean-Inspired Café & Lounge, Aizawl',
  description:
    'COVE is a premium Korean-inspired café and entertainment lounge in Aizawl, Mizoram. Book private rooms, order food, and explore specialty coffee, a cat café, pool table, and photobooth.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

---

### 2.6 Proof-of-Life Page — `app/page.tsx`

Replace the generated `app/page.tsx` with a minimal page that visually proves the design system is live. This is not the real homepage (Unit 4) — it is a token validation page only.

The page must render:
- A centred container with `max-width: var(--container-max)` and `padding: var(--space-16) var(--space-5)`
- An `<h1>` using `font-family: var(--font-display)`, `font-size: var(--text-size-display-xl)`, `color: var(--color-text-heading)` — text: `"Welcome to COVE"`
- A `<p>` using `font-family: var(--font-body)`, `font-size: var(--text-size-body-lg)`, `color: var(--color-text-secondary)` — text: `"Seoul Serenity design system is live."`
- A primary button: `background: var(--color-primary)`, `color: var(--color-text-on-primary)`, `border-radius: var(--radius-lg)`, `padding: var(--space-3) var(--space-6)`, `font-family: var(--font-body)`, `font-size: var(--text-size-label-md)`, `font-weight: 600`, `box-shadow: var(--shadow-sm)` — label: `"Book a Room"`
- A CTA button: `background: var(--color-accent)`, `color: var(--color-text-on-amber)`, same padding and radius as primary — label: `"Order Food"`
- `page.module.css` is NOT used. Styles are written in a co-located `page.css` imported directly, or as inline `style` props using CSS variable references only.

---

### 2.7 ESLint Configuration

Update `.eslintrc.json` to add the `no-restricted-syntax` rule that prevents hardcoded hex values in `.css` files. This is a linting guardrail, not a build blocker:

```json
{
  "extends": "next/core-web-vitals"
}
```

No additional ESLint config is needed for this unit. The TypeScript strict mode is the primary guard.

---

### 2.8 TypeScript Configuration

Confirm `tsconfig.json` has `"strict": true` under `compilerOptions`. If the generated config does not include it, add it. Do not disable any other strict flags.

---

### 2.9 `.env.example`

Create `.env.example` at the project root. For Unit 1 it is empty except for placeholders for variables that will be added in Unit 2:

```
# Supabase (added in Unit 2)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Razorpay (added in Unit 9)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Also create `.env.local` (not committed) for local development. It is empty for Unit 1.

Confirm `.gitignore` includes `.env.local`. The generated Next.js `.gitignore` includes this by default — verify it is present.

---

## Dependencies

Install no additional packages beyond what `create-next-app` provides. `next/font/google` is built into Next.js and requires no separate install. No other packages are needed for this unit.

| Package | Source | Reason |
|---|---|---|
| `next` | Installed by `create-next-app` | Framework |
| `react` | Installed by `create-next-app` | UI library |
| `react-dom` | Installed by `create-next-app` | DOM renderer |
| `typescript` | Installed by `create-next-app` | Type safety |
| `@types/react` | Installed by `create-next-app` | React types |
| `@types/node` | Installed by `create-next-app` | Node types |
| `eslint` | Installed by `create-next-app` | Linting |
| `eslint-config-next` | Installed by `create-next-app` | Next.js ESLint rules |

No `npm install` commands are needed after project initialisation.

---

## Verification Checklist

Complete every item before marking Unit 1 done and starting Unit 2.

### Project Structure
- [ ] `npx create-next-app` completed without errors
- [ ] `npm run dev` starts the dev server on `localhost:3000` without errors
- [ ] `styles/tokens.css` exists and contains all custom property blocks listed in section 2.3
- [ ] `styles/global.css` exists, imports `tokens.css`, and contains the base reset
- [ ] `components/ui/` and `components/shared/` directories exist (empty)
- [ ] `lib/` directory exists (empty)
- [ ] Generated files deleted: `app/page.module.css`, `public/next.svg`, `public/vercel.svg`

### Fonts
- [ ] Playfair Display loads in the browser (visible in DevTools → Network, font files present)
- [ ] Inter loads in the browser (visible in DevTools → Network, font files present)
- [ ] DevTools → Elements shows `--font-playfair` and `--font-inter` CSS variables on the `<html>` element
- [ ] The `<h1>` on the proof-of-life page renders in Playfair Display (visually confirm — serif letterforms)
- [ ] The `<p>` on the proof-of-life page renders in Inter (visually confirm — sans-serif letterforms)

### Design Tokens
- [ ] DevTools → Elements → Computed Styles shows `background-color: #FEF9F1` on `<html>` or `<body>`
- [ ] DevTools → Elements → `--color-background` is visible as a CSS custom property on `:root`
- [ ] DevTools → Elements → `--color-accent` is `#C98A3D`
- [ ] DevTools → Elements → `--radius-lg` is `12px`
- [ ] DevTools → Elements → `--space-6` is `24px`
- [ ] No hex values appear in `global.css` (all values are `var(--...)`)
- [ ] No pixel values appear hardcoded in `global.css` (all values are `var(--...)`)

### Proof-of-Life Page
- [ ] `<h1>` text "Welcome to COVE" is visible in Playfair Display, color `#321F14`
- [ ] `<p>` text is visible in Inter, color `#4F453F`
- [ ] Primary button renders with espresso brown background (`#4A3428`) and white text
- [ ] CTA button renders with amber background (`#C98A3D`) and white text
- [ ] Page background is cream (`#FEF9F1`) — not pure white

### TypeScript
- [ ] `npx tsc --noEmit` runs without errors
- [ ] `tsconfig.json` has `"strict": true`

### Environment Files
- [ ] `.env.example` exists at project root with all placeholder variable names
- [ ] `.env.local` exists at project root (can be empty for Unit 1)
- [ ] `.gitignore` contains `.env.local`

### Next Step
- [ ] State the first task of Unit 2: create the Supabase project and run the first migration
