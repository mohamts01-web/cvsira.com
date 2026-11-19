import type { ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const fancyButtonVariants = cva("eldora-shiny elmam-fancy-button inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-bold disabled:opacity-60", {
  variants: { size: { default: "min-h-12 px-6 py-3", xs: "min-h-11 px-4 py-2 text-xs", sm: "min-h-11 px-4 py-2", lg: "min-h-12 px-8 py-3", icon: "size-11 p-2", icon_xs: "size-11 p-2", icon_sm: "size-11 p-2", icon_lg: "size-12 p-2" } },
  defaultVariants: { size: "default" },
});
type FancyButtonProps = BaseButton.Props & VariantProps<typeof fancyButtonVariants> & { leftSection?: ReactNode; rightSection?: ReactNode };
export function FancyButton({ children, size, leftSection, rightSection, className, ...props }: FancyButtonProps) {
  return <BaseButton data-slot="fancy-button" data-size={size} className={cn(fancyButtonVariants({ size }), className)} {...props}>{leftSection}<span>{children}</span>{rightSection}</BaseButton>;
}
export default FancyButton;
