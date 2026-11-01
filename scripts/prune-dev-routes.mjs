// Removes dev-only routes from the static export.
//
// SPEC.md Phase 1 wants /styleguide to be "dev only", but a static export has
// no middleware and Next rejects an empty generateStaticParams() under
// `output: 'export'`, so the route cannot exclude itself. It is generated and
// then pruned here, along with every reference to it in the build manifests.
//
// Set NEXT_PUBLIC_ENABLE_STYLEGUIDE=1 to keep it (see `pnpm build:styleguide`).

import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = 'out';
const DEV_ROUTES = ['styleguide'];

if (process.env.NEXT_PUBLIC_ENABLE_STYLEGUIDE === '1') {
  console.log('prune-dev-routes: styleguide enabled, keeping dev routes');
  process.exit(0);
}

let removed = 0;
let scrubbed = 0;

for (const route of DEV_ROUTES) {
  await rm(join(OUT, route), { recursive: true, force: true });
  removed += 1;
}

// Walk the export and strip any lingering manifest entries naming a dev route.
async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const TEXTUAL = /\.(js|json|txt|html|xml)$/;

for await (const file of walk(OUT)) {
  if (!TEXTUAL.test(file)) continue;
  const original = await readFile(file, 'utf8');
  if (!DEV_ROUTES.some((r) => original.includes(r))) continue;

  let next = original;
  for (const route of DEV_ROUTES) {
    // Drop the route from JSON-ish arrays of paths in the build manifests.
    next = next
      .replaceAll(`"/${route}",`, '')
      .replaceAll(`,"/${route}"`, '')
      .replaceAll(`"/${route}"`, '""');
  }
  if (next !== original) {
    await writeFile(file, next);
    scrubbed += 1;
  }
}

console.log(
  `prune-dev-routes: removed ${removed} dev route(s), scrubbed ${scrubbed} manifest file(s)`,
);
