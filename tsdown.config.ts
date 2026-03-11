import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/bin/cmd.ts"],
  format: ["cjs"],
  dts: true,
  shims: true,
  clean: true,
  platform: "node",
  tsconfig: "tsconfig.build.json",
});
