import Link from "next/link";
import { ZentrixaContactForm } from "@/components/zentrixa-contact-form";
import { ZentrixaLogo } from "@/components/zentrixa-logo";

const painPoints = [
  "Your website looks fine, but it is not turning visitors into paying customers.",
  "Leads come in, but weak follow-up means too many of them disappear.",
  "You are spending money on marketing without a system that actually converts it.",
  "You do not have time to manage tech, websites, forms, and follow-up on top of the business."
];

const solutions = [
  "We build the website, lead capture, and follow-up flow for you.",
  "We create a system that helps turn attention into real incoming customers.",
  "We make the experience simple, fast, and built around conversion.",
  "We handle the moving parts so you can stay focused on running the business."
];

const whyZentrixa = [
  "Done-for-you setup from start to finish",
  "Built to convert, not just look good",
  "Fast turnaround in days, not months",
  "No technical skills needed on your side",
  "Direct communication with us, not a giant team",
  "Focused on real business results"
];

const pricing = [
  {
    title: "Website Setup",
    price: "Starting at $299",
    highlight: false,
    points: [
      "Custom website design",
      "Mobile optimized",
      "Lead capture setup",
      "Built to convert visitors into customers"
    ]
  },
  {
    title: "Monthly Content & Growth",
    price: "From $79/month",
    highlight: true,
    points: [
      "Content creation",
      "Ongoing updates",
      "Performance-focused improvements"
    ]
  },
  {
    title: "Content + Ads Management",
    price: "From $150/month",
    highlight: false,
    points: [
      "Content creation",
      "Ad campaign setup & management",
      "Optimization for better results"
    ]
  }
];

