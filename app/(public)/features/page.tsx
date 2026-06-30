import Image from 'next/image';
import type { Metadata } from 'next';
import './page.css';

export const metadata: Metadata = {
  title: 'Walk-in Experiences & Amenities — COVE',
  description: 'Explore walk-in spaces at COVE in Aizawl, Mizoram: the Seoul-style Cat Café feline sanctuary, refined Billiards Lounge, and Korean-style self-serve Studio photobooth.',
  openGraph: {
    title: 'Walk-in Experiences & Amenities — COVE',
    description: 'Explore walk-in spaces at COVE in Aizawl, Mizoram: the Seoul-style Cat Café feline sanctuary, refined Billiards Lounge, and Korean-style self-serve Studio photobooth.',
    images: [
      {
        url: '/images/og-features.jpg',
        width: 1200,
        height: 630,
        alt: 'COVE Walk-in Experiences',
      },
    ],
  },
};

const EXPERIENCES = [
  {
    id: 'cat-cafe',
    name: 'Cat Café',
    slug: 'cat-cafe',
    tagline: 'Seoul-Style Feline Sanctuary',
    description: 'Unwind in our dedicated cat lounge, home to our friendly, well-groomed resident felines. Designed with cozy seating and vertical climbing spaces, it is the perfect spot to read a book, enjoy a specialty coffee, and spend time in calm, therapeutic company. We enforce strict hygiene protocols (hand sanitizing and shoe covers) to keep both guests and felines comfortable and safe.',
    pricing: 'COMING SOON!',
    hours: '10:00 AM - 10:00 PM',
    rules: ['Hand sanitizing required before entry', 'Shoe covers provided at door', 'Gentle handling only'],
    image: '/images/experiences/cat.png'
  },
  {
    id: 'billiards',
    name: 'Billiards Lounge',
    slug: 'billiards',
    tagline: 'Refined Leisure & Social Play',
    description: 'Enjoy a friendly game in our modern, stylishly appointed Billiards Lounge. Positioned next to the café bar, the lounge features a premium felt pool table, high-quality cues, and comfortable spectator seating. Perfect for evening wind-downs, casual matches, or socializing with friends while enjoying specialty beverages and snacks delivered directly to your table.',
    pricing: 'COMING SOON!',
    hours: '10:00 AM - 11:00 PM',
    rules: ['Maximum 4 players per table', 'Drinks allowed on side tables only', 'First-come, first-served basis'],
    image: '/images/experiences/pool.png'
  },
  {
    id: 'studio',
    name: 'Studio Booth',
    slug: 'studio',
    tagline: 'Korean-Style Self-Serve Photo Studio',
    description: 'Capture instant memories in our self-serve photography booth. Fitted with professional beauty lighting, a high-resolution DSLR camera, and a remote clicker, the booth allows you to take premium, studio-quality portraits at your own pace. Grab some fun accessories and props, print your favorite layouts immediately on custom COVE-branded strip templates, and receive digital copies directly to your phone via QR code.',
    pricing: 'COMING SOON!',
    hours: '10:00 AM - 11:00 PM',
    rules: ['10-minute active capture session', 'Unlimited shots during slot', 'Props must be returned to racks'],
    image: '/images/experiences/booth.png'
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

                {/* Coming Soon Indicator */}
                <div className="coming-soon-indicator">
                  <span className="material-symbols-outlined indicator-icon">lock</span>
                  <span className="indicator-text">Coming Soon</span>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
