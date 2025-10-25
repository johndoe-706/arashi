import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "MR.KIM - Premium Game Accounts",
  description:
    "Buy premium Mobile Legend and PUBG accounts with instant delivery",
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
