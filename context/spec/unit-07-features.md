# Spec: Unit 7 — Features Page (Cat Café, Pool Table, Photobooth)

## Goal

Create the static marketing features page at `app/(public)/features/page.tsx` detailing COVE's three walk-in experiences (Cat Café, Billiards Lounge, and Studio Booth) with pricing, operational hours, and walk-in notices, styled using Vanilla CSS tokens.

---

## Design

### Page Layout & Structures
- **Header**: Simple centered header "Walk-in Experiences" with a subtitle explaining that no online reservations are needed (first-come, first-served basis).
- **Showcase Sections**: Three distinct scrollable sections corresponding to Cat Café, Billiards Lounge, and Studio Booth. 
- **Alternating Layout**: On desktop viewports, sections alternate layouts for an editorial feel:
  - Section 1 (Cat Café): Image left, content right.
  - Section 2 (Billiards Lounge): Content left, image right.
  - Section 3 (Studio Booth): Image left, content right.
  - On mobile viewports, all sections stack with the image positioned above the text.
- **Section Elements**: Each experience block contains:
  - High-resolution ambient image with a rounded corner frame.
  - Section title in Playfair Display.
  - Long description detailing the experience parameters, rules, or amenities.
  - Quick Info Badges: Pricing and hours displayed in a clean specs row.
  - "Walk-in Only" badge to prevent confusion with room booking.

### Styling & Tokens
- Canvas background uses cream (`--color-background`).
- Content panels use surface low/high borders to separate experiences clearly.
- Typography size matches `--text-size-headline-lg-mobile` / `--text-size-headline-md` for headers.
- Safe spacing tags (`--space-12`, `--space-16`, `--space-24`) partition the sections.

---

## Implementation

### 6.1 Folder Structure
Create files in the following directory layout:

```
cove/
└── app/
    └── (public)/
        └── features/
            ├── page.tsx          # Features showcase page
            └── page.css          # Features page stylesheet
```

---

### 6.2 Features Component — `app/(public)/features/page.tsx`
Create `app/(public)/features/page.tsx` with static experience details:

