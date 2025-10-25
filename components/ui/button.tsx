import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default button (gradient)
        default:
          "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-md hover:shadow-purple-500/30",

        // Destructive (red)
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-red-500/30",

        // Outline style
        outline:
          "border border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",

        // Secondary (soft gray)
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",

        // Ghost (transparent)
        ghost:
          "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",

        // Link (text-only)
        link: "text-blue-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-md",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-lg text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
