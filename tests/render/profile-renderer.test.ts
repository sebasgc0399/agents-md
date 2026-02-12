import { describe, it, expect } from 'vitest';
import path from 'path';
import { detectProject } from '../../src/detect/index.js';
import { renderAgentsMd } from '../../src/render/index.js';

const MAX_LINES = {
  compact: 110,
  standard: 230,
  full: 360,
} as const;

const MIN_LINES = {
  standard: 150,
  full: 220,
} as const;

function countLines(content: string): number {
  return content.split('\n').length;
}

describe('renderAgentsMd profiles', () => {
  it('renders compact, standard and full with expected growth and limits', async () => {
    const fixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'react-vite');
    const detection = await detectProject(fixturePath);

    const compactResult = renderAgentsMd(detection, 'compact');
    const standardResult = renderAgentsMd(detection, 'standard');
    const fullResult = renderAgentsMd(detection, 'full');
    const defaultResult = renderAgentsMd(detection);

    expect(compactResult.content).toContain('# AGENTS');
    expect(standardResult.content).toContain('# AGENTS');
    expect(fullResult.content).toContain('# AGENTS');

    const compactLines = countLines(compactResult.content);
    const standardLines = countLines(standardResult.content);
    const fullLines = countLines(fullResult.content);

    expect(compactLines).toBeLessThanOrEqual(MAX_LINES.compact);
    expect(standardLines).toBeLessThanOrEqual(MAX_LINES.standard);
    expect(fullLines).toBeLessThanOrEqual(MAX_LINES.full);
    expect(standardLines).toBeGreaterThanOrEqual(MIN_LINES.standard);
    expect(fullLines).toBeGreaterThanOrEqual(MIN_LINES.full);

    expect(standardLines).toBeGreaterThan(compactLines);
    expect(fullLines).toBeGreaterThan(standardLines);

    // Backward compatibility: default profile should behave as compact.
    expect(defaultResult.content).toBe(compactResult.content);
  });
});
