import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contract Renewals",
  description: "Decides which vendor contracts to renew, renegotiate or drop this quarter.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
