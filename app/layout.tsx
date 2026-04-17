import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Expansion Private Mentorship",
  description:
    "3 Months of 1:1 subconscious recalibration for soul-led high-achievers ready to step into their next level.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/fai0vbm.css" />
      </head>
      {/* suppressHydrationWarning: extensions (e.g. Grammarly) inject data-* attrs on <body> before React hydrates */}
      <body
        className="min-h-full flex flex-col bg-[#f4f1ec] text-[#6b4f62]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
