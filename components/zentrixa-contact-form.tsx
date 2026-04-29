"use client";

import { useState } from "react";

type FormState = {
  name: string;
  phone: string;
  business: string;
  monthlyAdBudget: string;
  timeline: string;
  currentWebsite: string;
  help: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  business: "",
  monthlyAdBudget: "",
  timeline: "",
  currentWebsite: "",
  help: ""
};

const AD_BUDGET_OPTIONS = ["$50-$100", "$100-$200", "$200-$400", "$400-$500+"];
const TIMELINE_OPTIONS = ["ASAP", "This month", "Next 1-2 months", "Just exploring"];
const WEBSITE_OPTIONS = ["Yes", "No", "Needs improvement"];

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const result = await response.json().catch(() => ({ ok: false, error: "Something went wrong." }));

    if (!response.ok || !result.ok) {
      setError(result.error || "Something went wrong. Please call us directly.");
      setSubmitting(false);
      return;
    }

    setSuccess(result.message || "We'll reach out shortly.");
    setForm(EMPTY_FORM);
    setSubmitting(false);
  }

  return (
    <form className="zentrixa-form-card compact zx-lead-form" onSubmit={handleSubmit}>
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
          <span>Monthly ad budget</span>
          <select required value={form.monthlyAdBudget} onChange={(event) => setField("monthlyAdBudget", event.target.value)}>
            <option value="">Select range</option>
            {AD_BUDGET_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <div className="zentrixa-form-grid compact">
        <label className="zentrixa-field">
          <span>When do you want to start?</span>
          <select required value={form.timeline} onChange={(event) => setField("timeline", event.target.value)}>
            <option value="">Select timeline</option>
            {TIMELINE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="zentrixa-field">
          <span>Do you have a website?</span>
          <select required value={form.currentWebsite} onChange={(event) => setField("currentWebsite", event.target.value)}>
            <option value="">Select one</option>
            {WEBSITE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <label className="zentrixa-field">
        <span>What do you need help with?</span>
        <textarea rows={3} value={form.help} onChange={(event) => setField("help", event.target.value)} />
      </label>
      {error ? <div className="zentrixa-form-message error">{error}</div> : null}
      {success ? <div className="zentrixa-form-message success">{success}</div> : null}
      <button type="submit" className="zentrixa-button primary" disabled={submitting}>
        {submitting ? "Sending..." : "Get More Customers"}
      </button>
    </form>
  );
}
