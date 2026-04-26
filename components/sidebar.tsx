"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/leads", label: "Leads" },
  { href: "/app/call-queue", label: "Call Queue" },
  { href: "/app/pipeline", label: "Pipeline" },
  { href: "/app/scripts", label: "Scripts" },
  { href: "/app/follow-ups", label: "Follow-Ups" },
  { href: "/app/analytics", label: "Analytics" },
  { href: "/app/settings", label: "Settings" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand brand-block">
        <div className="brand-badge">L</div>
        <div>
          <div className="brand-title">LeadOS</div>
          <div className="brand-subtitle">Cold-call command center</div>
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
          <div className="text-list-item">Call priority first</div>
          <div className="text-list-item">Website gaps matter</div>
          <div className="text-list-item">Log every outcome</div>
          <div className="text-list-item">Follow up on time</div>
        </div>
      </div>
    </aside>
  );
}
