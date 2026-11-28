import { gzipSync } from 'node:zlib';

import { build } from 'vite';

const result = await build({ logLevel: 'silent', build: { write: false } });
const output = (Array.isArray(result) ? result : [result]).flatMap((bundle) => bundle.output);
const chunks = new Map(
  output.filter((item) => item.type === 'chunk').map((item) => [item.fileName, item])
);
const entry = [...chunks.values()].find((item) => item.isEntry);
const catalogs = output.filter(
  (item) => item.type === 'asset' && /\/interface-[a-z]+-[^/]+\.json$/.test(item.fileName)
);
const styles = output.filter((item) => item.type === 'asset' && item.fileName.endsWith('.css'));
if (!entry || catalogs.length !== 7)
  throw new Error('Expected one app entry and seven interface catalogs.');

const visited = new Set();
const visit = (chunk) => {
  if (visited.has(chunk.fileName)) return;
  visited.add(chunk.fileName);
  for (const file of chunk.imports) {
    const imported = chunks.get(file);
    if (!imported) throw new Error(`Unknown static chunk ${file}`);
    visit(imported);
  }
};

visit(entry);
const bytesOf = (value) => gzipSync(value).length;
const startupJs = [...visited].reduce((bytes, file) => bytes + bytesOf(chunks.get(file).code), 0);
const startupCssNames = new Set(
  [...visited].flatMap((file) => [...chunks.get(file).viteMetadata.importedCss])
);
const startupCss = styles
  .filter((item) => startupCssNames.has(item.fileName))
  .reduce((bytes, item) => bytes + bytesOf(item.source), 0);
if (!startupCss) throw new Error('Startup bundle has no styles.');
const limits = { scriptAndCatalog: 176_000, css: 13_000 };
const largestCatalog = Math.max(...catalogs.map((item) => bytesOf(item.source)));
const measured = { scriptAndCatalog: startupJs + largestCatalog, css: startupCss };

process.stdout.write(`${JSON.stringify({ gzipBytes: measured, limits })}\n`);
if (Object.keys(limits).some((key) => measured[key] > limits[key])) process.exitCode = 1;
