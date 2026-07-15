import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { exportJsonSchemas } from "../src/index.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(packageRoot, "schema");
const outputPath = resolve(outputDirectory, "strainspace.schema.json");

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(exportJsonSchemas(), null, 2)}\n`,
  "utf8",
);
console.log(`Exported JSON Schema to ${outputPath}`);
