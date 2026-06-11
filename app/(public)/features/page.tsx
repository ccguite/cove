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
