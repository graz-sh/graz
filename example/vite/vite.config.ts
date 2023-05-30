import { defineConfig } from "vite";

import { NgmiPolyfill } from "vite-plugin-ngmi-polyfill";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [NgmiPolyfill(), react()],
});
