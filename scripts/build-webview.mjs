import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = resolve(__dirname, "..");
const webviewRoot = resolve(projectRoot, "webview");
const outdir = resolve(projectRoot, "media");

await build({
  entryPoints: [resolve(webviewRoot, "src", "index.tsx")],
  bundle: true,
  outfile: resolve(outdir, "webview.js"),
  minify: true,
  sourcemap: false,
  target: "es2020",
  format: "iife",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

console.log("Built webview to", resolve(outdir, "webview.js"));
