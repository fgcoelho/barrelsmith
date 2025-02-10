import {
	readdirSync,
	statSync,
	readFileSync,
	writeFileSync,
	existsSync,
	unlinkSync,
} from "node:fs";
import { join, resolve, relative, dirname, extname } from "node:path";
import type { BarrelForgeOptions } from "./config/config.js";
import { parseExportsFromFile } from "./utils.js";
import {
	type ExportDeclaration,
	type TypeDeclaration,
	typeDeclarations,
} from "./config/declarations.js";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

export async function findAllBarrelEntryConfigs(): Promise<
	Required<BarrelForgeOptions>[]
> {
	const barrelEntryFiles: string[] = [];
	const projectRoot = process.cwd();

	function walk(dir: string) {
		for (const fileOrDir of readdirSync(dir)) {
			const fullPath = join(dir, fileOrDir);
			const stats = statSync(fullPath);

			if (stats.isDirectory()) {
				if (
					["node_modules", "dist", ".git", ".next"].some((skip) =>
						fullPath.includes(skip),
					)
				) {
					continue;
				}
				walk(fullPath);
			} else {
				if (fullPath.match(/barrel.forge\.(m?ts|m?js|cjs)$/)) {
					barrelEntryFiles.push(fullPath);
				}
			}
		}
	}

	walk(projectRoot);

	const finalConfigs: Required<BarrelForgeOptions>[] = [];
	for (const entryFile of barrelEntryFiles) {
		try {
			const config = (await jiti.import(entryFile, {
				default: true,
			})) as Required<BarrelForgeOptions>;

			finalConfigs.push(config);
		} catch (err) {
			console.error(`Could not import config from ${entryFile}`, err);
		}
	}

	return finalConfigs;
}

export function generateAllBarrels(configs: Required<BarrelForgeOptions>[]) {
	for (const conf of configs) {
		try {
			generateSingleBarrel(conf);
		} catch (err) {
			console.error(`Error generating barrel for config: ${conf.output}`, err);
		}
	}
}

export function generateSingleBarrel(config: Required<BarrelForgeOptions>) {
	const { roots, output, exports: exportKinds, ignore, append } = config;
	const projectRoot = process.cwd();

	const allNamedExports: Record<string, string[]> = {};

	for (const rootDir of roots) {
		const rootFull = resolve(projectRoot, rootDir);
		collectExports(
			rootFull,
			rootFull,
			allNamedExports,
			exportKinds,
			ignore ?? [],
		);
	}

	const outputAbsolute = resolve(projectRoot, output);

	if (existsSync(outputAbsolute)) {
		unlinkSync(outputAbsolute);
	}

	let finalContent = buildExportStatements(allNamedExports, outputAbsolute);

	if (append) {
		for (const appendPath of append) {
			const appendPathAbsolute = resolve(projectRoot, appendPath);

			if (existsSync(appendPathAbsolute)) {
				const appendedCode = readFileSync(appendPathAbsolute, "utf8");
				finalContent += `\n${appendedCode}`;
			}
		}
	}

	writeFileSync(outputAbsolute, finalContent, "utf8");
	console.log(`Barrel generated: ${outputAbsolute}`);
}

function collectExports(
	rootDir: string,
	dir: string,
	allNamedExports: Record<string, string[]>,
	exportKinds: ExportDeclaration[],
	ignore: string[],
) {
	const entries = readdirSync(dir);
	for (const entry of entries) {
		const fullPath = join(dir, entry);

		const stats = statSync(fullPath);

		if (ignore.some((skip) => fullPath.includes(skip))) {
			continue;
		}

		if (stats.isDirectory()) {
			collectExports(rootDir, fullPath, allNamedExports, exportKinds, ignore);
		} else {
			const extension = extname(fullPath);
			if (![".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(extension)) {
				continue;
			}

			const foundExports = parseExportsFromFile(fullPath, exportKinds);
			if (foundExports.length) {
				allNamedExports[fullPath] = foundExports;
			}
		}
	}
}

function buildExportStatements(
	allExports: Record<string, string[]>,
	outputFilePath: string,
): string {
	let content = "";
	const outDir = dirname(outputFilePath);

	for (const sourceFileAbsolute in allExports) {
		const exportsFromFile = allExports[sourceFileAbsolute];
		if (!exportsFromFile || !exportsFromFile.length) continue;

		let relPath = relative(outDir, sourceFileAbsolute);

		relPath = relPath.replace(/\.(tsx?|jsx?|mjs|cjs|js)$/, "");

		relPath = relPath.replace(/\\/g, "/");

		if (!relPath.startsWith(".")) {
			relPath = `./${relPath}`;
		}

		const typeExports: string[] = [];
		const valueExports: string[] = [];

		for (const exp of exportsFromFile) {
			const [keyword, name] = exp.split(/\s+/) as [TypeDeclaration, string];
			if (typeDeclarations.includes(keyword as TypeDeclaration)) {
				typeExports.push(name as string);
			} else {
				valueExports.push(name as string);
			}
		}

		if (typeExports.length) {
			content += `export type { ${typeExports.join(", ")} } from "${relPath}";\n`;
		}

		if (valueExports.length) {
			content += `export { ${valueExports.join(", ")} } from "${relPath}";\n`;
		}
	}

	return content;
}
