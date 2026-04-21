"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  website: string;
  instagram: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  website: "",
  instagram: "",
  message: ""
};

export function ZentrixaContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const result = await response.json().catch(() => ({ ok: false, error: "Something went wrong." }));

    if (!response.ok || !result.ok) {
      setError(result.error || "Something went wrong. Please call us directly.");
      setSubmitting(false);
      return;
    }

    setSuccess(result.message || "Thanks, we’ll be in touch shortly.");
    setForm(EMPTY_FORM);
    setSubmitting(false);
  }

  return (
    <form className="zentrixa-form-card" onSubmit={handleSubmit}>
      <div className="zentrixa-form-grid">
        <label className="zentrixa-field">
          <span>Name</span>
          <input required value={form.name} onChange={(event) => setField("name", event.target.value)} />
        </label>
        <label className="zentrixa-field">
          <span>Email</span>
          <input required type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} />
        </label>
      </div>
      <div className="zentrixa-form-grid">
        <label className="zentrixa-field">
          <span>Phone Number</span>
          <input required value={form.phone} onChange={(event) => setField("phone", event.target.value)} />
        </label>
        <label className="zentrixa-field">
          <span>Website</span>
          <input value={form.website} onChange={(event) => setField("website", event.target.value)} />
        </label>
      </div>
      <div className="zentrixa-form-grid">
        <label className="zentrixa-field">
          <span>Instagram</span>
          <input value={form.instagram} onChange={(event) => setField("instagram", event.target.value)} />
        </label>
        <label className="zentrixa-field">
          <span>Message</span>
          <textarea rows={4} value={form.message} onChange={(event) => setField("message", event.target.value)} />
        </label>
      </div>
      {error ? <div className="zentrixa-form-message error">{error}</div> : null}
      {success ? <div className="zentrixa-form-message success">{success}</div> : null}
      <button type="submit" className="zentrixa-button primary" disabled={submitting}>
        {submitting ? "Sending..." : "Get More Customers"}
      </button>
    </form>
  );
}
