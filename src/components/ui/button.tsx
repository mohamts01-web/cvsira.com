import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold disabled:pointer-events-none disabled:opacity-60", {
  variants: { variant: { default: "bg-primary text-primary-foreground", destructive: "bg-destructive text-white", outline: "border border-border bg-background text-foreground", secondary: "bg-secondary text-secondary-foreground", ghost: "text-foreground hover:bg-secondary", link: "text-primary underline-offset-4 hover:underline" }, size: { default: "min-h-12", sm: "min-h-11 px-4", lg: "min-h-12 px-8", icon: "size-11 p-2" } },
  defaultVariants: { variant: "default", size: "default" },
});
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";
