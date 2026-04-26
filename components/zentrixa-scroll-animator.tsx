"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = [
  ".zentrixa-hero-card",
  ".zentrixa-system-card",
  ".zentrixa-section-head",
  ".zentrixa-surface-card",
  ".zentrixa-process-card",
  ".zentrixa-pricing-card",
  ".zentrixa-mid-cta",
  ".zentrixa-founder-card",
  ".zentrixa-cta-band",
  ".zentrixa-form-card",
  ".zentrixa-contact-card"
].join(", ");

export function ZentrixaScrollAnimator() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));

    targets.forEach((target, index) => {
      target.classList.add("zentrixa-reveal");
      target.style.setProperty("--reveal-index", String(index % 4));
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.16
      }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return null;
}
