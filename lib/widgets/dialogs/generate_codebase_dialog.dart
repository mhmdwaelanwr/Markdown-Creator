import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/project_provider.dart';
import '../../services/ai_service.dart';
import '../../services/codebase_scanner_service.dart';
import '../../services/github_scanner_service.dart';
import '../../utils/toast_helper.dart';

class GenerateCodebaseDialog extends StatefulWidget {
  const GenerateCodebaseDialog({super.key});

  @override
  State<GenerateCodebaseDialog> createState() => _GenerateCodebaseDialogState();
}

class _GenerateCodebaseDialogState extends State<GenerateCodebaseDialog> {
  final _pathController = TextEditingController();
  final _repoUrlController = TextEditingController();
  bool _isLoading = false;
  String? _statusMessage;

  @override
  void dispose() {
    _pathController.dispose();
    _repoUrlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(
        AppLocalizations.of(context)!.generateFromCodebase,
        style: GoogleFonts.inter(fontWeight: FontWeight.bold),
      ),
      content: SizedBox(
        width: 500,
        child: DefaultTabController(
          length: 2,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const TabBar(
                labelColor: Colors.blue,
                tabs: [
                  Tab(text: 'Local Folder'),
                  Tab(text: 'GitHub Repo'),
                ],
              ),
              SizedBox(
                height: 200,
                child: TabBarView(
                  children: [
                    _buildLocalFolderTab(context),
                    _buildGitHubRepoTab(context),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Close'),
        ),
      ],
    );
  }

  Widget _buildLocalFolderTab(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          TextField(
            controller: _pathController,
            decoration: InputDecoration(
              labelText: 'Project Path',
              border: const OutlineInputBorder(),
              suffixIcon: IconButton(
                icon: const Icon(Icons.folder_open),
                onPressed: () async {
                  String? selectedDirectory = await FilePicker.platform.getDirectoryPath();
                  if (selectedDirectory != null) {
                    _pathController.text = selectedDirectory;
                  }
                },
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (_isLoading)
            _buildLoadingIndicator()
          else
            ElevatedButton.icon(
              icon: const Icon(Icons.auto_awesome),
              label: const Text('Generate README'),
              onPressed: () => _generateFromLocal(context),
            ),
        ],
      ),
    );
  }

  Widget _buildGitHubRepoTab(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          TextField(
            controller: _repoUrlController,
            decoration: const InputDecoration(
              labelText: 'GitHub Repository URL',
              border: OutlineInputBorder(),
              hintText: 'https://github.com/username/repo',
            ),
          ),
          const SizedBox(height: 16),
          if (_isLoading)
            _buildLoadingIndicator()
          else
            ElevatedButton.icon(
              icon: const Icon(Icons.auto_awesome),
              label: const Text('Generate README'),
              onPressed: () => _generateFromGitHub(context),
            ),
        ],
      ),
    );
  }

  Widget _buildLoadingIndicator() {
    return Column(
      children: [
        const CircularProgressIndicator(),
        const SizedBox(height: 8),
        Text(_statusMessage ?? 'Analyzing...', style: GoogleFonts.inter(fontSize: 12)),
      ],
    );
  }

  Future<void> _generateFromLocal(BuildContext context) async {
    if (_pathController.text.isEmpty) return;

    final provider = Provider.of<ProjectProvider>(context, listen: false);

    setState(() {
      _isLoading = true;
      _statusMessage = 'Scanning codebase...';
    });

    try {
      final structure = await CodebaseScannerService.scanDirectory(_pathController.text);

      if (!mounted) return;
      setState(() => _statusMessage = 'Generating content with AI...');

      final readmeContent = await AIService.generateReadmeFromStructure(
        structure,
        apiKey: provider.geminiApiKey,
      );

      if (!mounted) return;
      Navigator.pop(context);
      provider.importMarkdown(readmeContent);
      ToastHelper.show(context, 'README generated successfully!');
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ToastHelper.show(context, 'Error: $e', isError: true);
    }
  }

  Future<void> _generateFromGitHub(BuildContext context) async {
    if (_repoUrlController.text.isEmpty) return;

    final provider = Provider.of<ProjectProvider>(context, listen: false);

    setState(() {
      _isLoading = true;
      _statusMessage = 'Fetching repository...';
    });

    try {
      final githubScanner = GitHubScannerService();
      final structure = await githubScanner.scanRepo(_repoUrlController.text);

      if (!mounted) return;
      setState(() => _statusMessage = 'Generating content with AI...');

      final readmeContent = await AIService.generateReadmeFromStructure(
        structure,
        apiKey: provider.geminiApiKey,
      );

      if (!mounted) return;
      Navigator.pop(context);
      provider.importMarkdown(readmeContent);
      ToastHelper.show(context, 'README generated successfully!');
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ToastHelper.show(context, 'Error: $e', isError: true);
    }
  }
}
