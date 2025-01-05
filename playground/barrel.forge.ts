import { BarrelForge } from "../dist/config/config.js";

export default BarrelForge({
  roots: ["./playground/src"],
  append: ["./playground/src/additional_code.js"],
  exports: ["interface", "function"],
  output: "./playground/dist.ts",
});
