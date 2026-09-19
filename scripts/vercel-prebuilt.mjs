// Assembles a Vercel Build Output API (v3) directory from the Vite `dist/`
// build so a production deploy can be uploaded with `vercel deploy --prebuilt`.
//
// Why this exists: the project's remote build machines fail to provision
// ("BUILD_FAILED: Resource provisioning failed", Sept 2026). A static upload was
// the hoped-for workaround because it never needs a build box — but TD-023 records
// that `--prebuilt` uploads and `redeploy` of READY artifacts fail on the same
// team-level config, so this script is a ready path for the day provisioning is
// restored, not a working bypass. The routing rules (redirects/rewrites/headers)
// are copied from vercel.json so a single source of truth stays in the repo file —
// this script only reformats them for the build output spec (each entry needs a
// literal `route` key, and rewrites additionally need `statusCode`/`has`
// passthrough, which is already correct for the spec shape we emit).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const output = join(root, '.vercel', 'output');
const staticDir = join(output, 'static');

const vercelJson = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));

if (vercelJson.framework !== 'vite') {
  throw new Error('[vercel-prebuilt] expected vercel.json framework to be "vite"');
}

rmSync(output, { recursive: true, force: true });
cpSync(dist, staticDir, { recursive: true });

const config = {
  buildOutputVersion: '3.0',
};
if (Array.isArray(vercelJson.redirects) && vercelJson.redirects.length) {
  config.routes = [
    // Order matters in the routing engine: headers must be listed before the
    // catch-all rewrite so they apply to the final serving resource.
    ...(vercelJson.headers || []).map((h) => ({
      handle: 'header',
      src: h.source,
      headers: h.headers,
    })),
    ...vercelJson.redirects.map((r) => ({
      handle: 'rewrite',
      src: r.source,
      ...(r.has ? { has: r.has } : {}),
      dest: r.destination,
      statusCode: r.permanent === false ? 307 : 308,
    })),
    ...(vercelJson.rewrites || []).map((r) => ({
      handle: 'rewrite',
      src: r.source,
      dest: r.destination,
    })),
  ];
}

mkdirSync(output, { recursive: true });
writeFileSync(join(output, 'config.json'), JSON.stringify(config, null, 2));
writeFileSync(join(output, 'ready'), '3.0');

console.log(
  `[vercel-prebuilt] .vercel/output ready (static + ${config.routes?.length ?? 0} routes)`
);
