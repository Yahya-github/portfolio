import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [
    // Test-only: turn static image imports into StaticImageData-shaped objects
    // so components that import assets render under jsdom.
    {
      name: "static-image",
      enforce: "pre",
      load(id) {
        if (/\.(webp|png|jpe?g)$/.test(id)) {
          const name = id.split("/").pop();
          return `export default { src: "/_test/${name}", width: 1000, height: 800 };`;
        }
        return null;
      },
    },
    react(),
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
  },
});
