#!/usr/bin/env node

import { generateAllBarrels, findAllBarrelEntryConfigs } from "../smith.js";

findAllBarrelEntryConfigs()
	.then((configs) => {
		generateAllBarrels(configs);

		process.exit(0)
	})
	.catch((err) => {
		console.error("Error while generating barrels:", err);
		process.exit(1);
	});
