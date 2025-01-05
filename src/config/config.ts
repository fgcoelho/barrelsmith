import { dirname } from "path";
import { fileURLToPath } from "url";

export interface BarrelForgeOptions {
  roots?: string[];
  output?: string;
  exports?: string[];
  ignore?: string[];
  append?: string[];
}

export function BarrelForge(
  userOptions: BarrelForgeOptions = {}
): Required<BarrelForgeOptions> {
  const defaultDir =
    typeof __filename !== "undefined"
      ? dirname(__filename)
      : dirname(fileURLToPath(import.meta.url));

  return {
    roots:
      userOptions.roots && userOptions.roots.length
        ? userOptions.roots
        : [defaultDir],

    output: userOptions.output ?? "index.ts",

    exports: userOptions.exports ?? [],

    ignore: userOptions.ignore ?? ["node_modules", "dist", ".git", ".next"],

    append: userOptions.append ?? [],
  };
}
