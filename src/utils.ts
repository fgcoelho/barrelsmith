import { readFileSync } from "fs";
import { ExportDeclaration } from "./config/declarations";

export function parseExportsFromFile(
  filePath: string,
  allowedKinds: ExportDeclaration[]
): string[] {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  const matched: string[] = [];
  let multilineExportBuffer = "";

  const exportRegex = new RegExp(
    String.raw`^\s*export\s+(${allowedKinds.join("|")})\s+([A-Za-z0-9_$]+)`,
    "i"
  );

  const namedExportStartRegex = /^\s*export\s*{\s*([^}]*)$/;
  const namedExportEndRegex = /^\s*([^}]*)\s*}\s*;?$/;
  const namedExportOneLineRegex = /^\s*export\s*{\s*([^}]*)\s*}\s*;?$/;

  for (let line of lines) {
    const match = line.match(exportRegex);

    if (match) {
      const kind = match[1];
      const name = match[2];
      matched.push(`${kind} ${name}`);
      continue;
    }

    if (multilineExportBuffer) {
      multilineExportBuffer += line.trim();
      if (line.match(namedExportEndRegex)) {
        const names = multilineExportBuffer
          .replace(/^export\s*{\s*/, "")
          .replace(/}\s*;?$/, "")
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean);

        for (const name of names) {
          const typeMatch = name.match(/^type\s+([A-Za-z0-9_$]+)/);
          if (typeMatch && allowedKinds.includes("type")) {
            matched.push(`type ${typeMatch[1]}`);
          } else if (allowedKinds.includes("named")) {
            matched.push(`named ${name}`);
          }
        }
        multilineExportBuffer = "";
      }
      continue;
    }

    const oneLineMatch = line.match(namedExportOneLineRegex);
    if (oneLineMatch) {
      const names = oneLineMatch[1]!
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);

      for (const name of names) {
        const typeMatch = name.match(/^type\s+([A-Za-z0-9_$]+)/);
        if (typeMatch && allowedKinds.includes("type")) {
          matched.push(`type ${typeMatch[1]}`);
        } else if (allowedKinds.includes("named")) {
          matched.push(`named ${name}`);
        }
      }
      continue;
    }

    const startMatch = line.match(namedExportStartRegex);
    if (startMatch) {
      multilineExportBuffer = line.trim();
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
