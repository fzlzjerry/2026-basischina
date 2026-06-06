import { ViteReactSSG } from "vite-react-ssg";
import { wikiEnv } from "@/config/env";
import { routes } from "./router";

/**
 * Application entry (§11/§12). vite-react-ssg builds the router from `routes`,
 * prerenders each static route to HTML at build time, and hydrates on the
 * client. `basename` equals the Vite base (wikiEnv.basePath) so deep links and
 * canonical URLs resolve under the deployment prefix.
 */
export const createRoot = ViteReactSSG({
  routes,
  basename: wikiEnv.basePath,
});
