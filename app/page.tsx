import Link from "next/link";
import { ZentrixaContactForm } from "@/components/zentrixa-contact-form";
import { ZentrixaLogo } from "@/components/zentrixa-logo";

const problems = [
  "Bad websites waste attention.",
  "Weak follow-up loses warm leads.",
  "Marketing spend gets burned with no system behind it.",
  "Most owners do not have time to manage the tech."
];

const solutions = [
  { title: "Website", text: "Built to convert, not just look good." },
  { title: "Capture", text: "Turn visitors into leads." },
  { title: "Follow-Up", text: "Never miss a customer." },
  { title: "Growth", text: "Scale what works." }
];

const whyZentrixa = [
  "Done-for-you setup",
  "Built to convert",
  "Fast turnaround",
  "No tech skills needed",
  "Direct communication",
  "Results-focused"
];

const pricing = [
  {
    title: "Website Setup",
    price: "Starting at $299",
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
    featured: true,
    points: [
      "Content creation",
      "Ongoing updates",
      "Performance-focused improvements"
    ]
  },
  {
    title: "Content + Ads Management",
    price: "From $150/month",
    points: [
      "Content creation",
      "Ad campaign setup & management",
      "Optimization for better results"
    ]
  }
];

const process = [
  {
    step: "01",
    title: "Setup & strategy",
    time: "1-2 days",
    text: "We map the offer, customer path, and the exact system your business needs."
  },
  {
    step: "02",
    title: "Build & launch",
    time: "5-7 days",
    text: "We build the site, lead capture, and follow-up flow so everything is ready to go live."
  },
  {
    step: "03",
    title: "Capture & grow",
    time: "Ongoing",
    text: "We keep improving the system so more clicks, calls, and leads become real customers."
  }
];

