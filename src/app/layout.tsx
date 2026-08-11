import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AceSAT",
  description:
    "Personalized SAT practice that finds weak spots, builds a study plan, and coaches you toward a better score.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-ink-50 text-ink-950">{children}</body>
    </html>
  );
}
