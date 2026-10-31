import { execFileSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { baselineDirectory, createBaselineArchive, restoreBaselines } from './visual-storage';
import { buildGallery } from './visual-report';

const [mode, ...args] = process.argv.slice(2);
if (mode !== 'compare' && mode !== 'update') throw new Error('compare または update を指定してください');

await rm('playwright-report', { recursive: true, force: true });
await rm('test-results', { recursive: true, force: true });
await rm('.visual-candidates', { recursive: true, force: true });
if (mode === 'compare') await restoreBaselines(process.env.TKW_VISUAL_BASELINE_ARCHIVE);
else await rm(baselineDirectory, { recursive: true, force: true });

const processResult = Bun.spawnSync(['bunx', '--no-install', 'playwright', 'test',
  `--update-snapshots=${mode === 'update' ? 'all' : 'none'}`, ...args], { stdout: 'inherit', stderr: 'inherit' });
await buildGallery();
if (mode === 'update' && processResult.exitCode === 0) {
  const sourceSha = process.env.GITHUB_SHA ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const archive = await createBaselineArchive(baselineDirectory, sourceSha);
  await mkdir('.visual-candidates', { recursive: true });
  await writeFile('.visual-candidates/baselines.zip', archive);
}
process.exit(processResult.exitCode);
