import { describe, it, expect } from 'vitest';
import { validateOutput } from '../../src/render/validators.js';

describe('validateOutput', () => {
  it('keeps valid=true when only soft-limit warnings exist', () => {
    const result = validateOutput('# AGENTS');

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('fails when output contains "undefined"', () => {
    const result = validateOutput('# AGENTS\n\nvalue: undefined');

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Output contains forbidden placeholder string: "undefined"'
    );
  });

  it('fails when output contains "null"', () => {
    const result = validateOutput('# AGENTS\n\nvalue: null');

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Output contains forbidden placeholder string: "null"'
    );
  });

  it('does not add placeholder errors when output is clean', () => {
    const result = validateOutput('# AGENTS\n\nEverything is rendered correctly.');

    expect(result.errors).toEqual([]);
  });

  it('does not fail on words that only contain placeholder substrings', () => {
    const result = validateOutput('# AGENTS\n\nWords: nullify and undefinedBehavior.');

    expect(result.errors).toEqual([]);
  });

  it('does not warn about empty section when section contains level-3 heading/content', () => {
    const result = validateOutput([
      '# AGENTS',
      '## Main section',
      '### Subsection',
      'details here',
      '## Next section',
      'text',
    ].join('\n'));

    expect(result.warnings.some(w => w.includes('appears to be empty'))).toBe(false);
  });

  it('warns when a level-2 section is immediately followed by another level-2 section', () => {
    const result = validateOutput([
      '# AGENTS',
      '## First section',
      '## Second section',
      'text',
    ].join('\n'));

    expect(result.warnings).toContain('Section "## First section" appears to be empty');
  });
});
