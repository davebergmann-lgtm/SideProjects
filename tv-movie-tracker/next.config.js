/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static.tvmaze.com" },
      { protocol: "https", hostname: "image.tmdb.org" },
    ],
  },
};

module.exports = nextConfig;
