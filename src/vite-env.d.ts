/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEAM_NAME?: string;
  readonly VITE_TEAM_YEAR?: string;
  readonly VITE_TEAM_ID?: string;
  readonly VITE_BASE_PATH?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
