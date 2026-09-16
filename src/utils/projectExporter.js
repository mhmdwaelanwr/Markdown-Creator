// ProjectExporter utility for React Native
import { downloadJsonFile, downloadReadme, downloadTextFile } from './downloader';
import MarkdownGenerator from '../services/MarkdownGenerator';
import LicenseGenerator from '../services/LicenseGenerator';
import DocumentationGenerator from '../services/DocumentationGenerator';
import FileGenerators from '../services/FileGenerators';

export function exportProject({
  elements,
  variables,
  licenseType,
  includeContributing,
  includeSecurity = false,
  includeSupport = false,
  includeCodeOfConduct = false,
  includeIssueTemplates = false,
  listBullet = '*',
  sectionSpacing = 1,
  exportHtml = false,
  targetLanguage = 'en',
}) {
  const markdown = MarkdownGenerator.generate(
    elements,
    variables,
    listBullet,
    sectionSpacing,
    targetLanguage,
    false,
  );
  downloadReadme(markdown);

  if (licenseType && licenseType !== 'None') {
    const license = LicenseGenerator.generate(licenseType, variables.CURRENT_YEAR || new Date().getFullYear(), variables.GITHUB_USERNAME || 'author');
    downloadTextFile(license, 'LICENSE');
  }

  if (includeContributing) {
    const contributing = FileGenerators.generateContributing(variables);
    downloadTextFile(contributing, 'CONTRIBUTING.md');
  }

  if (includeCodeOfConduct) {
    const coc = FileGenerators.generateCodeOfConduct(variables);
    downloadTextFile(coc, 'CODE_OF_CONDUCT.md');
  }

  if (includeSecurity) {
    const security = DocumentationGenerator.generateSecurityPolicy(variables.EMAIL || 'security@example.com');
    downloadTextFile(security, 'SECURITY.md');
  }

  if (includeSupport) {
    const support = DocumentationGenerator.generateSupport(variables.EMAIL || 'support@example.com', variables.DISCORD || '');
    downloadTextFile(support, 'SUPPORT.md');
  }

  if (includeIssueTemplates) {
    const bug = FileGenerators.generateBugReportTemplate();
    const feature = FileGenerators.generateFeatureRequestTemplate();
    downloadTextFile(bug, 'bug_report.md');
    downloadTextFile(feature, 'feature_request.md');
  }

  if (exportHtml) {
    const html = `<html><body><pre>${markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`;
    downloadTextFile(html, 'README.html');
  }

  if (targetLanguage && targetLanguage !== 'en') {
    const payload = { targetLanguage, markdown };
    downloadJsonFile(payload, 'translation_request.json');
  }
}
