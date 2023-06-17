/// <reference types="graz/env" />

declare module "vite-plugin-node-stdlib-browser" {
  const plugin: import("vite").Plugin;
  export default () => plugin;
}
