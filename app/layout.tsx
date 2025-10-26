import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Arashi - Mobile Legend Accounts Shop",
  description: "Buy or Rank Boost with Arashi's Shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans max-w-7xl mx-auto">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
