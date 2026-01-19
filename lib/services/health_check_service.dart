import '../models/readme_element.dart';

enum IssueSeverity { error, warning, info, success }

class HealthIssue {
  final String message;
  final IssueSeverity severity;
  final String? elementId;
  final String? suggestion;

  HealthIssue({
    required this.message,
    required this.severity,
    this.elementId,
    this.suggestion,
  });
}

class HealthCheckService {
  /// Standard Structural Analysis (The "Normal" Health Check)
  static List<HealthIssue> analyze(List<ReadmeElement> elements) {
    final List<HealthIssue> issues = [];

    if (elements.isEmpty) {
      issues.add(HealthIssue(
        message: 'Your README is empty.',
        severity: IssueSeverity.info,
        suggestion: 'Add a Title (H1) to start your project documentation.',
      ));
      return issues;
    }

    bool hasH1 = false;
    bool hasDescription = false;
    bool hasInstall = false;
    int imageCount = 0;

    for (final element in elements) {
      if (element is HeadingElement) {
        if (element.level == 1) hasH1 = true;
        if (element.text.toLowerCase().contains('install')) hasInstall = true;
      }
      if (element is ParagraphElement) {
        if (element.text.length > 20) hasDescription = true;
      }
      if (element is ImageElement) imageCount++;
      
      // Detailed element checks
      if (element is HeadingElement && element.text.trim().isEmpty) {
        issues.add(HealthIssue(message: 'Empty Heading detected.', severity: IssueSeverity.error, elementId: element.id));
      }
      if (element is ImageElement && element.altText.isEmpty) {
        issues.add(HealthIssue(message: 'Image missing Alt Text.', severity: IssueSeverity.warning, elementId: element.id, suggestion: 'Alt text is vital for accessibility.'));
      }
      if (element is LinkButtonElement && element.url.isEmpty) {
        issues.add(HealthIssue(message: 'Button with no URL.', severity: IssueSeverity.error, elementId: element.id));
      }
    }

    if (!hasH1) issues.add(HealthIssue(message: 'Missing Main Title (H1).', severity: IssueSeverity.error, suggestion: 'Every README should start with a clear H1 title.'));
    if (!hasDescription) issues.add(HealthIssue(message: 'Short or missing description.', severity: IssueSeverity.warning, suggestion: 'Add a paragraph explaining what your project does.'));
    if (imageCount == 0) issues.add(HealthIssue(message: 'No visuals found.', severity: IssueSeverity.info, suggestion: 'Adding a screenshot or logo makes your project more attractive.'));
    if (!hasInstall) issues.add(HealthIssue(message: 'Installation steps not found.', severity: IssueSeverity.warning, suggestion: 'Tell users how to get your project running.'));

    return issues;
  }

  static double calculateDocumentationScore(List<ReadmeElement> elements) {
    if (elements.isEmpty) return 0;
    double score = 30; // Base
    if (elements.any((e) => e is HeadingElement && e.level == 1)) score += 20;
    if (elements.any((e) => e is ParagraphElement && e.text.length > 50)) score += 20;
    if (elements.any((e) => e is ImageElement)) score += 10;
    if (elements.any((e) => e is CodeBlockElement)) score += 10;
    if (elements.any((e) => e is SocialsElement)) score += 10;
    return score.clamp(0, 100);
  }
}
