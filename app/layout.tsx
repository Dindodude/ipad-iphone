import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Zentrixa",
    template: "%s | Zentrixa"
  },
  description: "Zentrixa is a done-for-you growth partner that builds websites, captures leads, and helps businesses convert more customers.",
  icons: {
    icon: "/branding/zentrixa-icon.png",
    shortcut: "/branding/zentrixa-icon.png",
    apple: "/branding/zentrixa-icon.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
