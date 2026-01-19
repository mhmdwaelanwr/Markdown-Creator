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
  static List<HealthIssue> analyze(List<ReadmeElement> elements) {
    final List<HealthIssue> issues = [];

    if (elements.isEmpty) {
      issues.add(HealthIssue(
        message: 'Your README is a blank canvas.',
        severity: IssueSeverity.info,
        suggestion: 'Start by adding a Project Title (H1) to introduce your work.',
      ));
      return issues;
    }

    // 1. Critical Structure Analysis
    bool hasH1 = false;
    int imageCount = 0;
    int linkCount = 0;

    for (final element in elements) {
      if (element is HeadingElement && element.level == 1) hasH1 = true;
      if (element is ImageElement) imageCount++;
      if (element is LinkButtonElement || element is BadgeElement) linkCount++;
    }

    if (!hasH1) {
      issues.add(HealthIssue(
        message: 'Missing Main Title.',
        severity: IssueSeverity.error,
        suggestion: 'Add an H1 heading with your project name for better SEO.',
      ));
    }

    // 2. Visual & Media Analysis
    if (imageCount == 0) {
      issues.add(HealthIssue(
        message: 'Low visual appeal.',
        severity: IssueSeverity.warning,
        suggestion: 'Consider adding a screenshot or a demo GIF to showcase your app.',
      ));
    }

    // 3. Social & Networking Analysis
    if (!elements.any((e) => e is SocialsElement)) {
      issues.add(HealthIssue(
        message: 'Community links missing.',
        severity: IssueSeverity.info,
        suggestion: 'Add a Socials element so people can find and support you.',
      ));
    }

    // 4. Code Quality Check
    for (final element in elements) {
      if (element is CodeBlockElement && element.code.length < 10) {
        issues.add(HealthIssue(
          message: 'Short code block detected.',
          severity: IssueSeverity.warning,
          elementId: element.id,
          suggestion: 'Provide a meaningful code example or installation step.',
        ));
      }
    }

    // 5. Documentation Balance (Algo)
    if (elements.length > 3 && issues.isEmpty) {
      issues.add(HealthIssue(
        message: 'Documentation looking great!',
        severity: IssueSeverity.success,
        suggestion: 'You have a well-balanced structure. Ready to publish!',
      ));
    }

    return issues;
  }

  static double calculateDocumentationScore(List<ReadmeElement> elements) {
    if (elements.isEmpty) return 0;
    
    double score = 20; // Base score for starting
    
    // Structure points
    if (elements.any((e) => e is HeadingElement && e.level == 1)) score += 20;
    if (elements.any((e) => e is HeadingElement && e.level == 2)) score += 10;
    
    // Content points
    if (elements.any((e) => e is ParagraphElement)) score += 15;
    if (elements.any((e) => e is ImageElement)) score += 15;
    if (elements.any((e) => e is CodeBlockElement)) score += 10;
    if (elements.any((e) => e is ListElement)) score += 10;
    
    return score.clamp(0, 100);
  }
}
