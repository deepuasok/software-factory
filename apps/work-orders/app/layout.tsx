import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Work Order Triage",
  description: "Decides which open facilities work orders get done first this week, and which high-cost jobs get approved.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
