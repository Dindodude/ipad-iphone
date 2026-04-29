import Link from "next/link";
import { ZentrixaLogo } from "@/components/zentrixa-logo";

const portalOptions = [
  {
    href: "/client-builder",
    title: "Client Portal Builder",
    description: "Create client access, update project progress, and manage what clients see."
  },
  {
    href: "/app",
    title: "LeadOS",
    description: "Open the cold-call CRM, lead pipeline, call queue, scripts, and follow-ups."
  }
];

export default function AdminPortalPage() {
  return (
    <main className="admin-portal-shell">
      <section className="admin-portal-panel">
        <Link href="/" className="auth-brand">
          <ZentrixaLogo variant="full" className="auth-logo" priority />
        </Link>
        <div className="auth-copy">
          <span className="auth-eyebrow">Admin Portal</span>
          <h1>Choose your workspace.</h1>
          <p>Manage client portals or jump into LeadOS from the same protected Zentrixa admin account.</p>
        </div>
        <div className="admin-portal-grid">
          {portalOptions.map((option) => (
            <Link key={option.href} href={option.href} className="admin-portal-card">
              <span>{option.title}</span>
              <p>{option.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
