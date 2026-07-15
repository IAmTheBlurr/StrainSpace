import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = ["fixtures", "apps/web/src"];
const forbiddenTerms = [
  "warhammer",
  "games workshop",
  "space marine",
  "adeptus",
  "tyranid",
  "aeldari",
  "ork",
];
const copiedProseSignals = ["for the emperor", "in the grim darkness"];
const extensions = new Set([".json", ".ts", ".tsx", ".css", ".html"]);

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(path) : [path];
    }),
  );
  return nested.flat().filter((path) => extensions.has(extname(path)));
}

const files = (await Promise.all(roots.map(collectFiles))).flat();
const findings: string[] = [];

function containsPhrase(content: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(content);
}

for (const file of files) {
  const content = (await readFile(file, "utf8")).toLowerCase();
  for (const term of [...forbiddenTerms, ...copiedProseSignals]) {
    if (containsPhrase(content, term)) findings.push(`${file}: ${term}`);
  }
}

if (findings.length > 0) {
  throw new Error(`Fixture/IP scan failed:\n${findings.join("\n")}`);
}

console.log(
  `Fixture/IP scan passed for ${files.length} tracked product files.`,
);
