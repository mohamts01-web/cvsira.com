import type {ButtonHTMLAttributes} from "react";
import {AnimatedShinyButton} from "../components/eldoraui/animated-shiny-button";
export function Button({variant,size,className="",...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:string;size?:string}) {
 if(variant!=="ghost")return <AnimatedShinyButton {...props} className={(size==="lg"?"anchor-button-lg ":"")+className}/>;
 return <button type="button" {...props} className={"anchor-button anchor-ghost "+(size==="lg"?"anchor-button-lg ":"")+className}/>;
}