```tsx
import Image from 'next/image';
import './page.css';

const EXPERIENCES = [
  {
    id: 'cat-cafe',
    name: 'Cat Café',
    slug: 'cat-cafe',
    tagline: 'Seoul-Style Feline Sanctuary',
    description: 'Unwind in our dedicated cat lounge, home to our friendly, well-groomed resident felines. Designed with cozy seating and vertical climbing spaces, it is the perfect spot to read a book, enjoy a specialty coffee, and spend time in calm, therapeutic company. We enforce strict hygiene protocols (hand sanitizing and shoe covers) to keep both guests and felines comfortable and safe.',
    pricing: '₹150/hour (includes one welcome drink)',
    hours: '10:00 AM - 10:00 PM',
    rules: ['Hand sanitizing required before entry', 'Shoe covers provided at door', 'Gentle handling only'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4zrpROIgKvD3zfXD7FO4Jjoasv0Dd-3ZfGyo9p04oZmbOAhL-UAS7KM6QKPCrwkGgiD29ytcUohXyMuY5BPmR1yctX1VGs_WWaspFc4FGeweM2Cs37IvAJvV-AxnmT9973Tf8svyQkb-f8NS8XUJ3NFIdDKNNeKp1uvm9IQ18C-ZiGsk6Hf-d_kVvT953wOrm87--LnyMzw9FhYneYlh_I_B88oZfkMNwDlEssMsZOvjthw4Gd39ZtZz4x82TN9xkzqAuhxjpQ8Q3'
  },
  {
    id: 'billiards',
    name: 'Billiards Lounge',
    slug: 'billiards',
    tagline: 'Refined Leisure & Social Play',
    description: 'Enjoy a friendly game in our modern, stylishly appointed Billiards Lounge. Positioned next to the café bar, the lounge features a premium felt pool table, high-quality cues, and comfortable spectator seating. Perfect for evening wind-downs, casual matches, or socializing with friends while enjoying specialty beverages and snacks delivered directly to your table.',
    pricing: '₹250/hour per table (all equipment included)',
    hours: '10:00 AM - 11:00 PM',
    rules: ['Maximum 4 players per table', 'Drinks allowed on side tables only', 'First-come, first-served basis'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs1M43Z4yCbvTZu8hzNVtRgB4Ntmr-aUYGpyAYsCw6-5VblmaH1E0TNykciEIMYPixQNqAnhWYbOZZIf9pSgDAoNxxEqxFO8zeRUQrPoUU22X0HhYz3jFQiSAJtER78kVmTXEGma1ENckfZZr-kujYSEu_T8nSv3JunXiQgjpEYFHXfMIaaVKep8mw73RghbV57XTnK5XNpoAKeeOFsNiuEwWy3pyMk1CnV_DWEmqD4eMr97IAF6GMIANesm1qEpa4atDwTPMkLVv_'
  },
  {
    id: 'studio',
    name: 'Studio Booth',
    slug: 'studio',
    tagline: 'Korean-Style Self-Serve Photo Studio',
    description: 'Capture instant memories in our self-serve photography booth. Fitted with professional beauty lighting, a high-resolution DSLR camera, and a remote clicker, the booth allows you to take premium, studio-quality portraits at your own pace. Grab some fun accessories and props, print your favorite layouts immediately on custom COVE-branded strip templates, and receive digital copies directly to your phone via QR code.',
    pricing: '₹300 per session (includes 2 physical prints + digital copies)',
    hours: '10:00 AM - 11:00 PM',
    rules: ['10-minute active capture session', 'Unlimited shots during slot', 'Props must be returned to racks'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPkXduHrgdofMcig4xo0Zz0z4EB5XfSgLShOLjT6-H4SY5tWnEq4C3Ak_G51vRq4EQiNKuD1XNA5_krzcADh8NT1dccsaIAtfeLfA22HiHHd8TVJefE9Y9O6EmHzHUTd2rVL6DioRkvKANP11RzyasXvGGHqWVSE70vtLM0iyiF5udHQ-et6du95xQ58C0PNFQfzdN-6XLlxqS6s_2fTQUqCHRrfsHQqIWTEz4olj7BmF0sscdgid8bf-EQaaW4vcaKAXqVwWFeKbq'
  }
];

export default function FeaturesPage() {
  return (
    <div className="features-page">
      {/* Header */}
      <div className="features-header">
        <h1 className="features-title">Walk-in Experiences</h1>
        <p className="features-subtitle">
          Discover our dedicated walk-in spaces designed for leisure, play, and memories. 
          No reservations required — simply visit and check in at the counter.
        </p>
      </div>

      {/* Showcases */}
      <div className="experiences-list">
        {EXPERIENCES.map((exp, index) => {
          const isEven = index % 2 === 0;
          return (
            <section
              key={exp.id}
              className={`experience-row ${isEven ? 'layout-normal' : 'layout-reverse'}`}
            >
              {/* Image Frame */}
              <div className="experience-image-container">
                <div className="aspect-box-4-3">
                  <Image
                    src={exp.image}
                    alt={exp.name}
                    fill
                    className="experience-image"
                  />
                </div>
              </div>

              {/* Content Box */}
              <div className="experience-content-box">
                <span className="experience-badge">Walk-in Experience</span>
                <h2 className="experience-name">{exp.name}</h2>
                <span className="experience-tagline">{exp.tagline}</span>
                <p className="experience-desc">{exp.description}</p>

                {/* Quick Info Specs */}
                <div className="experience-info-table">
                  <div className="info-row">
                    <span className="material-symbols-outlined info-icon">payments</span>
                    <div className="info-text">
                      <span className="info-label">Pricing</span>
                      <span className="info-val">{exp.pricing}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="material-symbols-outlined info-icon">schedule</span>
                    <div className="info-text">
                      <span className="info-label">Operating Hours</span>
                      <span className="info-val">{exp.hours}</span>
                    </div>
                  </div>
                </div>

                {/* Rules List */}
                <div className="experience-rules">
                  <h4 className="rules-heading">Sanctuary Rules</h4>
                  <ul className="rules-list">
                    {exp.rules.map((rule) => (
                      <li key={rule} className="rule-item">
                        <span className="material-symbols-outlined rule-check">check_circle</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

---

### 6.3 Features Page Styles — `app/(public)/features/page.css`
Create `app/(public)/features/page.css` using tokens:

```css
.features-page {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--space-8) var(--space-5) var(--space-16);
}

