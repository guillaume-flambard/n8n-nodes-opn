# Run log — n8n-nodes-opn (audit sweep, 2026-08-08)

| check | result |
|---|---|
| stack | node (>=18.10), community node, v0.1.1 (package.json, npm tag v0.1.0) |
| gates | lint:pass · typecheck:pass (tsc --noEmit) · tests:14/14 pass (jest) · audit:7 high + 7 moderate (after fix) |
| verdict | fixable-partial / upstream-pinned remainder |
| applied fix | `npm audit fix` (safe) → n8n-workflow dev dep 2.16.0 → 2.34.2; cleared lodash/@n8n/expression-runtime/uuid/form-data chain (18 → 14 vulns, 10 → 7 high) |
| remaining high | `nanoid <=3.3.16` — upstream-pinned: `@n8n/utils@1.42.0` requires `nanoid@3.3.8` (exact), `n8n-workflow >=2.30.0` requires `@n8n/utils`. Not ours to bump without overriding n8n platform deps. |
| remaining high | `braces <3.0.3` — dev-only toolchain (gulp 4 → glob-watcher → chokidar → micromatch). Only fix = gulp@5 (breaking, removes 249/changes 92 pkgs). Not worth forcing for a build-time glob; deferred. |
| remaining moderate (7) | js-yaml, uuid, form-data etc. in the same n8n-workflow dev chain. |
| findings P1/P2/P3 | P1: none after safe fix. P2: nanoid high (upstream, accepted risk for community node — must track platform's n8n-workflow; live instance is n8n 2.29.10). P2: braces high (dev-only gulp toolchain, build-time only). P3: version drift — package.json/lockfile v0.1.1 vs npm published v0.1.0 (published is behind; next publish should tag 0.1.1). |
| node env note | isolated-vm native build fails on Node 26; worked around via Node 22 (LTS). |
| committed | yes |
