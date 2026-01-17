import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/project_provider.dart';
import '../../services/health_check_service.dart';
import '../../utils/dialog_helper.dart';
import '../../core/constants/app_colors.dart';

class HealthCheckDialog extends StatelessWidget {
  final List<HealthIssue> issues;
  final ProjectProvider provider;

  const HealthCheckDialog({
    super.key,
    required this.issues,
    required this.provider,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return StyledDialog(
      title: const DialogHeader(
        title: 'Health Check',
        icon: Icons.health_and_safety_rounded,
        color: Colors.redAccent,
      ),
      width: 550,
      height: 500,
      content: Column(
        children: [
          _buildStatusHeader(isDark),
          const SizedBox(height: 24),
          Expanded(
            child: issues.isEmpty ? _buildHealthyState() : _buildIssuesList(context, isDark),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(AppLocalizations.of(context)!.close, style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }

  Widget _buildStatusHeader(bool isDark) {
    final errorCount = issues.where((i) => i.severity == IssueSeverity.error).length;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: (errorCount > 0 ? Colors.red : Colors.green).withAlpha(isDark ? 20 : 10),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: (errorCount > 0 ? Colors.red : Colors.green).withAlpha(30)),
      ),
      child: Row(
        children: [
          Icon(
            errorCount > 0 ? Icons.report_problem_rounded : Icons.check_circle_rounded,
            color: errorCount > 0 ? Colors.redAccent : Colors.green,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              errorCount > 0 
                ? 'We found $errorCount critical issues that need your attention.'
                : 'Your project looks great! No critical issues found.',
              style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHealthyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.green.withAlpha(15), shape: BoxShape.circle),
            child: const Icon(Icons.verified_user_rounded, size: 64, color: Colors.green),
          ),
          const SizedBox(height: 20),
          Text('All Systems Go!', style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold)),
          Text('Your README is optimized and valid.', style: GoogleFonts.inter(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildIssuesList(BuildContext context, bool isDark) {
    return ListView.builder(
      itemCount: issues.length,
      itemBuilder: (context, index) {
        final issue = issues[index];
        final color = issue.severity == IssueSeverity.error ? Colors.redAccent : (issue.severity == IssueSeverity.warning ? Colors.orange : Colors.blue);
        
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          elevation: 0,
          color: isDark ? Colors.white.withAlpha(5) : Colors.black.withAlpha(2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: color.withAlpha(30))),
          child: ListTile(
            leading: Icon(
              issue.severity == IssueSeverity.error ? Icons.error_rounded : Icons.warning_rounded,
              color: color,
            ),
            title: Text(issue.message, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500)),
            trailing: issue.elementId != null ? const Icon(Icons.chevron_right_rounded) : null,
            onTap: issue.elementId != null ? () {
              provider.selectElement(issue.elementId!);
              Navigator.pop(context);
            } : null,
          ),
        );
      },
    );
  }
}
