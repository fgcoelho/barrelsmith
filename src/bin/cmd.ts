#!/usr/bin/env node

import { generateBarrels } from "../core/smith";

generateBarrels()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error while generating barrels:", err);
    process.exit(1);
  });
