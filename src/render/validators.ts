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
  const lines = content.split('\n');
  const lineCount = lines.length;
  const estimatedTokens = estimateTokens(content);
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
    if (pattern.test(content)) {
      errors.push(`Output contains forbidden placeholder string: "${token}"`);
    }
  }

  // Check for N/A commands (should use conditional rendering instead)
  const naCount = (content.match(/`N\/A`/g) || []).length;
  if (naCount > 0) {
    warnings.push(
      `Found ${naCount} N/A placeholder(s). Consider hiding missing commands.`
    );
  }

  // Check for empty sections
  const emptySectionRegex = /^##\s+.+\s*$/gm;
  const sections = content.match(emptySectionRegex) || [];
  for (const section of sections) {
    const sectionIndex = content.indexOf(section);
    const nextSectionIndex = content.indexOf('##', sectionIndex + section.length);
    const sectionContent = content.substring(
      sectionIndex + section.length,
      nextSectionIndex === -1 ? content.length : nextSectionIndex
    );

    if (sectionContent.trim().length < 10) {
      warnings.push(`Section "${section.trim()}" appears to be empty`);
    }
  }

  const valid = errors.length === 0 && warnings.length === 0;

  return {
    valid,
    warnings,
    errors,
    lineCount,
    estimatedTokens,
  };
}
