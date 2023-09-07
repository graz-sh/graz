declare module "vite-plugin-node-stdlib-browser" {
  const plugin: import("vite").Plugin;
  export default () => plugin;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPORT_DOCS?: string;
  }
}
