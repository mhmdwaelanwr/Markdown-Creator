import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../utils/dialog_helper.dart';
import '../../providers/project_provider.dart';
import '../../utils/downloader.dart';
import '../../utils/toast_helper.dart';
import '../../generator/file_generators.dart';
import '../../core/constants/app_colors.dart';

class ExtraFilesDialog extends StatelessWidget {
  const ExtraFilesDialog({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ProjectProvider>(context, listen: false);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return StyledDialog(
      title: const DialogHeader(
        title: 'Generate Extra Files',
        icon: Icons.library_add_rounded,
        color: Colors.deepOrange,
      ),
      width: 550,
      height: 600,
      content: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: Column(
          children: [
            _buildInfoBox('Select standard documentation files to generate and download for your project repository.', isDark),
            const SizedBox(height: 24),
            _buildFileCard(
              context,
              title: 'LICENSE',
              subtitle: 'Legal permission for others to use your code.',
              icon: Icons.gavel_rounded,
              color: Colors.blue,
              onTap: () {
                final content = FileGenerators.generateLicense(
                    provider.licenseType, provider.variables['GITHUB_USERNAME'] ?? 'Author');
                downloadTextFile(content, 'LICENSE');
                ToastHelper.show(context, 'LICENSE downloaded');
              },
            ),
            const SizedBox(height: 12),
            _buildFileCard(
              context,
              title: 'CONTRIBUTING.md',
              subtitle: 'Guidelines for people who want to contribute.',
              icon: Icons.handshake_rounded,
              color: Colors.green,
              onTap: () {
                final content = FileGenerators.generateContributing(provider.variables);
                downloadTextFile(content, 'CONTRIBUTING.md');
                ToastHelper.show(context, 'CONTRIBUTING.md downloaded');
              },
            ),
            const SizedBox(height: 12),
            _buildFileCard(
              context,
              title: 'SECURITY.md',
              subtitle: 'Instructions for reporting vulnerabilities.',
              icon: Icons.security_rounded,
              color: Colors.redAccent,
              onTap: () {
                final content = FileGenerators.generateSecurity(provider.variables);
                downloadTextFile(content, 'SECURITY.md');
                ToastHelper.show(context, 'SECURITY.md downloaded');
              },
            ),
            const SizedBox(height: 12),
            _buildFileCard(
              context,
              title: 'CODE_OF_CONDUCT.md',
              subtitle: 'Standard community behavioral expectations.',
              icon: Icons.rule_rounded,
              color: Colors.purple,
              onTap: () {
                final content = FileGenerators.generateCodeOfConduct(provider.variables);
                downloadTextFile(content, 'CODE_OF_CONDUCT.md');
                ToastHelper.show(context, 'CODE_OF_CONDUCT.md downloaded');
              },
            ),
            const SizedBox(height: 12),
            _buildFileCard(
              context,
              title: 'Issue Templates',
              subtitle: 'Pre-filled bug and feature request forms.',
              icon: Icons.bug_report_rounded,
              color: Colors.orange,
              onTap: () {
                final bugReport = FileGenerators.generateBugReportTemplate();
                final featureRequest = FileGenerators.generateFeatureRequestTemplate();
                downloadTextFile(bugReport, 'bug_report.md');
                downloadTextFile(featureRequest, 'feature_request.md');
                ToastHelper.show(context, 'Templates downloaded');
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Close', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }

  Widget _buildInfoBox(String text, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.deepOrange.withAlpha(isDark ? 20 : 10),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.deepOrange.withAlpha(30)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline_rounded, color: Colors.deepOrange, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: GoogleFonts.inter(fontSize: 13, color: isDark ? Colors.white70 : Colors.black87))),
        ],
      ),
    );
  }

  Widget _buildFileCard(BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Card(
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.withAlpha(isDark ? 40 : 30)),
      ),
      color: isDark ? Colors.white.withAlpha(5) : Colors.white,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withAlpha(20),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.inter(fontSize: 12, color: Colors.grey, height: 1.3),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.download_rounded, size: 20, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}
