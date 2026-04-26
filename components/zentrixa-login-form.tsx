"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ZentrixaLogo } from "@/components/zentrixa-logo";

export function ZentrixaLoginForm({
  next = "/app",
  title = "Secure access to the internal LeadOS dashboard.",
  description = "Login is separate from the public Zentrixa site and only unlocks the protected internal workspace."
}: {
  next?: string;
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json().catch(() => ({ ok: false, error: "Login failed." }));

    if (!response.ok || !result.ok) {
      setError(result.error || "Login failed.");
      setSubmitting(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="auth-shell">
      <div className="auth-panel">
        <Link href="/" className="auth-brand">
          <ZentrixaLogo variant="full" className="auth-logo" priority />
        </Link>
        <div className="auth-copy">
          <span className="auth-eyebrow">Private Access</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <div className="auth-message error">{error}</div> : null}
          <button type="submit" className="zentrixa-button primary auth-submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="auth-footer">
          <a href="tel:9055809902">Call Us</a>
          <Link href="/#contact">Email Us</Link>
          <Link href="/#contact">Book With Us</Link>
        </div>
      </div>
    </main>
  );
}
