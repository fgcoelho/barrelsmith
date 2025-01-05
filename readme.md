## barrelsmith

### Installation

```bash
npm install -D barrelsmith
```

### Usage

```bash
npm barrelsmith
```

For watch mode:

```bash
npm barrelsmith -w
```

### Configuration

barrelsmith works with barrel forges, which are files named `barrel.forge.ts`

These files are used to configure multiple barrels in a single project.

> You can place the barrel entries **wherever you want**, they will be found by barrelsmith.

```ts
// barrel.forge.ts

import { BarrelForge } from "barrelsmith";

export default BarrelForge({
  // The root directories to search for files
  roots: ["./playground/src"],
  // The output barrel file
  output: "./playground/dist.ts",
  // Additional code to append to the bottom of the output file
  append: ["./playground/additional_code.js"],
  // Select which declarations to export
  exports: ["interface", "enum"],
});
```

**⚠️ By now all paths are relative to the project root.**
