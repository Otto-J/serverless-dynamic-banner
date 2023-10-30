//https://nitro.unjs.io/config
export default defineNitroConfig({
  output: {
    dir: "dist",
    serverDir: "dist/server",
    publicDir: "dist/server",
  },
  preset: "node-server",
});
