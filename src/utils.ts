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

  for (let line of lines) {
    const match = line.match(exportRegex);
    if (match) {
      const kind = match[1];
      const name = match[2];
      matched.push(`${kind} ${name}`);
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
