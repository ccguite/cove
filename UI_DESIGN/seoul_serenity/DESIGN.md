---
name: Seoul Serenity
colors:
  surface: '#fef9f1'
  surface-dim: '#ded9d2'
  surface-bright: '#fef9f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f3eb'
  surface-container: '#f2ede5'
  surface-container-high: '#ece8e0'
  surface-container-highest: '#e7e2da'
  on-surface: '#1d1c17'
  on-surface-variant: '#4f453f'
  inverse-surface: '#32302b'
  inverse-on-surface: '#f5f0e8'
  outline: '#81746f'
  outline-variant: '#d3c3bc'
  surface-tint: '#73594b'
  primary: '#321f14'
  on-primary: '#ffffff'
  primary-container: '#4a3428'
  on-primary-container: '#bb9c8c'
  inverse-primary: '#e1c0af'
  secondary: '#665d50'
  on-secondary: '#ffffff'
  secondary-container: '#eadecd'
  on-secondary-container: '#6a6154'
  tertiary: '#361e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#543100'
  on-tertiary-container: '#d69547'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#e1c0af'
  on-primary-fixed: '#29170d'
  on-primary-fixed-variant: '#594235'
  secondary-fixed: '#ede1d0'
  secondary-fixed-dim: '#d0c5b5'
  on-secondary-fixed: '#201b10'
  on-secondary-fixed-variant: '#4d4639'
  tertiary-fixed: '#ffddba'
  tertiary-fixed-dim: '#ffb867'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#fef9f1'
  on-background: '#1d1c17'
  surface-variant: '#e7e2da'
typography:
  display-xl:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system is built to evoke the refined tranquility of a high-end Seoul café. The brand personality is grounded in **premium hospitality**, blending traditional warmth with modern architectural precision. It targets a discerning audience that values aesthetics, "Instagram-worthy" moments, and a slow-living philosophy.

The visual style is a fusion of **Minimalism** and **Tactile Modernism**. It prioritizes generous whitespace to create "breathing room," allowing high-quality lifestyle photography to serve as the primary visual anchor. The interface should feel as tactile as a ceramic mug or a linen napkin—achieved through soft, diffused shadows and a color palette that feels organic and "baked-in" rather than digital and flat.

## Colors

The palette is inspired by the roasting process and the natural materials found in contemporary Korean architecture. 

- **Espresso Brown (#4A3428):** Used for primary branding and all high-hierarchy typography. It provides a softer, warmer alternative to pure black.
- **Cream (#F8F3EB):** The primary canvas. It reduces eye strain and provides a much "cozier" feel than a stark white background.
- **Warm Beige (#E8DCCB):** Used for secondary containers, subtle section backgrounds, and border accents.
- **Soft Amber (#C98A3D):** The high-contrast accent. Reserved strictly for calls to action, active states, and highlights to guide the user’s eye through the "warmth" of the layout.

## Typography

This design system utilizes a high-contrast typographic pairing to balance editorial elegance with functional clarity.

- **Playfair Display** (Headlines) provides a sophisticated, literary feel. It should be used for large titles, quotes, and section headers. Tighten letter spacing slightly on larger display sizes for a more "locked-in" editorial look.
- **Inter** (Body/Labels) ensures that menus, descriptions, and booking flows remain highly legible. Use Inter for all interactive components and long-form content.

**Weight usage:**
- Reserved **Bold** weights of Playfair Display for key brand moments only.
- Use **Medium** for labels to ensure they stand out against the soft beige backgrounds.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** approach for desktop to maintain a curated, boutique feel, centering the content within a maximum width. 

- **Grid:** A 12-column grid system with 24px gutters.
- **Margins:** Intentional use of "oversized" margins (64px+) on desktop creates a sense of luxury and exclusivity.
- **Rhythm:** An 8px base unit drives all padding and margin decisions. 
- **Adaptation:** On mobile, margins shrink to 20px, and typography scales down to maintain balance. Multi-column card layouts reflow to a single-column stack to prioritize the verticality of lifestyle photography.

## Elevation & Depth

Visual hierarchy in this design system is achieved through **Tonal Layering** and **Ambient Shadows**.

- **Surfaces:** Use the Warm Beige (#E8DCCB) for elements that sit one level above the Cream (#F8F3EB) background. This creates depth without requiring high-contrast borders.
- **Shadows:** Avoid harsh, dark shadows. Instead, use "Umbra" shadows that are low-opacity (8-12%) and heavily diffused (20px-40px blur), tinted with a hint of the Espresso Brown (#4A3428) color. This makes elements appear to float gently above the surface like soft light hitting a café table.
- **Imagery:** Photos should have a slight inner glow or very thin (1px) borders in a shade slightly darker than the background to ground them.

## Shapes

The shape language is defined by **organic softness**. 

- **Rounded Corners:** A base radius of 0.5rem (8px) is used for standard components like input fields. 
- **Large Components:** Cards and booking modules use `rounded-lg` (16px) or `rounded-xl` (24px) to emphasize the "cozy" and "inviting" nature of the brand.
- **Photography:** All images should feature rounded corners to match the UI elements, reinforcing the soft, modern Seoul aesthetic.

## Components

### Buttons
- **Primary:** Espresso Brown background with Cream text. High-contrast and authoritative.
- **Secondary:** Transparent background with an Espresso Brown border (1px) or Warm Beige background.
- **CTA (Soft Amber):** Reserved for "Book Now" or "Purchase" actions. 
- **Styling:** All buttons use `rounded-xl` and Medium Inter typography.

### Cards
- **Product/Café Cards:** Cream background with a subtle ambient shadow. Images should be the hero, using a 4:5 aspect ratio for an editorial feel.
- **Booking Cards:** Warm Beige background to differentiate the "utility" from the "inspiration."

### Forms & Inputs
- **Inputs:** Minimalist with a 1px bottom border or a light beige background fill. Focus states should transition the border color to Espresso Brown or Soft Amber.
- **Checkboxes/Radios:** Use the Soft Amber for active states to provide a warm, clear feedback loop.

### Booking Elements
- **Date Pickers:** Should be spacious with high contrast between the Espresso text and Cream background.
- **Chips:** Used for "Time Slots" or "Amenities." Pill-shaped with a Beige background, turning Espresso Brown when selected.