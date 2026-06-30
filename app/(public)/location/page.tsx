import React from 'react';
import type { Metadata } from 'next';
import './page.css';

export const metadata: Metadata = {
  title: 'Location & Hours — COVE Café & Lounge',
  description: 'Find COVE Café & Lounge in Aizawl, Mizoram. Check our operating hours, contact details, and delivery radius boundary.',
  openGraph: {
    title: 'Location & Hours — COVE Café & Lounge',
    description: 'Find COVE Café & Lounge in Aizawl, Mizoram. Check our operating hours, contact details, and delivery radius boundary.',
  },
};

export default function LocationPage() {
  // Coordinates for COVE Café: 23.7342° N, 92.7214° E (Chhinga Veng, Aizawl)
  const mapOpenUrl = 'https://www.google.com/maps/search/?api=1&query=23.7342,92.7214';

  return (
    <div className="location-page">
      {/* Hero Header */}
      <section className="location-hero">
        <div className="location-header-text">
          <span className="section-label">Find Us</span>
          <h1 className="location-title">Our Location &amp; Hours</h1>
          <p className="location-subtitle">
            We are located in the heart of Aizawl. Visit us for an premium, Korean-inspired café and private lounge experience.
          </p>
        </div>
      </section>

      {/* Main Info Columns */}
      <section className="location-info-section">
        <div className="location-grid">
          {/* Card 1: Address & Contacts */}
          <div className="location-card">
            <span className="material-symbols-outlined card-icon">location_on</span>
            <h2 className="card-title">Address &amp; Contact</h2>
            <p className="card-detail-text">
              COVE Café &amp; Lounge<br />
              Chhinga Veng, Aizawl - 796005<br />
              Mizoram, India
            </p>
            <div className="contact-details">
              <a href="tel:+919366307520" className="contact-link">
                <span className="material-symbols-outlined contact-icon">phone</span>
                +91 93663 07520
              </a>
              <a href="mailto:contactcoveteam@gmail.com" className="contact-link">
                <span className="material-symbols-outlined contact-icon">mail</span>
                contactcoveteam@gmail.com
              </a>
            </div>
          </div>

          {/* Card 2: Operating Hours */}
          <div className="location-card">
            <span className="material-symbols-outlined card-icon">schedule</span>
            <h2 className="card-title">Operating Hours</h2>
            <div className="hours-list">
              <div className="hours-row">
                <span className="day">Monday - Sunday</span>
                <span className="time">10:00 AM - 11:00 PM</span>
              </div>
              <div className="hours-row highlight">
                <span className="day">Private Rooms</span>
                <span className="time">10:00 AM - 11:00 PM</span>
              </div>
              <div className="hours-row">
                <span className="day">Kitchen Last Order</span>
                <span className="time">10:30 PM</span>
              </div>
            </div>
            <p className="hours-helper">
              *Private experience rooms must be reserved online. Walk-ins are subject to slot availability.
            </p>
          </div>

        </div>
      </section>

      {/* Map Section */}
      <section className="location-map-section">
        <div className="map-container-box">
          <div className="map-placeholder-graphic" style={{ height: '450px', padding: 0 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.8!2d92.7194!3d23.7342!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x374d93c0b0000001%3A0x1!2sChhinga%20Veng%2C%20Aizawl%2C%20Mizoram%20796005!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="COVE Café &amp; Lounge Location Map"
            ></iframe>
          </div>
          <div className="map-action-bar">
            <a
              href={mapOpenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-open-maps"
            >
              <span className="material-symbols-outlined">map</span>
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
