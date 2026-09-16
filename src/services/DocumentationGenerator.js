class DocumentationGenerator {
  static generateSecurityPolicy(email) {
    return `
# Security Policy

## Supported Versions
Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes |
| < 1.0   | No |

## Reporting a Vulnerability
We take the security of this project seriously. Please report it via email to: **${email}**
`;
  }

  static generateSupport(email, discordLink) {
    return `
# Support

## Documentation
Before asking for help, please check:
* [README.md](README.md)
* [CONTRIBUTING.md](CONTRIBUTING.md)

## Community Support
${discordLink ? `* **Discord**: [Join our Server](${discordLink})` : ''}
* **GitHub Discussions**: [Ask a Question](../../discussions)

## Contact
For non-technical inquiries, contact the maintainer at: **${email}**
`;
  }

  static generateCodeOfConduct(email) {
    return `
# Contributor Covenant Code of Conduct

## Our Pledge
We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone.

## Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders at [${email}].
`;
  }

  static generateBugReportTemplate() {
    return `
---
name: Bug report
about: Create a report to help us improve
title: "[BUG] "
labels: bug
---
**Describe the bug**
A clear and concise description of what the bug is.
**To Reproduce**
Steps to reproduce the behavior...
`;
  }

  static generatePullRequestTemplate() {
    return `
## Description
Please include a summary of the change and which issue is fixed.

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update

## Checklist:
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
`;
  }
}

export default DocumentationGenerator;
