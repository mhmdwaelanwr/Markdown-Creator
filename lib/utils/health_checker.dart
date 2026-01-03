import '../models/readme_element.dart';

enum HealthIssueType { warning, error }

class HealthIssue {
  final String message;
  final HealthIssueType type;
  final String? elementId;

  HealthIssue(this.message, this.type, [this.elementId]);
}

class HealthChecker {
  static List<HealthIssue> check(List<ReadmeElement> elements) {
    final issues = <HealthIssue>[];

    // Check for images without alt text
    for (final element in elements) {
      if (element is ImageElement) {
        if (element.altText.isEmpty) {
          issues.add(HealthIssue('Image missing alt text', HealthIssueType.warning, element.id));
        }
      }
    }

    // Check heading hierarchy
    int lastLevel = 0;
    for (final element in elements) {
      if (element is HeadingElement) {
        if (lastLevel != 0 && element.level > lastLevel + 1) {
           issues.add(HealthIssue('Skipped heading level: H$lastLevel to H${element.level}', HealthIssueType.warning, element.id));
        }
        lastLevel = element.level;
      }
    }

    return issues;
  }
}

