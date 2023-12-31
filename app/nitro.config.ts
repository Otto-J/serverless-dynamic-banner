const YEAR = 31536000

//https://nitro.unjs.io/config
export default defineNitroConfig({
  output: {
    dir: "dist",
    // serverDir: "dist/server",
    // publicDir: "dist/server",
  },
  preset: "node-server",
  serverAssets: [
    {
      baseName: "myAssets",
      dir: "./myAssets",
    },
  ],
  compressPublicAssets: true,
  routeRules: {
    '/': {
      swr: YEAR
    }
  }
});
