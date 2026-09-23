import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@factory/ui";
import config from "../../../factory.config.json";

export const metadata: Metadata = {
  title: "App Name",
  description: "One sentence saying what this app decides.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* The theme comes from factory.config.json at the repo root, so every app agrees. */}
        <ThemeProvider theme={config.theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
