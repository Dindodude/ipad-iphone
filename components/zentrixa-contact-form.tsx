"use client";

import { useState } from "react";

type FormState = {
  name: string;
  phone: string;
  business: string;
  help: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  business: "",
  help: ""
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

    setSuccess(result.message || "Thanks, we'll be in touch shortly.");
    setForm(EMPTY_FORM);
    setSubmitting(false);
  }

  return (
    <form className="zentrixa-form-card compact" onSubmit={handleSubmit}>
      <div className="zentrixa-form-grid compact">
        <label className="zentrixa-field">
          <span>Name</span>
          <input required value={form.name} onChange={(event) => setField("name", event.target.value)} />
        </label>
        <label className="zentrixa-field">
          <span>Phone</span>
          <input required value={form.phone} onChange={(event) => setField("phone", event.target.value)} />
        </label>
      </div>
      <div className="zentrixa-form-grid compact">
        <label className="zentrixa-field">
          <span>What's your business?</span>
          <input required value={form.business} onChange={(event) => setField("business", event.target.value)} />
        </label>
        <label className="zentrixa-field">
          <span>What do you need help with?</span>
          <textarea rows={4} value={form.help} onChange={(event) => setField("help", event.target.value)} />
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
