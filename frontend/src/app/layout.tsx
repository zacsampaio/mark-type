import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarkType — Transform READMEs into Beautiful Documentation",
  description:
    "Paste Markdown or import from GitHub and instantly generate professional, beautifully formatted documentation.",
  keywords: ["documentation", "markdown", "readme", "pdf", "generator"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
