/// <reference types="vite/client" />

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_BACKEND_PATH: string;
  readonly VITE_FRONTEND_PATH: string;
  /** Legacy alias — prefer VITE_BACKEND_PATH */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
