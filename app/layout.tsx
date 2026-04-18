import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadOS",
  description: "LeadOS is a premium WhatsApp-first client acquisition command center for agencies."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
