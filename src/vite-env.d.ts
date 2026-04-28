/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_DISCORD_LINK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
