/** @type {import('next').NextConfig} */
module.exports = {
  // The parts bin ships as TypeScript source, so Next compiles it with the app.
  transpilePackages: ["@factory/ui"],
};
