import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" — GitHub Pages'da istalgan pastki papkada ishlashi uchun (nisbiy yo'llar)
export default defineConfig({
  plugins: [react()],
  base: "./",
});
