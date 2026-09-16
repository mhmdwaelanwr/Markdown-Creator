// HealthCheckService (React Native)
// Analyzes README elements for issues
export const IssueSeverity = { error: 'error', warning: 'warning', info: 'info', success: 'success' };
export class HealthIssue {
  constructor({ message, severity, elementId, suggestion }) {
    this.message = message;
    this.severity = severity;
    this.elementId = elementId;
    this.suggestion = suggestion;
  }
}
export class HealthCheckService {
  static analyze(elements) {
    const issues = [];
    if (!elements || elements.length === 0) {
      issues.push(new HealthIssue({
        message: 'Your README is empty.',
        severity: IssueSeverity.info,
        suggestion: 'Add a Title (H1) to start your project documentation.'
      }));
      return issues;
    }
    let hasH1 = false;
    let hasDescription = false;
    let hasInstall = false;
    let imageCount = 0;
    for (const element of elements) {
      if (element.type === 'heading' && element.level === 1) hasH1 = true;
      if (element.type === 'paragraph' && element.text && element.text.length > 30) hasDescription = true;
      if (element.type === 'heading' && /install/i.test(element.text)) hasInstall = true;
      if (element.type === 'image') imageCount++;
      if (element.type === 'heading' && (!element.text || !element.text.trim())) {
        issues.push(new HealthIssue({ message: 'Empty heading detected.', severity: IssueSeverity.error, elementId: element.id }));
      }
      if (element.type === 'image' && (!element.altText || !element.altText.trim())) {
        issues.push(new HealthIssue({ message: 'Image missing alt text.', severity: IssueSeverity.warning, elementId: element.id, suggestion: 'Add alt text for accessibility.' }));
      }
      if ((element.type === 'linkButton' || element.type === 'button') && (!element.url || !element.url.trim())) {
        issues.push(new HealthIssue({ message: 'Button with no URL.', severity: IssueSeverity.error, elementId: element.id }));
      }
    }
    if (!hasH1) issues.push(new HealthIssue({ message: 'Missing H1 Title.', severity: IssueSeverity.error, suggestion: 'Add a main heading (H1).' }));
    if (!hasDescription) issues.push(new HealthIssue({ message: 'No project description.', severity: IssueSeverity.warning, suggestion: 'Add a paragraph describing your project.' }));
    if (!hasInstall) issues.push(new HealthIssue({ message: 'No installation section.', severity: IssueSeverity.info, suggestion: 'Add an Installation section.' }));
    if (imageCount === 0) issues.push(new HealthIssue({ message: 'No images found.', severity: IssueSeverity.info, suggestion: 'Add at least one image or badge.' }));
    return issues;
  }

  static calculateDocumentationScore(elements) {
    if (!elements || elements.length === 0) return 0;
    let score = 30;
    if (elements.some((e) => e.type === 'heading' && e.level === 1)) score += 20;
    if (elements.some((e) => e.type === 'paragraph' && (e.text || '').length > 50)) score += 20;
    if (elements.some((e) => e.type === 'image')) score += 10;
    if (elements.some((e) => e.type === 'code' || e.type === 'codeBlock')) score += 10;
    if (elements.some((e) => e.type === 'socials')) score += 10;
    return Math.min(100, Math.max(0, score));
  }
}
