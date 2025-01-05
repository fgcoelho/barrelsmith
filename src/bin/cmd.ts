#!/usr/bin/env node

import { join } from "path";
import chokidar from "chokidar";
import { generateAllBarrels, findAllBarrelEntryConfigs } from "../smith.js";
import { debounce } from "../utils.js";

const args = process.argv.slice(2);
const watchMode = args.includes("--watch") || args.includes("-w");

findAllBarrelEntryConfigs()
  .then((configs) => {
    generateAllBarrels(configs);

    if (watchMode) {
      const allRoots = new Set<string>();
      configs.forEach((c) => {
        for (const root of c.roots ?? []) {
          allRoots.add(join(process.cwd(), root));
        }
      });

      const watcher = chokidar.watch([...allRoots], {
        ignored: ["node_modules", "dist", ".git", ".next"],
      });

      const debouncedBuild = debounce(async () => {
        const freshConfigs = await findAllBarrelEntryConfigs();
        generateAllBarrels(freshConfigs);
      }, 300);

      watcher.on("change", (filename) => {
        console.log(`File ${filename} changed, rebuilding...`);
        debouncedBuild();
      });
    } else {
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error("Error while generating barrels:", err);
    process.exit(1);
  });
