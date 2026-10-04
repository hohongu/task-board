import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pagesのリポジトリ名に合わせたベースパス
  base: "/task-board/",
  plugins: [react()],
});
