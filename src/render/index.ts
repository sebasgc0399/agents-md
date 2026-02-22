/**
 * Main rendering module
 */

import { DetectionResult, GenerationResult, Profile } from '../types.js';
import { buildTemplateContext } from './data-builder.js';
import { renderTemplate, selectTemplate } from './mustache-renderer.js';
import { validateOutput } from './validators.js';

/**
 * Render AGENTS.md from detection result
 */
export function renderAgentsMd(
  detection: DetectionResult,
  profile: Profile = 'standard'
): GenerationResult {
  // Build template context
  const context = buildTemplateContext(detection, profile);

  // Select appropriate template
  const templateName = selectTemplate(context);

  // Render template
  const content = renderTemplate(templateName, context);

  // Validate output
  const validation = validateOutput(content, profile);

  return {
    content,
    validation,
    detection,
  };
}

// Re-export sub-modules for testing
export { buildTemplateContext } from './data-builder.js';
export { renderTemplate, selectTemplate } from './mustache-renderer.js';
export { validateOutput } from './validators.js';
