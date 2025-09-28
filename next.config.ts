import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? "/next-todo" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/next-todo/" : "",
};

export default nextConfig;