@media (min-width: 768px) {
  .features-page {
    padding: var(--space-12) var(--space-16) var(--space-24);
  }
}

.features-header {
  margin-bottom: var(--space-16);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.features-title {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-lg-mobile);
  line-height: var(--text-lh-headline-lg-mobile);
  color: var(--color-text-heading);
  font-weight: 600;
}

@media (min-width: 768px) {
  .features-title {
    font-size: var(--text-size-headline-lg);
    line-height: var(--text-lh-headline-lg);
  }
}

.features-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-size-body-lg);
  line-height: var(--text-lh-body-lg);
  color: var(--color-text-secondary);
  max-width: 44rem;
}

.experiences-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-24);
}

.experience-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  align-items: center;
  padding-bottom: var(--space-16);
  border-bottom: thin solid var(--color-border-subtle);
}

.experience-row:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

@media (min-width: 1024px) {
  .experience-row {
    flex-direction: row;
    gap: var(--space-12);
  }

  .experience-row.layout-reverse {
    flex-direction: row-reverse;
  }
}

.experience-image-container {
  width: 100%;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: thin solid var(--color-border-subtle);
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .experience-image-container {
    width: 28rem;
  }
}

.aspect-box-4-3 {
  position: relative;
  width: 100%;
  padding-top: 75%;
}

.experience-image {
  object-fit: cover;
  transition: transform 0.5s ease;
}

.experience-row:hover .experience-image {
  transform: scale(1.03);
}

.experience-content-box {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.experience-badge {
  font-family: var(--font-body);
  font-size: var(--text-size-label-sm);
  font-weight: 600;
  color: var(--color-accent);
  text-transform: uppercase;
  letter-spacing: var(--text-ls-label-sm);
  margin-bottom: var(--space-1);
}

.experience-name {
  font-family: var(--font-display);
  font-size: var(--text-size-headline-md);
  line-height: var(--text-lh-headline-md);
  color: var(--color-text-heading);
  font-weight: 600;
}

.experience-tagline {
  font-family: var(--font-body);
  font-size: var(--text-size-body-lg);
  font-style: italic;
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
  margin-bottom: var(--space-4);
}

.experience-desc {
  font-family: var(--font-body);
  font-size: var(--text-size-body-md);
  line-height: var(--text-lh-body-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

.experience-info-table {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  background-color: var(--color-surface-low);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: thin solid var(--color-border-subtle);
  margin-bottom: var(--space-6);
}

@media (min-width: 640px) {
  .experience-info-table {
    flex-direction: row;
    gap: var(--space-8);
  }
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.info-icon {
  font-size: var(--text-size-headline-sm);
  color: var(--color-primary);
}

.info-text {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-family: var(--font-body);
  font-size: var(--text-size-label-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.info-val {
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.experience-rules {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.rules-heading {
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  list-style: none;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  color: var(--color-text-secondary);
}

.rule-check {
  font-size: var(--text-size-body-md);
  color: var(--color-success);
}
```

---

## Dependencies

No additional external packages are required.

---

## Verification Checklist

### Layout & Responsiveness
- [ ] Showcase page resolves at `/features`.
- [ ] Grid and flex configurations align side-by-side on desktop and stack cleanly on mobile devices.
- [ ] Section layouts alternate on desktop viewports (image left, then image right) and default stack on mobile.
- [ ] Clean zoom effects on hover states for all feature images.

### Copy & Details
- [ ] Cat Café, Billiards Lounge, and Studio Booth sections present accurate descriptions, pricing structures, and hours.
- [ ] Pricing and hours are displayed clearly using specs row cards.
- [ ] Sanctuary rules are listed with check icons.

### General & SEO
- [ ] Statically generated.
- [ ] Correct SEO metadata and page title.
- [ ] `npx tsc --noEmit` runs with zero compilation issues.

