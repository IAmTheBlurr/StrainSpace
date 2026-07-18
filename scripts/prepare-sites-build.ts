import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const workspace = resolve(import.meta.dirname, "..");
const output = resolve(workspace, "dist");

await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, "server"), { recursive: true });
await mkdir(resolve(output, ".openai"), { recursive: true });
await cp(resolve(workspace, "apps/web/build"), resolve(output, "client"), {
  recursive: true,
});
await cp(
  resolve(workspace, "apps/web/sites-worker.mjs"),
  resolve(output, "server/index.js"),
);
await cp(
  resolve(workspace, ".openai/hosting.json"),
  resolve(output, ".openai/hosting.json"),
);

console.log("Prepared Cloudflare-compatible Sites build in dist/.");
