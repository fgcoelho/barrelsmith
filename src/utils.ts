import { readFileSync } from "fs";

export function parseExportsFromFile(
  filePath: string,
  allowedKinds: string[]
): string[] {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  const matched: string[] = [];

  const exportRegex = new RegExp(
    String.raw`^\s*export\s+(${allowedKinds.join("|")})\s+([A-Za-z0-9_$]+)`,
    "i"
  );

  const namedExportRegex = /^\s*export\s*{\s*([^}]+)\s*}/;

  for (let line of lines) {
    let match = line.match(exportRegex);
    if (match) {
      const kind = match[1];
      const name = match[2];
      matched.push(`${kind} ${name}`);
      continue;
    }

    // Handle named exports if "named" is in allowedKinds
    if (allowedKinds.includes("named")) {
      match = line.match(namedExportRegex);
      if (match) {
        const names = match[1]!.split(",").map((name) => name.trim());
        for (const name of names) {
          matched.push(`named ${name}`);
        }
      }
    }
  }

  return matched;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    const context = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
