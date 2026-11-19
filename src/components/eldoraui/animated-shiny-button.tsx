import type {ButtonHTMLAttributes} from "react";
export function AnimatedShinyButton({children,className="",...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button type="button" {...props} className={"eldora-shiny "+className}><span className="inline-flex items-center gap-2">{children}</span></button>}
