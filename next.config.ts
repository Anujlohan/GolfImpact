import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Helper to safely load environment files without resetting existing variables
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

// Load backend secrets & frontend configs into process.env
loadEnvIfExists(path.resolve(__dirname, "frontend/.env.local"));
loadEnvIfExists(path.resolve(__dirname, "frontend/.env"));
loadEnvIfExists(path.resolve(__dirname, "backend/.env.local"));
loadEnvIfExists(path.resolve(__dirname, "backend/.env"));
loadEnvIfExists(path.resolve(__dirname, ".env.local"));
loadEnvIfExists(path.resolve(__dirname, ".env"));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
