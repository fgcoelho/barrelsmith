#!/usr/bin/env node

import { generateBarrels, findAllBarrelEntryConfigs } from "../core/smith.js";

findAllBarrelEntryConfigs()
  .then((configs) => {
    generateBarrels(configs);

    process.exit(0);
  })
  .catch((err) => {
    console.error("Error while generating barrels:", err);
    process.exit(1);
  });
