import Link from "next/link";
import { ZentrixaContactForm } from "@/components/zentrixa-contact-form";
import { ZentrixaScrollAnimator } from "@/components/zentrixa-scroll-animator";

const flow = [
  { icon: "W", title: "Website", text: "A clean page built to make people act." },
  { icon: "C", title: "Capture", text: "Simple forms and calls that turn interest into leads." },
  { icon: "F", title: "Follow-Up", text: "Fast next steps so warm leads do not go cold." },
  { icon: "G", title: "Growth", text: "Keep improving what brings real customers." }
];

const problems = [
  "No clear call to action",
  "No lead capture system",
  "No follow-up",
  "Visitors leave and never come back"
];

const solutions = [
  "High-converting website",
  "Simple lead capture",
  "Fast follow-up system",
  "Built for real results"
];

const why = [
  "We bring you customers",
  "We handle everything",
  "We don't miss leads"
];

const pricing = [
  { title: "Website Setup", price: "$299", text: "A focused, mobile-ready website that turns attention into action." },
  { title: "Website + Content", price: "$79/month", text: "Ongoing content and updates to keep your business visible." },
  { title: "Full Growth", price: "$150/month", text: "Content plus ads support for businesses ready to push growth." }
];

export default function HomePage() {
  return (
    <main className="zentrixa-site zentrixa-conversion-site">
      <ZentrixaScrollAnimator />

      <header className="zx-nav zentrixa-public-wrap">
        <Link href="/" className="zx-wordmark">Zentrixa</Link>
        <nav>
          <a href="#home">Home</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section id="home" className="zx-hero zentrixa-public-wrap">
        <div className="zx-glow" aria-hidden="true" />
        <div className="zx-hero-copy">
          <span className="zentrixa-eyebrow">Local business growth</span>
          <h1>We Build Systems That Get You Customers</h1>
          <p>We handle your website, lead capture, and follow-up so you never miss customers.</p>
          <div className="zx-actions">
            <a href="#contact" className="zentrixa-button primary">Get More Customers</a>
            <a href="tel:9055809902" className="zentrixa-button secondary">Call Now</a>
          </div>
        </div>
        <div className="zx-hero-card">
          <span>Website</span>
          <b>Capture</b>
          <strong>Follow-Up</strong>
          <em>Growth</em>
        </div>
      </section>

      <section className="zx-flow zentrixa-public-wrap">
        {flow.map((item, index) => (
          <article key={item.title} className="zx-flow-step" style={{ animationDelay: `${index * 90}ms` }}>
            <div className="zx-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="zx-section zentrixa-public-wrap zx-split">
        <div>
          <span className="zentrixa-eyebrow">The Problem</span>
          <h2>You're losing customers without realizing it</h2>
        </div>
        <div className="zx-list">
          {problems.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className="zx-section zentrixa-public-wrap zx-solution">
        <div>
          <span className="zentrixa-eyebrow">The Solution</span>
          <h2>We fix everything for you</h2>
        </div>
        <div className="zx-card-grid">
          {solutions.map((item) => <article key={item}>{item}</article>)}
        </div>
      </section>

      <section className="zx-section zentrixa-public-wrap">
        <div className="zx-section-head">
          <span className="zentrixa-eyebrow">Why Zentrixa</span>
          <h2>Simple, direct, and built around results.</h2>
        </div>
        <div className="zx-card-grid three">
          {why.map((item) => <article key={item}>{item}</article>)}
        </div>
      </section>

      <section id="pricing" className="zx-section zentrixa-public-wrap">
        <div className="zx-section-head">
          <span className="zentrixa-eyebrow">Pricing</span>
          <h2>Clear plans. No complicated pitch.</h2>
        </div>
        <div className="zx-pricing-grid">
          {pricing.map((plan, index) => (
            <article key={plan.title} className={index === 1 ? "featured" : ""}>
              <h3>{plan.title}</h3>
              <strong>{plan.price}</strong>
              <p>{plan.text}</p>
            </article>
          ))}
        </div>
        <p className="zx-limited">Limited spots available</p>
      </section>

      <section className="zx-mid-cta zentrixa-public-wrap">
        <h2>Ready to get more customers?</h2>
        <a href="#contact" className="zentrixa-button primary">Get More Customers</a>
      </section>

      <section id="contact" className="zx-section zentrixa-public-wrap zx-contact">
        <div>
          <span className="zentrixa-eyebrow">Contact</span>
          <h2>Tell us where to reach you.</h2>
          <p>Drop the basics. We'll reach out shortly and show you the next step.</p>
          <a className="zx-call-card" href="tel:9055809902">Call Now: 905-580-9902</a>
        </div>
        <ZentrixaContactForm />
      </section>

      <a className="zx-sticky-call" href="tel:9055809902">Call Now</a>

      <footer className="zentrixa-footer">
        <div className="zentrixa-footer-inner">
          <span>&copy; Zentrixa</span>
          <div className="zentrixa-footer-links">
            <Link href="/client-login">Client Portal</Link>
            <Link href="/login">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
