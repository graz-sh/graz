import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import nodeStdlibBrowser from "vite-plugin-node-stdlib-browser";

export default defineConfig({
  plugins: [nodeStdlibBrowser(), react()],
});
