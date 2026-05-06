import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // 开发时直接解析各包的 TypeScript 源码，无需提前 build
    alias: {
      "a2ui-core": path.resolve(__dirname, "../../packages/a2ui-core/src/index.ts"),
      "a2ui-react": path.resolve(__dirname, "../../packages/a2ui-react/src/index.ts"),
    },
  },
});
