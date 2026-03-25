import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocCraft — Transform READMEs into Beautiful Documentation",
  description:
    "Paste Markdown or import from GitHub and instantly generate professional, beautifully formatted documentation.",
  keywords: ["documentation", "markdown", "readme", "pdf", "generator"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-dvh font-body antialiased text-ink-950">
        {children}
      </body>
    </html>
  );
}
