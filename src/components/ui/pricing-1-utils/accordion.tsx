import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from "react";
import * as Primitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Accordion = Primitive.Root;
export const AccordionItem = forwardRef<ComponentRef<typeof Primitive.Item>, ComponentPropsWithoutRef<typeof Primitive.Item>>(({ className, ...props }, ref) => <Primitive.Item ref={ref} className={cn("border-b border-border", className)} {...props} />);
AccordionItem.displayName = "AccordionItem";
export const AccordionTrigger = forwardRef<ComponentRef<typeof Primitive.Trigger>, ComponentPropsWithoutRef<typeof Primitive.Trigger>>(({ className, children, ...props }, ref) => (
  <Primitive.Header className="flex"><Primitive.Trigger ref={ref} className={cn("group flex min-h-12 flex-1 items-center justify-between gap-4 py-4 text-start font-bold [&[data-state=open]>svg]:rotate-180", className)} {...props}>{children}<ChevronDown className="size-4 shrink-0 transition-transform" aria-hidden="true" /></Primitive.Trigger></Primitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";
export const AccordionContent = forwardRef<ComponentRef<typeof Primitive.Content>, ComponentPropsWithoutRef<typeof Primitive.Content>>(({ className, children, ...props }, ref) => (
  <Primitive.Content ref={ref} className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}><div className={cn("pb-5 leading-relaxed", className)}>{children}</div></Primitive.Content>
));
AccordionContent.displayName = "AccordionContent";
