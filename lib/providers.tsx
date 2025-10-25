"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { LanguageProvider } from "./language";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
