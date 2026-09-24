import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// Helper to safely load environment files into test runtime
function loadEnvIfExists(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  if (typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(filePath);
      return;
    } catch {}
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env)) {
          process.env[key] = val;
        }
      }
    }
  } catch {}
}

loadEnvIfExists(path.resolve(__dirname, "frontend/.env.local"));
loadEnvIfExists(path.resolve(__dirname, "frontend/.env"));
loadEnvIfExists(path.resolve(__dirname, "backend/.env.local"));
loadEnvIfExists(path.resolve(__dirname, "backend/.env"));
loadEnvIfExists(path.resolve(__dirname, ".env.local"));
loadEnvIfExists(path.resolve(__dirname, ".env"));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["backend/tests/**/*.test.ts", "backend/tests/**/*.test.tsx"],
    alias: {
      "@frontend": path.resolve(__dirname, "./frontend"),
      "@backend": path.resolve(__dirname, "./backend"),
      "@/components": path.resolve(__dirname, "./frontend/components"),
      "@/actions": path.resolve(__dirname, "./backend/actions"),
      "@/types": path.resolve(__dirname, "./backend/types"),
      "@/lib/auth": path.resolve(__dirname, "./backend/auth"),
      "@/lib/services": path.resolve(__dirname, "./backend/services"),
      "@/lib/draw-engine": path.resolve(__dirname, "./backend/draw-engine"),
      "@/lib/stripe": path.resolve(__dirname, "./backend/stripe"),
      "@/lib/supabase": path.resolve(__dirname, "./backend/supabase"),
      "@/lib/validations": path.resolve(__dirname, "./backend/validations"),
      "@/lib/utils/errors": path.resolve(__dirname, "./backend/utils/errors"),
      "@/lib/utils": path.resolve(__dirname, "./frontend/lib/utils"),
      "@/lib/constants": path.resolve(__dirname, "./backend/constants"),
      "@": path.resolve(__dirname, "./"),
    },
  },
});
