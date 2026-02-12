/**
 * Output validation
 */

import { Profile, ValidationResult } from '../types.js';
import { estimateTokens } from '../utils/token-counter.js';

const PROFILE_LIMITS: Record<
  Profile,
  { minLines: number; maxLines: number; minTokens: number; maxTokens: number }
> = {
  compact: {
    minLines: 50,
    maxLines: 110,
    minTokens: 0,
    maxTokens: 900,
  },
  standard: {
    minLines: 150,
    maxLines: 230,
    minTokens: 0,
    maxTokens: 1600,
  },
  full: {
    minLines: 220,
    maxLines: 360,
    minTokens: 0,
    maxTokens: 2400,
  },
};

/**
 * Validate generated AGENTS.md content
 */
export function validateOutput(
  content: string,
  profile: Profile = 'compact'
): ValidationResult {
  const normalized = content.replace(/\r\n/g, '\n');
  const normalizedForCount = normalized.replace(/\n+$/g, '');
  const lines = normalizedForCount.length ? normalizedForCount.split('\n') : [''];
  const lineCount = lines.length;
  const estimatedTokens = estimateTokens(normalized);
  const limits = PROFILE_LIMITS[profile];

  const warnings: string[] = [];
  const errors: string[] = [];

  // Line count validation (profile-specific targets)
  if (lineCount < limits.minLines) {
    warnings.push(
      `Output is quite short (${lineCount} lines). Target for ${profile}: ` +
        `${limits.minLines}-${limits.maxLines} lines.`
    );
  } else if (lineCount > limits.maxLines) {
    warnings.push(
      `Output is too long (${lineCount} lines). Target for ${profile}: ` +
        `${limits.minLines}-${limits.maxLines} lines.`
    );
  }

  // Token count validation (profile-specific targets)
  if (limits.minTokens > 0 && estimatedTokens < limits.minTokens) {
    warnings.push(
      `Only ${estimatedTokens} tokens (target for ${profile}: ` +
        `${limits.minTokens}-${limits.maxTokens}). Consider adding more details.`
    );
  } else if (estimatedTokens > limits.maxTokens) {
    warnings.push(
      `${estimatedTokens} tokens exceeds budget for ${profile} (max: ${limits.maxTokens}). ` +
        'AI agents may not process it efficiently.'
    );
  }

  // Check for placeholder tokens that shouldn't be in output
  const forbiddenPlaceholders: Array<{ token: string; pattern: RegExp }> = [
    { token: 'undefined', pattern: /\bundefined\b/ },
    { token: 'null', pattern: /\bnull\b/ },
  ];
  for (const { token, pattern } of forbiddenPlaceholders) {
    if (pattern.test(normalized)) {
      errors.push(`Output contains forbidden placeholder string: "${token}"`);
    }
  }

  // Check for N/A commands (should use conditional rendering instead)
  const naCount = (normalized.match(/`N\/A`/g) || []).length;
  if (naCount > 0) {
    warnings.push(
      `Found ${naCount} N/A placeholder(s). Consider hiding missing commands.`
    );
  }

  // Check for empty level-2 sections (ignore level-3 headings as boundaries).
  const headingRegex = /^##\s+.+$/gm;
  const headings = Array.from(normalized.matchAll(headingRegex));
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const headingIndex = heading.index;
    if (headingIndex === undefined) {
      continue;
    }

    const headingLine = heading[0];
    const start = headingIndex;
    const end = headings[i + 1]?.index ?? normalized.length;
    const sectionBody = normalized.slice(start + headingLine.length, end);
    const hasMeaningfulLine = sectionBody.split('\n').some(line => {
      const trimmed = line.trim();
      if (trimmed === '') {
        return false;
      }
      if (/^<!--.*-->$/.test(trimmed)) {
        return false;
      }
      return true;
    });

    if (!hasMeaningfulLine) {
      warnings.push(`Section "${headingLine.trim()}" appears to be empty`);
    }
  }

  // Warnings are soft limits and should not block generation.
  const valid = errors.length === 0;

  return {
    valid,
    warnings,
    errors,
    lineCount,
    estimatedTokens,
  };
}
