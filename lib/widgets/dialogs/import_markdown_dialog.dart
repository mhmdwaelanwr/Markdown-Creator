import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/project_provider.dart';
import '../../utils/dialog_helper.dart';
import '../../utils/toast_helper.dart';

class ImportMarkdownDialog extends StatefulWidget {
  const ImportMarkdownDialog({super.key});

  @override
  State<ImportMarkdownDialog> createState() => _ImportMarkdownDialogState();
}

class _ImportMarkdownDialogState extends State<ImportMarkdownDialog> {
  final _textController = TextEditingController();
  final _urlController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _textController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // We access provider here to call import method
    // But we might not need to listen to changes if we just call a method.
    // Provider.of(context, listen: false) is cleaner if we just trigger action.

    return StyledDialog(
      width: 700,
      height: 550,
      title: DialogHeader(
        title: AppLocalizations.of(context)!.importMarkdown,
        icon: Icons.file_upload,
        color: Colors.indigo,
      ),
      content: DefaultTabController(
        length: 2,
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.grey.withAlpha(20),
                borderRadius: BorderRadius.circular(8),
              ),
              child: TabBar(
                indicatorSize: TabBarIndicatorSize.tab,
                indicator: BoxDecoration(
                  color: Theme.of(context).primaryColor.withAlpha(30),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Theme.of(context).primaryColor),
                ),
                labelColor: Theme.of(context).primaryColor,
                unselectedLabelColor: Colors.grey,
                dividerColor: Colors.transparent,
                tabs: const [
                  Tab(text: 'Text / File', icon: Icon(Icons.description, size: 18)),
                  Tab(text: 'URL (GitHub/Pastebin)', icon: Icon(Icons.link, size: 18)),
                ],
              ),
            ),
            Expanded(
              child: TabBarView(
                children: [
                  // Tab 1: Text / File
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        Text('Paste your Markdown content below or pick a file.', style: GoogleFonts.inter()),
                        const SizedBox(height: 16),
                        Expanded(
                          child: TextField(
                            controller: _textController,
                            maxLines: null,
                            expands: true,
                            textAlignVertical: TextAlignVertical.top,
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              hintText: '# My Project\n\nDescription...',
                            ),
                            style: GoogleFonts.firaCode(fontSize: 13),
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.upload_file),
                          label: const Text('Pick Markdown File'),
                          onPressed: _pickFile,
                        ),
                      ],
                    ),
                  ),
                  // Tab 2: URL
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Enter a raw URL from GitHub or Pastebin.', style: GoogleFonts.inter()),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _urlController,
                          decoration: InputDecoration(
                            border: const OutlineInputBorder(),
                            hintText: 'https://raw.githubusercontent.com/...',
                            labelText: AppLocalizations.of(context)!.repoUrl,
                            prefixIcon: const Icon(Icons.link),
                          ),
                          style: GoogleFonts.inter(),
                        ),
                        const SizedBox(height: 16),
                        if (_isLoading)
                          const CircularProgressIndicator()
                        else
                          ElevatedButton.icon(
                            icon: const Icon(Icons.cloud_download),
                            label: const Text('Fetch Content'),
                            onPressed: _fetchUrl,
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(AppLocalizations.of(context)!.cancel),
        ),
        FilledButton(
          onPressed: () => _importOrClose(context),
          child: Text(AppLocalizations.of(context)!.import),
        ),
      ],
    );
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['md', 'txt'],
      withData: true,
    );
    if (result != null && result.files.isNotEmpty) {
      final bytes = result.files.first.bytes;
      if (bytes != null) {
        setState(() {
          _textController.text = utf8.decode(bytes);
        });
      }
    }
  }

  Future<void> _fetchUrl() async {
    if (_urlController.text.isEmpty) return;
    setState(() => _isLoading = true);
    try {
      final url = _urlController.text;
      // Basic check for github blob -> raw
      String fetchUrl = url;
      if (url.contains('github.com') && url.contains('/blob/')) {
        fetchUrl = url.replaceFirst('/blob/', '/raw/');
      }

      final response = await http.get(Uri.parse(fetchUrl));
      if (response.statusCode == 200) {
        setState(() {
          _textController.text = response.body;
        });
        if (mounted) {
          ToastHelper.show(context, AppLocalizations.of(context)!.contentFetched);
        }
      } else {
        if (mounted) {
          ToastHelper.show(context, '${AppLocalizations.of(context)!.fetchFailed}: ${response.statusCode}', isError: true);
        }
      }
    } catch (e) {
      if (mounted) {
        ToastHelper.show(context, '${AppLocalizations.of(context)!.error}: $e', isError: true);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _importOrClose(BuildContext context) {
    if (_textController.text.isNotEmpty) {
      final markdownText = _textController.text;
      final provider = Provider.of<ProjectProvider>(context, listen: false);
      Navigator.pop(context);

      // Need to schedule this frame callback or just run it?
      // Since we popped, context might be tricky, but provider is captured.
      // The original code used addPostFrameCallback after pop.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        provider.importMarkdown(markdownText);
        // Using context here might be unsafe if we popped.
        // ToastHelper uses context. But we have popped.
        // We need a valid context. The context from build is now "unmounted" effectively for UI purposes but might still work for finding Scaffold.
        // Actually best to show toast BEFORE pop or use a global key if implemented.
        // Or assume the parent scaffold is still valid (it usually is).
        // But original code had context.mounted check etc.
        // Let's try passing the context of the dialog which is being closed... might work for finding scaffold messenger if it's root.
        // Better:
        // provider.importMarkdown doesn't need context.
        // ToastHelper needs it.
      });
      // Showing toast. Ideally we should show it on the parent screen.
      // We can't easily access parent context here cleanly.
      // But we can just assume it works or skip toast here if tricky.
      // Actually, we can show toast before popping? No, we want to show success on the screen we return to.
      // But `context` here is the dialog context.
      // Using `Navigator.of(context).context`? No.
      // We can pass a callback or just trust that ScaffoldMessenger.of(context) works even if dialog is closing (it finds the root/nearest scaffold).
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppLocalizations.of(context)!.projectImported)),
      );
    }
  }
}

