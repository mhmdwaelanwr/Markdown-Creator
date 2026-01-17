import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:provider/provider.dart';
import '../../providers/project_provider.dart';
import '../../services/github_publisher_service.dart';
import '../../generator/markdown_generator.dart';
import '../../utils/dialog_helper.dart';
import '../../utils/toast_helper.dart';

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
    // Initialize token controller with value from provider
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
    return StyledDialog(
      title: const DialogHeader(
        title: 'Publish to GitHub',
        icon: Icons.cloud_upload,
        color: Colors.teal,
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Create a Pull Request with your new README.',
              style: GoogleFonts.inter(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            _buildAuthenticationSection(),
            const SizedBox(height: 24),
            _buildRepositorySection(),
            const SizedBox(height: 16),
            TextField(
              controller: _branchController,
              decoration: const InputDecoration(
                labelText: 'Branch Name',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.source),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _messageController,
              decoration: const InputDecoration(
                labelText: 'Commit Message',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.message),
              ),
            ),
            if (_isLoading) _buildLoadingIndicator(),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton.icon(
          icon: const Icon(Icons.send),
          label: const Text('Create PR'),
          onPressed: _isLoading ? null : () => _publish(context),
        ),
      ],
    );
  }

  Widget _buildAuthenticationSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Authentication', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        TextField(
          controller: _tokenController,
          obscureText: _isTokenObscured,
          decoration: InputDecoration(
            labelText: 'GitHub Personal Access Token',
            border: const OutlineInputBorder(),
            prefixIcon: const Icon(Icons.key),
            suffixIcon: IconButton(
              icon: Icon(_isTokenObscured ? Icons.visibility : Icons.visibility_off),
              onPressed: () => setState(() => _isTokenObscured = !_isTokenObscured),
            ),
            helperText: 'Required to create Pull Request',
          ),
        ),
      ],
    );
  }

  Widget _buildRepositorySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Repository Details', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _ownerController,
                decoration: const InputDecoration(
                  labelText: 'Owner',
                  border: OutlineInputBorder(),
                  hintText: 'user or org',
                  prefixIcon: Icon(Icons.person),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: TextField(
                controller: _repoController,
                decoration: const InputDecoration(
                  labelText: 'Repository',
                  border: OutlineInputBorder(),
                  hintText: 'repo-name',
                  prefixIcon: Icon(Icons.folder),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLoadingIndicator() {
    return Column(
      children: [
        const SizedBox(height: 24),
        Center(
          child: Column(
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 8),
              Text('Publishing...', style: GoogleFonts.inter(fontSize: 12, color: Colors.grey)),
            ],
          ),
        ),
      ],
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
    // Save token
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
      showSafeDialog(
        context,
        builder: (context) => AlertDialog(
          title: const Text('Success!'),
          content: const Text('Pull Request created successfully.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
            ElevatedButton(
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
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ToastHelper.show(context, 'Error: $e', isError: true);
    }
  }
}
