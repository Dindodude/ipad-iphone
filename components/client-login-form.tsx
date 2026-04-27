"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ZentrixaLogo } from "@/components/zentrixa-logo";

export function ClientLoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/client-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });
    const result = await response.json().catch(() => ({ ok: false, error: "Login failed." }));

    if (!response.ok || !result.ok) {
      setError(result.error || "Login failed.");
      setSubmitting(false);
      return;
    }

    router.push(`/client-portal/${result.portalId}`);
    router.refresh();
  }

  return (
    <main className="auth-shell">
      <div className="auth-panel">
        <Link href="/" className="auth-brand">
          <ZentrixaLogo variant="full" className="auth-logo" priority />
        </Link>
        <div className="auth-copy">
          <span className="auth-eyebrow">Client Portal</span>
          <h1>View your Zentrixa project progress.</h1>
          <p>Log in with the portal details Zentrixa sent you.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email or username</span>
            <input value={login} onChange={(event) => setLogin(event.target.value)} required />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <div className="auth-message error">{error}</div> : null}
          <button type="submit" className="zentrixa-button primary auth-submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Open portal"}
          </button>
        </form>
      </div>
    </main>
  );
}
