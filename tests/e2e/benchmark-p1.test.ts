import { describe, expect, it } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const p1ScriptPath = path.join(repoRoot, 'scripts', 'benchmark', 'p1.mjs');
const baselinePath = path.join(
  repoRoot,
  'tests',
  'benchmark',
  'baselines',
  'p1.semantic.json'
);

function runP1(args: string[]) {
  return spawnSync(process.execPath, [p1ScriptPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf-8',
  });
}

describe('benchmark p1 harness', () => {
  it('passes in check mode with committed baseline', () => {
    const result = runP1([]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('P1 benchmark check passed');
  });

  it('fails when baseline path is invalid', () => {
    const result = runP1([
      '--baseline',
      'tests/benchmark/baselines/missing.baseline.json',
    ]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Baseline file not found');
  });

  it('update-baseline is deterministic', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-md-p1-'));
    const tempBaseline = path.join(tempDir, 'p1.semantic.json');

    const run1 = runP1([
      '--update-baseline',
      '--baseline',
      tempBaseline,
      '--fixtures',
      'react-vite',
      '--profiles',
      'compact',
    ]);
    expect(run1.status).toBe(0);

    const firstContent = fs.readFileSync(tempBaseline, 'utf-8');

    const run2 = runP1([
      '--update-baseline',
      '--baseline',
      tempBaseline,
      '--fixtures',
      'react-vite',
      '--profiles',
      'compact',
    ]);
    expect(run2.status).toBe(0);

    const secondContent = fs.readFileSync(tempBaseline, 'utf-8');
    expect(secondContent).toBe(firstContent);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('fails on semantic mismatch', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-md-p1-mismatch-'));
    const tempBaseline = path.join(tempDir, 'p1.semantic.json');

    fs.copyFileSync(baselinePath, tempBaseline);
    const parsed = JSON.parse(fs.readFileSync(tempBaseline, 'utf-8'));
    parsed.cases[0].semantic.requiredSectionsPresent = [];
    fs.writeFileSync(tempBaseline, JSON.stringify(parsed, null, 2), 'utf-8');

    const result = runP1(['--baseline', tempBaseline]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('semantic snapshot drift detected');

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