export default function HomePage() {
  return (
    <main className="zentrixa-site">
      <section className="zentrixa-hero-shell">
        <header className="zentrixa-nav">
          <Link href="/" className="zentrixa-brandmark" aria-label="Zentrixa home">
            <ZentrixaLogo variant="full" className="zentrixa-brand-image" priority />
          </Link>
          <div className="zentrixa-nav-actions">
            <a href="tel:9055809902" className="zentrixa-button ghost">Call Us</a>
            <a href="#contact" className="zentrixa-button subtle">Email Us</a>
            <a href="#contact" className="zentrixa-button subtle">Book With Us</a>
          </div>
        </header>

        <div className="zentrixa-hero">
          <div className="zentrixa-hero-copy">
            <span className="zentrixa-eyebrow">Done-For-You Growth</span>
            <h1>We Build the Sales System That Helps Local Businesses Get More Customers.</h1>
            <p>
              Zentrixa handles the website, lead capture, marketing structure, and follow-up system for you.
              No tech headaches. No complicated setup. Just a cleaner path from visitor to customer.
            </p>
            <div className="zentrixa-hero-actions">
              <a href="tel:9055809902" className="zentrixa-button primary">Call Now</a>
              <a href="#contact" className="zentrixa-button secondary">Get More Customers</a>
            </div>
            <div className="zentrixa-hero-trust">
              <span>We handle everything</span>
              <span>Built for local business results</span>
              <span>Fast setup and direct support</span>
            </div>
          </div>

          <div className="zentrixa-hero-panel premium">
            <div className="zentrixa-hero-visual-top">
              <div className="zentrixa-visual-label">System Snapshot</div>
              <div className="zentrixa-visual-status">Built for calls, leads, and follow-up</div>
            </div>
            <div className="zentrixa-panel-grid compact">
              <article className="zentrixa-stat-card dense">
                <strong>Website</strong>
                <span>Designed to convert visitors instead of just looking nice.</span>
              </article>
              <article className="zentrixa-stat-card dense">
                <strong>Capture</strong>
                <span>Simple forms and clear calls-to-action that bring people in.</span>
              </article>
              <article className="zentrixa-stat-card dense">
                <strong>Follow-Up</strong>
                <span>No more losing warm leads because nobody got back to them fast enough.</span>
              </article>
              <article className="zentrixa-stat-card dense">
                <strong>Growth</strong>
                <span>A complete done-for-you system built around getting you more customers.</span>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="zentrixa-section zentrixa-problem">
        <div className="zentrixa-section-head">
          <span className="zentrixa-eyebrow">The Problem</span>
          <h2>Too many businesses lose customers because the system behind the business is broken.</h2>
        </div>
        <div className="zentrixa-card-grid four compact">
          {painPoints.map((item) => (
            <article key={item} className="zentrixa-surface-card dense">
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="zentrixa-section">
        <div className="zentrixa-section-head">
          <span className="zentrixa-eyebrow">The Solution</span>
          <h2>We build the system. You stay focused on running the business.</h2>
        </div>
        <div className="zentrixa-card-grid two compact">
          {solutions.map((item) => (
            <article key={item} className="zentrixa-surface-card dense">
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="zentrixa-section">
        <div className="zentrixa-section-head">
          <span className="zentrixa-eyebrow">Why Zentrixa</span>
          <h2>Done-for-you help built for speed, clarity, and real results.</h2>
        </div>
        <div className="zentrixa-card-grid three compact">
          {whyZentrixa.map((item) => (
            <article key={item} className="zentrixa-surface-card why-card">
              <span className="zentrixa-check-dot" />
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="zentrixa-section">
        <div className="zentrixa-section-head">
          <span className="zentrixa-eyebrow">How It Works</span>
          <h2>Simple timelines. Clear execution. Built to move fast.</h2>
        </div>
        <div className="zentrixa-card-grid three compact">
          <article className="zentrixa-process-card">
            <span className="zentrixa-step">01</span>
            <h3>Setup & strategy</h3>
            <p>1-2 days. We map out the offer, structure, and system around your business.</p>
          </article>
          <article className="zentrixa-process-card">
            <span className="zentrixa-step">02</span>
            <h3>Build & launch</h3>
            <p>5-7 days. We build the site, capture flow, and launch-ready experience.</p>
          </article>
          <article className="zentrixa-process-card">
            <span className="zentrixa-step">03</span>
            <h3>Capture & grow</h3>
            <p>Ongoing. We keep improving the system so more attention turns into customers.</p>
          </article>
        </div>
      </section>

      <section className="zentrixa-section">
        <div className="zentrixa-section-head">
          <span className="zentrixa-eyebrow">Pricing</span>
          <h2>Simple pricing. Built for results.</h2>
        </div>
        <div className="zentrixa-card-grid three compact pricing-grid">
          {pricing.map((item) => (
            <article key={item.title} className={`zentrixa-pricing-card${item.highlight ? " highlighted" : ""}`}>
              <div className="zentrixa-pricing-head">
                <span className="zentrixa-eyebrow">Package</span>
                <h3>{item.title}</h3>
                <strong>{item.price}</strong>
              </div>
              <div className="zentrixa-pricing-points">
                {item.points.map((point) => (
                  <div key={point} className="zentrixa-check-row">
                    <span className="zentrixa-check-dot" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="zentrixa-limited-note">Limited spots available for new clients.</div>
      </section>

      <section className="zentrixa-section">
        <div className="zentrixa-founder-card">
          <div>
            <span className="zentrixa-eyebrow">Founder Trust</span>
            <h2>Work directly with the founder.</h2>
          </div>
          <p>
            Founded by Idrees. Zentrixa stays hands-on, direct, and focused on helping local businesses get more customers without making the process complicated.
          </p>
        </div>
      </section>

      <section className="zentrixa-section zentrixa-cta-band premium">
        <div>
          <span className="zentrixa-eyebrow">Ready To Start</span>
          <h2>Let us handle everything. Just call and get started.</h2>
          <p>You focus on the business. We build the system that helps bring in more customers.</p>
        </div>
        <div className="zentrixa-nav-actions">
          <a href="tel:9055809902" className="zentrixa-button primary">Call Us</a>
          <a href="#contact" className="zentrixa-button secondary">Book With Us</a>
        </div>
      </section>

      <section id="contact" className="zentrixa-section">
        <div className="zentrixa-section-head">
          <span className="zentrixa-eyebrow">Contact</span>
          <h2>Tell us about your business and let us build the system around it.</h2>
        </div>
        <div className="zentrixa-contact-layout">
          <ZentrixaContactForm />
          <aside className="zentrixa-contact-card compact">
            <ZentrixaLogo variant="icon" className="zentrixa-contact-icon" />
            <div className="zentrixa-contact-stack">
              <a href="tel:9055809902">905-580-9902</a>
              <span>Ontario, Canada</span>
            </div>
            <div className="zentrixa-mini-points">
              <span>We respond fast.</span>
              <span>We work directly with you.</span>
              <span>We keep the process simple and focused on results.</span>
            </div>
            <div className="zentrixa-nav-actions stacked">
              <a href="tel:9055809902" className="zentrixa-button ghost">Call Us</a>
              <a href="#contact" className="zentrixa-button subtle">Email Us</a>
              <a href="#contact" className="zentrixa-button subtle">Book With Us</a>
            </div>
          </aside>
        </div>
      </section>

      <footer className="zentrixa-footer">
        <div className="zentrixa-footer-inner">
          <span>© Zentrixa</span>
          <Link href="/login">Login</Link>
        </div>
      </footer>
    </main>
  );
}