export default function HomePage() {
  return (
    <main className="zentrixa-site">
      <section className="zentrixa-hero-shell zentrixa-public-wrap">
        <header className="zentrixa-nav">
          <Link href="/" className="zentrixa-brandmark" aria-label="Zentrixa home">
            <ZentrixaLogo variant="full" className="zentrixa-brand-image" priority />
          </Link>
          <div className="zentrixa-nav-actions zentrixa-nav-cta">
            <a href="tel:9055809902" className="zentrixa-button ghost zentrixa-nav-primary">Call Now</a>
            <a href="#contact" className="zentrixa-button subtle zentrixa-nav-secondary">Get Started</a>
          </div>
        </header>

        <section className="zentrixa-hero zentrixa-hero-grid">
          <div className="zentrixa-hero-copy zentrixa-hero-card">
            <span className="zentrixa-eyebrow">Done-For-You Growth</span>
            <h1>
              <span>We Build the Sales System</span>
              <span>That Helps Local Businesses</span>
              <span>Get More Customers.</span>
            </h1>
            <p>
              Zentrixa handles the website, lead capture, and follow-up structure for you.
              You stay focused on your business. We handle the system behind the growth.
            </p>
            <div className="zentrixa-hero-actions">
              <a href="tel:9055809902" className="zentrixa-button primary">Call Now</a>
              <a href="#contact" className="zentrixa-button secondary">Get More Customers</a>
            </div>
            <div className="zentrixa-hero-trust compact">
              <span>We handle everything</span>
              <span>Built for real results</span>
              <span>Fast setup</span>
            </div>
          </div>

          <div className="zentrixa-system-card">
            <div className="zentrixa-system-head">
              <span className="zentrixa-eyebrow">System Snapshot</span>
              <strong>Website to customer flow</strong>
            </div>
            <div className="zentrixa-flow-stack">
              {solutions.map((item, index) => (
                <div key={item.title} className="zentrixa-flow-item">
                  <div className="zentrixa-flow-badge">{`0${index + 1}`}</div>
                  <div className="zentrixa-flow-copy">
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                  {index < solutions.length - 1 ? <div className="zentrixa-flow-line" aria-hidden="true" /> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      <section className="zentrixa-section zentrixa-public-wrap zentrixa-section-problem">
        <div className="zentrixa-section-head compact">
          <span className="zentrixa-eyebrow">The Problem</span>
          <h2>Too many businesses lose customers because the system behind them is weak.</h2>
        </div>
        <div className="zentrixa-card-grid four compact zentrixa-tight-grid">
          {problems.map((item) => (
            <article key={item} className="zentrixa-surface-card zentrixa-problem-card">
              <span className="zentrixa-problem-dot" />
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="zentrixa-section zentrixa-public-wrap zentrixa-section-why">
        <div className="zentrixa-section-head compact">
          <span className="zentrixa-eyebrow">Why Zentrixa</span>
          <h2>Done-for-you support built for speed, clarity, and conversion.</h2>
        </div>
        <div className="zentrixa-card-grid three compact zentrixa-tight-grid">
          {whyZentrixa.map((item, index) => (
            <article key={item} className="zentrixa-surface-card why-card zentrixa-icon-card">
              <div className="zentrixa-icon-chip">{index + 1}</div>
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="zentrixa-section zentrixa-public-wrap">
        <div className="zentrixa-mid-cta">
          <div>
            <span className="zentrixa-eyebrow">Decision Moment</span>
            <h2>Ready to get more customers?</h2>
            <p>We can build the website, lead capture, and follow-up system so you can stop guessing and start converting more of the attention you already get.</p>
          </div>
          <div className="zentrixa-nav-actions">
            <a href="tel:9055809902" className="zentrixa-button primary">Call Us</a>
            <a href="#contact" className="zentrixa-button subtle">Book With Us</a>
          </div>
        </div>
      </section>

      <section className="zentrixa-section zentrixa-public-wrap zentrixa-section-process">
        <div className="zentrixa-section-head compact">
          <span className="zentrixa-eyebrow">How It Works</span>
          <h2>Clear steps. Fast delivery. Ongoing growth.</h2>
        </div>
        <div className="zentrixa-card-grid three compact zentrixa-tight-grid">
          {process.map((item) => (
            <article key={item.step} className="zentrixa-process-card zentrixa-process-tight">
              <div className="zentrixa-process-top">
                <span className="zentrixa-step">{item.step}</span>
                <span className="zentrixa-process-time">{item.time}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="zentrixa-section zentrixa-public-wrap zentrixa-section-pricing">
        <div className="zentrixa-section-head compact">
          <span className="zentrixa-eyebrow">Pricing</span>
          <h2>Simple pricing. Built for results.</h2>
        </div>
        <div className="zentrixa-card-grid three compact pricing-grid zentrixa-tight-grid">
          {pricing.map((item) => (
            <article key={item.title} className={`zentrixa-pricing-card${item.featured ? " highlighted" : ""}`}>
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
        <div className="zentrixa-guarantee-line">We do not launch until you are satisfied, and we work with you until everything is set up properly.</div>
      </section>

      <section className="zentrixa-section zentrixa-public-wrap">
        <div className="zentrixa-founder-card zentrixa-founder-tight">
          <div className="zentrixa-founder-intro">
            <div className="zentrixa-founder-badge">ID</div>
            <div>
              <span className="zentrixa-eyebrow">Founded by Idrees</span>
              <h2>Work directly with the founder.</h2>
            </div>
          </div>
          <p>
            You work directly with the person building your system. Zentrixa stays hands-on, direct, and focused on helping local businesses get more customers without making the process complicated.
          </p>
        </div>
      </section>

      <section className="zentrixa-section zentrixa-public-wrap">
        <div className="zentrixa-cta-band premium zentrixa-cta-tight">
          <div>
            <span className="zentrixa-eyebrow">Ready To Start</span>
            <h2>Let us handle everything. Just call and get started.</h2>
            <p>You focus on the business. We build the system that helps bring in more customers.</p>
          </div>
          <div className="zentrixa-nav-actions">
            <a href="tel:9055809902" className="zentrixa-button primary">Call Us</a>
            <a href="#contact" className="zentrixa-button secondary">Book With Us</a>
          </div>
        </div>
      </section>

      <section id="contact" className="zentrixa-section zentrixa-public-wrap">
        <div className="zentrixa-section-head compact">
          <span className="zentrixa-eyebrow">Contact</span>
          <h2>Tell us about your business and let us build the system around it.</h2>
        </div>
        <div className="zentrixa-contact-layout zentrixa-contact-tight">
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
          <span>&copy; Zentrixa</span>
          <Link href="/login">Login</Link>
        </div>
      </footer>
    </main>
  );
}
