import Image from "next/image";
import Link from "next/link";
import { ZentrixaContactForm } from "@/components/zentrixa-contact-form";

const painPoints = [
  "You’re losing customers because your website doesn’t convert.",
  "People message once, then disappear because nobody follows up properly.",
  "Marketing money gets wasted because the system behind it is weak.",
  "You’re too busy running the business to build and manage all the tech."
];

const solutions = [
  "We build your website for conversions, not just looks.",
  "We set up lead capture so interested people actually become real opportunities.",
  "We handle the follow-up system so leads don’t go cold.",
  "We optimize the whole flow so more clicks turn into calls and customers."
];

const differentiators = [
  "Done-for-you from start to finish",
  "No tech skills needed on your side",
  "Fast setup with direct support",
  "Built around results, not fluff"
];

const testimonials = [
  {
    quote: "They made the whole thing simple. We didn’t have to figure out websites, follow-up, or marketing on our own.",
    author: "Local service business owner"
  },
  {
    quote: "What I liked most was how direct everything felt. No tech overwhelm, just a clear system to bring in customers.",
    author: "Ontario business client"
  }
];

export default function HomePage() {
  return (
    <main className="zentrixa-site">
      <section className="zentrixa-hero-shell">
        <header className="zentrixa-nav">
          <Link href="/" className="zentrixa-brandmark" aria-label="Zentrixa home">
            <Image src="/branding/zentrixa-logo.png" alt="Zentrixa - We Build. You Grow." width={320} height={104} priority />
          </Link>
          <div className="zentrixa-nav-actions">
            <a href="tel:9055809902" className="zentrixa-button ghost">Call Now</a>
            <Link href="/login" className="zentrixa-button subtle">Team Login</Link>
          </div>
        </header>

        <div className="zentrixa-hero">
          <div className="zentrixa-hero-copy">
            <span className="zentrixa-eyebrow">Done-For-You Growth</span>
            <h1>We Don’t Just Build Websites. We Bring You Customers.</h1>
            <p>
              Zentrixa handles everything: your website, lead capture, marketing, follow-up, and conversion flow.
              You stay focused on your business. We handle the system that brings in more customers.
            </p>
            <div className="zentrixa-hero-actions">
              <a href="tel:9055809902" className="zentrixa-button primary">Call Now</a>
              <a href="#contact" className="zentrixa-button secondary">Get More Customers</a>
            </div>
            <div className="zentrixa-hero-trust">
              <span>We respond fast</span>
              <span>We work directly with you</span>
              <span>No tech skills needed</span>
            </div>
          </div>

          <div className="zentrixa-hero-panel">
            <div className="zentrixa-panel-grid">
              <article className="zentrixa-stat-card">
                <strong>Websites</strong>
                <span>Built to convert, not sit there.</span>
              </article>
              <article className="zentrixa-stat-card">
                <strong>Lead Capture</strong>
                <span>Every inquiry has a clear next step.</span>
              </article>
              <article className="zentrixa-stat-card">
                <strong>Follow-Up</strong>
                <span>No more lost leads from slow replies.</span>
              </article>
              <article className="zentrixa-stat-card">
                <strong>Growth</strong>
                <span>We build. You grow.</span>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="zentrixa-section zentrixa-problem">
        <div className="zentrixa-section-head">
          <span className="zentrixa-eyebrow">The Problem</span>
          <h2>Good businesses lose customers every day because the system behind them is weak.</h2>
        </div>
        <div className="zentrixa-card-grid four">
          {painPoints.map((item) => (
            <article key={item} className="zentrixa-surface-card">
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="zentrixa-section">
        <div className="zentrixa-section-head">
          <span className="zentrixa-eyebrow">The Solution</span>
          <h2>We handle the whole system so your business can keep moving.</h2>
        </div>
        <div className="zentrixa-card-grid two">
          {solutions.map((item) => (
            <article key={item} className="zentrixa-surface-card">
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="zentrixa-section">
        <div className="zentrixa-split-card">
          <div>
            <span className="zentrixa-eyebrow">Why Zentrixa</span>
            <h2>You don’t need more software. You need a team that handles it for you.</h2>
            <p>
              Zentrixa is a service, not a tool. We build what needs to be built, set up what needs to be set up,
              and help make sure the leads coming in have a real chance to become paying customers.
            </p>
          </div>
          <div className="zentrixa-checklist">
            {differentiators.map((item) => (
              <div key={item} className="zentrixa-check-row">
                <span className="zentrixa-check-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="zentrixa-section">
        <div className="zentrixa-section-head">
          <span className="zentrixa-eyebrow">How It Works</span>
          <h2>Simple, fast, and built around results.</h2>
        </div>
        <div className="zentrixa-card-grid three">
          <article className="zentrixa-process-card">
            <span className="zentrixa-step">01</span>
            <h3>We build your system</h3>
            <p>Website, lead capture, messaging, and follow-up flow all handled for you.</p>
          </article>
          <article className="zentrixa-process-card">
            <span className="zentrixa-step">02</span>
            <h3>We bring in leads</h3>
            <p>We help create the structure that turns attention into real incoming opportunities.</p>
          </article>
          <article className="zentrixa-process-card">
            <span className="zentrixa-step">03</span>
            <h3>We help you convert them</h3>
            <p>With better follow-up, better messaging, and a cleaner customer journey from start to sale.</p>
          </article>
        </div>
      </section>

      <section className="zentrixa-section">
        <div className="zentrixa-section-head">
          <span className="zentrixa-eyebrow">Trust</span>
          <h2>Real support. Fast responses. Clear communication.</h2>
        </div>
        <div className="zentrixa-card-grid two">
          {testimonials.map((item) => (
            <article key={item.quote} className="zentrixa-surface-card testimonial">
              <p>“{item.quote}”</p>
              <strong>{item.author}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="zentrixa-section zentrixa-cta-band">
        <div>
          <span className="zentrixa-eyebrow">Ready To Start</span>
          <h2>Let us handle everything. You focus on your business.</h2>
          <p>Call now and let’s build the system that brings you more customers.</p>
        </div>
        <a href="tel:9055809902" className="zentrixa-button primary">Call 905-580-9902</a>
      </section>

      <section id="contact" className="zentrixa-section">
        <div className="zentrixa-section-head">
          <span className="zentrixa-eyebrow">Contact</span>
          <h2>Tell us about your business and let’s get you more customers.</h2>
        </div>
        <div className="zentrixa-contact-layout">
          <ZentrixaContactForm />
          <aside className="zentrixa-contact-card">
            <Image src="/branding/zentrixa-icon.png" alt="Zentrixa icon" width={82} height={82} />
            <div className="zentrixa-contact-stack">
              <a href="tel:9055809902">905-580-9902</a>
              <a href="mailto:idreesrah0@gmail.com">idreesrah0@gmail.com</a>
              <span>Ontario, Canada</span>
            </div>
            <div className="zentrixa-mini-points">
              <span>We respond fast.</span>
              <span>We work directly with you.</span>
              <span>We handle the tech so you don’t have to.</span>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
