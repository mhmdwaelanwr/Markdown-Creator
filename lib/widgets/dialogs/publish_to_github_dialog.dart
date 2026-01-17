import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:provider/provider.dart';
import '../../providers/project_provider.dart';
import '../../services/github_publisher_service.dart';
import '../../generator/markdown_generator.dart';
import '../../utils/dialog_helper.dart';
import '../../utils/toast_helper.dart';
import '../../core/constants/app_colors.dart';

class PublishToGitHubDialog extends StatefulWidget {
  const PublishToGitHubDialog({super.key});

  @override
  State<PublishToGitHubDialog> createState() => _PublishToGitHubDialogState();
}

class _PublishToGitHubDialogState extends State<PublishToGitHubDialog> {
  final _ownerController = TextEditingController();
  final _repoController = TextEditingController();
  final _branchController = TextEditingController(text: 'docs/update-readme');
  final _messageController = TextEditingController(text: 'docs: update README.md via Readme Creator');
  late TextEditingController _tokenController;
  bool _isLoading = false;
  bool _isTokenObscured = true;

  @override
  void initState() {
    super.initState();
    final provider = Provider.of<ProjectProvider>(context, listen: false);
    _tokenController = TextEditingController(text: provider.githubToken);
  }

  @override
  void dispose() {
    _ownerController.dispose();
    _repoController.dispose();
    _branchController.dispose();
    _messageController.dispose();
    _tokenController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return StyledDialog(
      title: const DialogHeader(
        title: 'Publish to GitHub',
        icon: Icons.cloud_upload_rounded,
        color: Colors.teal,
      ),
      width: 600,
      height: 650,
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildInfoBox('This will create a new branch and open a Pull Request with your generated README.md directly on GitHub.', isDark),
            const SizedBox(height: 24),
            _buildSectionTitle('AUTHENTICATION'),
            const SizedBox(height: 12),
            _buildTextField(
              controller: _tokenController,
              label: 'Personal Access Token',
              icon: Icons.key_rounded,
              isDark: isDark,
              obscureText: _isTokenObscured,
              suffix: IconButton(
                icon: Icon(_isTokenObscured ? Icons.visibility_rounded : Icons.visibility_off_rounded, size: 20),
                onPressed: () => setState(() => _isTokenObscured = !_isTokenObscured),
              ),
              helper: 'Need a token? Generate one in GitHub settings with "repo" scope.',
            ),
            const SizedBox(height: 24),
            _buildSectionTitle('REPOSITORY DETAILS'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildTextField(
                    controller: _ownerController,
                    label: 'Owner',
                    icon: Icons.person_rounded,
                    isDark: isDark,
                    hint: 'user or org',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextField(
                    controller: _repoController,
                    label: 'Repository',
                    icon: Icons.folder_rounded,
                    isDark: isDark,
                    hint: 'repo-name',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _branchController,
              label: 'New Branch Name',
              icon: Icons.account_tree_rounded,
              isDark: isDark,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _messageController,
              label: 'Commit Message',
              icon: Icons.message_rounded,
              isDark: isDark,
            ),
            if (_isLoading) ...[
              const SizedBox(height: 24),
              _buildLoadingIndicator(isDark),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
        ),
        _buildPublishButton(),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.5),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required bool isDark,
    String? hint,
    String? helper,
    bool obscureText = false,
    Widget? suffix,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          obscureText: obscureText,
          decoration: InputDecoration(
            labelText: label,
            hintText: hint,
            prefixIcon: Icon(icon, size: 20),
            suffixIcon: suffix,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            filled: true,
            fillColor: isDark ? Colors.white.withAlpha(5) : Colors.black.withAlpha(3),
          ),
          style: GoogleFonts.inter(fontSize: 14),
        ),
        if (helper != null)
          Padding(
            padding: const EdgeInsets.only(top: 6, left: 4),
            child: Text(helper, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey)),
          ),
      ],
    );
  }

  Widget _buildInfoBox(String text, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.teal.withAlpha(isDark ? 20 : 10),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.teal.withAlpha(30)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline_rounded, color: Colors.teal, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: GoogleFonts.inter(fontSize: 13, color: isDark ? Colors.white70 : Colors.black87))),
        ],
      ),
    );
  }

  Widget _buildPublishButton() {
    return FilledButton.icon(
      icon: _isLoading ? const SizedBox.shrink() : const Icon(Icons.rocket_launch_rounded, size: 18),
      label: Text(_isLoading ? 'Publishing...' : 'Create Pull Request'),
      onPressed: _isLoading ? null : () => _publish(context),
      style: FilledButton.styleFrom(
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Widget _buildLoadingIndicator(bool isDark) {
    return Center(
      child: Column(
        children: [
          const CircularProgressIndicator(strokeWidth: 3, color: Colors.teal),
          const SizedBox(height: 12),
          Text('Uploading to GitHub...', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: Colors.teal)),
        ],
      ),
    );
  }

  Future<void> _publish(BuildContext context) async {
    if (_tokenController.text.isEmpty) {
      ToastHelper.show(context, 'GitHub Token is required', isError: true);
      return;
    }
    if (_ownerController.text.isEmpty || _repoController.text.isEmpty) {
      ToastHelper.show(context, 'Owner and Repo are required', isError: true);
      return;
    }

    setState(() => _isLoading = true);
    final provider = Provider.of<ProjectProvider>(context, listen: false);
    provider.setGitHubToken(_tokenController.text.trim());

    try {
      final generator = MarkdownGenerator();
      final content = generator.generate(
        provider.elements,
        variables: provider.variables,
        listBullet: provider.listBullet,
        sectionSpacing: provider.sectionSpacing,
        targetLanguage: provider.targetLanguage,
      );

      final publisher = GitHubPublisherService(provider.githubToken);
      await publisher.publishReadme(
        owner: _ownerController.text.trim(),
        repo: _repoController.text.trim(),
        content: content,
        branchName: _branchController.text.trim(),
        commitMessage: _messageController.text.trim(),
      );

      if (!mounted) return;
      Navigator.pop(context);
      _showSuccessDialog(context);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ToastHelper.show(context, 'Error: $e', isError: true);
    }
  }

  void _showSuccessDialog(BuildContext context) {
    showSafeDialog(
      context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.green, size: 28),
            const SizedBox(width: 12),
            const Text('Success!'),
          ],
        ),
        content: const Text('Your Pull Request has been created successfully.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Awesome'),
          ),
          FilledButton(
            onPressed: () {
              final owner = _ownerController.text.trim();
              final repo = _repoController.text.trim();
              launchUrl(Uri.parse('https://github.com/$owner/$repo/pulls'));
            },
            child: const Text('View PRs'),
          ),
        ],
      ),
    );
  }
}
