import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;

/**
 * Register GSAP plugins exactly once, on the client only. Call at the top of any
 * `useGSAP` callback (which runs inside a layout effect, so never during the
 * vite-react-ssg prerender). Importing this module is SSR-safe — registration
 * is what touches the DOM, so it must stay inside client lifecycle.
 */
export function registerGsap(): void {
  if (registered || typeof window === "undefined") return;
  registered = true;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export { gsap, ScrollTrigger, useGSAP };
