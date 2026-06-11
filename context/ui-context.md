# COVE — UI Context & Token System

Design system: **Seoul Serenity**
Brand personality: Premium Korean café hospitality. Warm minimalism. Tactile, editorial, Instagram-worthy.
Font sources: [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) · [Inter](https://fonts.google.com/specimen/Inter)

---

## Color Tokens

### Core Palette (Raw Values)

These are the four foundational brand colors. All semantic tokens are derived from them. Never use these directly in component styles — use semantic tokens instead.

| Token Name | Hex | Description |
|---|---|---|
| `--color-espresso` | `#4A3428` | Primary brand color. Roasted espresso. Used for branding and high-hierarchy type. |
| `--color-espresso-deep` | `#321F14` | Deeper espresso. Used for headings on light backgrounds. |
| `--color-cream` | `#F8F3EB` | Primary canvas. Warm off-white. Replaces pure white everywhere. |
| `--color-beige` | `#E8DCCB` | Secondary surface. Warm beige. Used for cards, section fills, borders. |
| `--color-amber` | `#C98A3D` | Accent. Soft amber. Reserved strictly for CTAs, active states, highlights. |
| `--color-amber-dim` | `#A86F2A` | Darker amber. Used for hover states on CTA buttons only. |
| `--color-amber-subtle` | `#F5E6CC` | Pale amber. Used for amber-tinted backgrounds (active chips, focus fills). |

---

### Semantic Surface Tokens

| Token Name | Hex | Role |
|---|---|---|
| `--color-background` | `#FEF9F1` | Page background. The outermost canvas. |
| `--color-surface` | `#F8F3EB` | Default surface (cards, panels). One level above background. |
| `--color-surface-low` | `#F2EDE5` | Subtle surface variation. Section backgrounds, alternating rows. |
| `--color-surface-high` | `#ECE8E0` | Elevated surface. Modals, dropdowns, hover states on cards. |
| `--color-surface-highest` | `#E7E2DA` | Highest surface level. Active/selected containers. |
| `--color-surface-white` | `#FFFFFF` | Pure white. Used sparingly for inputs and overlays only. |
| `--color-surface-inverse` | `#32302B` | Dark surface. Used for dark-mode panels, overlays, footer. |

---

### Semantic Text Tokens

| Token Name | Hex | Role |
|---|---|---|
| `--color-text-primary` | `#1D1C17` | Default body text. Near-black on cream. |
| `--color-text-secondary` | `#4F453F` | Subdued text. Descriptions, captions, placeholders. |
| `--color-text-heading` | `#321F14` | All headings (Playfair Display). Deep espresso. |
| `--color-text-on-dark` | `#F5F0E8` | Text on dark/inverse surfaces (footer, overlays). |
| `--color-text-on-primary` | `#FFFFFF` | Text on espresso-brown buttons and filled surfaces. |
| `--color-text-on-amber` | `#FFFFFF` | Text on amber CTA buttons. |
| `--color-text-disabled` | `#B0A89F` | Disabled state text. Not interactive. |

---

### Semantic Interactive / Brand Tokens

| Token Name | Hex | Role |
|---|---|---|
| `--color-primary` | `#4A3428` | Primary brand. Espresso brown. Used on primary buttons, active nav items. |
| `--color-primary-deep` | `#321F14` | Deep primary. Hover state for primary button backgrounds. |
| `--color-primary-container` | `#E1C0AF` | Tinted primary container. Badge backgrounds, selection highlights. |
| `--color-secondary` | `#665D50` | Secondary actions. Outlined buttons, secondary labels. |
| `--color-secondary-container` | `#EAD ECD` | Secondary container backgrounds. |
| `--color-accent` | `#C98A3D` | Amber accent. CTA buttons (Book Now, Order), active states, focus rings. |
| `--color-accent-hover` | `#A86F2A` | Amber hover. Darkened accent for button hover and pressed states. |
| `--color-accent-subtle` | `#F5E6CC` | Pale amber. Active chip fill, input focus background. |
| `--color-tertiary` | `#D69547` | Warm gold. Decorative accents, star ratings, seasonal badges. |

---

### Semantic Border & Outline Tokens

| Token Name | Hex | Role |
|---|---|---|
| `--color-border` | `#D3C3BC` | Default border. Input fields, card edges, dividers. |
| `--color-border-strong` | `#81746F` | Stronger border. Focused input outlines, active form fields. |
| `--color-border-subtle` | `#EAE4DC` | Faintest border. Section separators, image frames. |

---

### Semantic Feedback Tokens

| Token Name | Hex | Role |
|---|---|---|
| `--color-error` | `#BA1A1A` | Error text and icons. |
| `--color-error-container` | `#FFDAD6` | Error message background. |
| `--color-error-on-container` | `#93000A` | Text inside error containers. |
| `--color-success` | `#2E7D32` | Order confirmed, booking confirmed states. |
| `--color-success-container` | `#D4EDDA` | Success message background. |
| `--color-warning` | `#C98A3D` | Warning states (reuses amber — fits the warm palette). |
| `--color-warning-container` | `#F5E6CC` | Warning background (reuses amber-subtle). |

---

### Elevation / Shadow Tokens

Shadows use a low-opacity espresso tint (not black) to stay warm.

| Token Name | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 4px rgba(74, 52, 40, 0.08)` | Subtle lift. Chips, small badges. |
| `--shadow-md` | `0 4px 16px rgba(74, 52, 40, 0.10)` | Cards, panels, dropdowns. |
| `--shadow-lg` | `0 8px 32px rgba(74, 52, 40, 0.12)` | Modals, booking cards, floating elements. |
| `--shadow-xl` | `0 16px 48px rgba(74, 52, 40, 0.14)` | Full-screen overlays, hero cards. |

---

## Typography Tokens

### Font Families

| Token Name | Value | Role |
|---|---|---|
| `--font-display` | `'Playfair Display', Georgia, serif` | All headings, display text, hero titles |
| `--font-body` | `'Inter', system-ui, sans-serif` | All body text, labels, UI components, forms |

---

### Type Scale

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing | Role |
|---|---|---|---|---|---|---|
| `--text-display-xl` | Playfair Display | `64px` | `700` | `72px` | `-0.02em` | Hero page title (desktop only) |
| `--text-headline-lg` | Playfair Display | `48px` | `600` | `56px` | `0` | Section hero headings (desktop) |
| `--text-headline-lg-mobile` | Playfair Display | `32px` | `600` | `40px` | `0` | Section hero headings (mobile) |
| `--text-headline-md` | Playfair Display | `32px` | `600` | `40px` | `0` | Sub-section titles, room names |
| `--text-headline-sm` | Playfair Display | `24px` | `500` | `32px` | `0` | Card headings, feature titles |
| `--text-body-lg` | Inter | `18px` | `400` | `28px` | `0` | Hero description text, feature intros |
| `--text-body-md` | Inter | `16px` | `400` | `24px` | `0` | Default body text, menu descriptions |
| `--text-body-sm` | Inter | `14px` | `400` | `20px` | `0` | Helper text, form hints, captions |
| `--text-label-md` | Inter | `14px` | `600` | `20px` | `0.05em` | Button labels, nav items, tags |
| `--text-label-sm` | Inter | `12px` | `500` | `16px` | `0.04em` | Badges, timestamps, legal text |
| `--text-price` | Inter | `20px` | `700` | `28px` | `0` | Prices, totals in booking/order flows |
| `--text-display-number` | Playfair Display | `40px` | `700` | `48px` | `-0.01em` | Large stat numbers, room capacity displays |

---

### Typography Usage Rules

| Context | Font | Weight | Token to Use |
|---|---|---|---|
| Page hero title | Playfair Display | Bold (700) | `--text-display-xl` |
| Section heading | Playfair Display | SemiBold (600) | `--text-headline-lg` |
| Card / room title | Playfair Display | Medium (500) | `--text-headline-sm` |
| Menu item name | Inter | SemiBold (600) | `--text-label-md` |
| Menu item description | Inter | Regular (400) | `--text-body-md` |
| Button label | Inter | SemiBold (600) | `--text-label-md` |
| Price display | Inter | Bold (700) | `--text-price` |
| Form input text | Inter | Regular (400) | `--text-body-md` |
| Form label | Inter | SemiBold (600) | `--text-label-md` |
| Footer text | Inter | Regular (400) | `--text-body-sm` |
| Badge / chip text | Inter | Medium (500) | `--text-label-sm` |

---

## Border Radius Scale

| Token Name | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Tags, small badges, status indicators |
| `--radius-md` | `8px` | Input fields, small buttons, image thumbnails |
| `--radius-lg` | `12px` | Standard buttons (all sizes) |
| `--radius-xl` | `16px` | Standard cards, menu item cards |
| `--radius-2xl` | `24px` | Booking cards, feature section panels, modals |
| `--radius-3xl` | `32px` | Hero image containers, large photo blocks |
| `--radius-full` | `9999px` | Pill chips (time slots, amenity tags), avatar frames, toggle switches |

---

## Spacing Scale

All spacing is derived from an 8px base unit.

| Token Name | Value | Usage |
|---|---|---|
| `--space-1` | `4px` | Micro gaps (icon-to-label, inline badge padding) |
| `--space-2` | `8px` | Tight padding (chip internal, small icon spacing) |
| `--space-3` | `12px` | Compact component padding (small cards, input internal) |
| `--space-4` | `16px` | Standard component padding (buttons, form fields) |
| `--space-5` | `20px` | Mobile page margin |
| `--space-6` | `24px` | Grid gutter, stack between components |
| `--space-8` | `32px` | Section inner padding |
| `--space-10` | `40px` | Between-section spacing (mobile) |
| `--space-12` | `48px` | Between-section spacing (desktop) |
| `--space-16` | `64px` | Desktop page margin, hero vertical padding |
| `--space-24` | `96px` | Major section separators |
| `--container-max` | `1280px` | Maximum content width |

---

## Accent Color Variants

The amber accent (`#C98A3D`) is the only accent color. These are its full variant set:

| Token Name | Hex | Role |
|---|---|---|
| `--color-accent-100` | `#FDF3E3` | Lightest tint. Hover backgrounds on subtle elements. |
| `--color-accent-200` | `#F5E6CC` | Pale amber. Active chip/filter fill. Input focus background. |
| `--color-accent-300` | `#E8C98A` | Light amber. Decorative border on amber-context elements. |
| `--color-accent-400` | `#D9A85C` | Mid amber. Icon fills, star rating color. |
| `--color-accent-500` | `#C98A3D` | **Base accent.** CTA buttons, active states. |
| `--color-accent-600` | `#A86F2A` | Hover state for CTA buttons. |
| `--color-accent-700` | `#86561A` | Pressed/active state for CTA buttons. |
| `--color-accent-800` | `#634010` | Dark accent. Used in icon-only contexts on white. |

---

## Component Color Map

Quick reference for how tokens apply to specific components.

| Component | Background | Text | Border | Shadow |
|---|---|---|---|---|
| Page | `--color-background` | `--color-text-primary` | — | — |
| Standard card | `--color-surface` | `--color-text-primary` | `--color-border-subtle` | `--shadow-md` |
| Booking card | `--color-surface-high` | `--color-text-primary` | `--color-border` | `--shadow-lg` |
| Primary button | `--color-primary` | `--color-text-on-primary` | — | `--shadow-sm` |
| Primary button hover | `--color-primary-deep` | `--color-text-on-primary` | — | `--shadow-md` |
| CTA button (Book/Order) | `--color-accent` | `--color-text-on-amber` | — | `--shadow-sm` |
| CTA button hover | `--color-accent-hover` | `--color-text-on-amber` | — | `--shadow-md` |
| Secondary button | transparent | `--color-primary` | `--color-primary` | — |
| Input (default) | `--color-surface-white` | `--color-text-primary` | `--color-border` | — |
| Input (focused) | `--color-accent-subtle` | `--color-text-primary` | `--color-border-strong` | — |
| Input (error) | `--color-error-container` | `--color-text-primary` | `--color-error` | — |
| Time slot chip (default) | `--color-surface-high` | `--color-text-secondary` | `--color-border` | — |
| Time slot chip (selected) | `--color-primary` | `--color-text-on-primary` | — | — |
| Sold-out chip | `--color-surface-highest` | `--color-text-disabled` | `--color-border-subtle` | — |
| Nav (active link) | transparent | `--color-accent` | — | — |
| Footer | `--color-surface-inverse` | `--color-text-on-dark` | — | — |
| Error message | `--color-error-container` | `--color-error-on-container` | `--color-error` | — |
| Success message | `--color-success-container` | `--color-success` | — | — |
