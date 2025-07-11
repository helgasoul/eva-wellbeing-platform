import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98] rounded-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98] rounded-lg",
        outline:
          "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 shadow-soft hover:shadow-elevated hover:scale-[1.01] active:scale-[0.99] rounded-lg",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98] rounded-lg",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-[1.01] active:scale-[0.99] rounded-lg",
        link: "text-primary underline-offset-4 hover:underline hover:scale-[1.01] active:scale-[0.99]",
        premium: "bg-gradient-to-r from-primary via-secondary to-primary/90 text-primary-foreground shadow-elevated hover:shadow-floating hover:scale-[1.02] active:scale-[0.98] rounded-xl border border-primary/20",
        soft: "bg-soft-purple/20 text-soft-purple-foreground hover:bg-soft-purple/30 hover:scale-[1.01] active:scale-[0.99] rounded-lg border border-soft-purple/30",
        plan: "bg-gradient-to-r text-foreground shadow-soft hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98] rounded-xl border",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs rounded-md",
        lg: "h-14 px-8 py-4 text-base rounded-xl",
        xl: "h-16 px-10 py-5 text-lg rounded-xl",
        icon: "h-11 w-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
