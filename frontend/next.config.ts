import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone build (server + only the
  // node_modules it actually needs) — required for a lean Docker image.
  output: "standalone",
  images: {
    // Vendor product images (backend/src/vendor-products/dto/create-vendor-product.dto.ts)
    // are restricted to this same S3 virtual-hosted-style host shape, so
    // this is the only external image source that can actually reach the
    // app. next/image otherwise rejects any host not listed here.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
  turbopack: {
    // Repo root has its own package-lock.json (from an accidental root
    // `npm install`), which makes Turbopack infer the whole monorepo
    // (including backend/node_modules) as the project root and blows up
    // its filesystem-watch scope. Pin it back to this directory.
    root: path.join(__dirname),
  },
};

export default nextConfig;
