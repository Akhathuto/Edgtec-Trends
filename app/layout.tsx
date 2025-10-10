
import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "utrend - AI Content Suite for Creators",
  description: "An AI-powered assistant from utrend to help content creators discover the latest trends on YouTube and TikTok, generate viral video ideas, and develop effective monetization strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* FIX: Self-close link tags for valid JSX */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* FIX: Set crossOrigin prop to "anonymous". This is equivalent to an empty string but is more explicit and can prevent tooling errors. */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}