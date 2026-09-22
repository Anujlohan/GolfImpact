import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

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
