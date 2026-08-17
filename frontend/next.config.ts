import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Repo root has its own package-lock.json (from an accidental root
    // `npm install`), which makes Turbopack infer the whole monorepo
    // (including backend/node_modules) as the project root and blows up
    // its filesystem-watch scope. Pin it back to this directory.
    root: path.join(__dirname),
  },
};

export default nextConfig;
