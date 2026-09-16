class FileGenerators {
  static generateContributing(variables) {
    const projectName = variables.PROJECT_NAME || 'Project Name';
    const email = variables.EMAIL || 'email@example.com';
    const githubUser = variables.GITHUB_USERNAME || 'username';

    return `
# Contributing to ${projectName}

First off, thanks for taking the time to contribute!

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)

## Code of Conduct
This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behavior to <${email}>.

## I Have a Question
Before you ask a question, it is best to search for existing [Issues](https://github.com/${githubUser}/${projectName}/issues).
If you then still feel the need to ask a question, open an [Issue](https://github.com/${githubUser}/${projectName}/issues/new).
`;
  }

  static generateCodeOfConduct(variables) {
    const email = variables.EMAIL || 'email@example.com';
    return `
# Contributor Covenant Code of Conduct

## Our Pledge
In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to make participation in our project and our community a harassment-free experience for everyone.

## Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at <${email}>.
`;
  }

  static generateSecurity(variables) {
    const email = variables.EMAIL || 'email@example.com';
    return `
# Security Policy

## Supported Versions
| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes |
| < 1.0   | No |

## Reporting a Vulnerability
Please report any security vulnerabilities to <${email}>.
`;
  }

  static generateBugReportTemplate() {
    return `
---
name: Bug report
about: Create a report to help us improve
title: ''
labels: 'bug'
assignees: ''
---
**Describe the bug**
A clear and concise description of what the bug is.
**To Reproduce**
Steps to reproduce the behavior...
`;
  }

  static generateFeatureRequestTemplate() {
    return `
---
name: Feature request
about: Suggest an idea for this project
---
**Is your feature request related to a problem?**
A clear description of what the problem is.
`;
  }
}

export default FileGenerators;
