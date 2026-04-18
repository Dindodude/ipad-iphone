"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/clients", label: "Clients" },
  { href: "/app/campaigns", label: "Campaigns" },
  { href: "/app/pipeline", label: "Pipeline" },
  { href: "/app/scripts", label: "Scripts" },
  { href: "/app/ai", label: "AI Assistant" },
  { href: "/app/forms", label: "Instant Forms" },
  { href: "/app/analytics", label: "Analytics" },
  { href: "/app/settings", label: "Settings" },
  { href: "/app/legacy", label: "Legacy LeadOS" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand brand-block">
        <div className="brand-badge">L</div>
        <div>
          <div className="brand-title">LeadOS</div>
          <div className="brand-subtitle">WhatsApp-first agency command center</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">System</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/app" && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={active ? "active" : ""}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Operating logic</div>
        <div className="text-list compact-list">
          <div className="text-list-item">Client first</div>
          <div className="text-list-item">Campaign second</div>
          <div className="text-list-item">WhatsApp before outreach</div>
          <div className="text-list-item">AI as copilot, not fluff</div>
        </div>
      </div>
    </aside>
  );
}
