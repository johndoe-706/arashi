"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function BackButton({
  variant = "outline",
  size = "default",
  className = "",
  children = "Back",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={`gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Button>
  );
}
