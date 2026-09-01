import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone build (server + only the
  // node_modules it actually needs) — required for a lean Docker image.
  output: "standalone",
  turbopack: {
    // Repo root has its own package-lock.json (from an accidental root
    // `npm install`), which makes Turbopack infer the whole monorepo
    // (including backend/node_modules) as the project root and blows up
    // its filesystem-watch scope. Pin it back to this directory.
    root: path.join(__dirname),
  },
};

export default nextConfig;
