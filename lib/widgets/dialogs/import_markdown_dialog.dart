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
import '../../core/constants/app_colors.dart';

class ImportMarkdownDialog extends StatefulWidget {
  const ImportMarkdownDialog({super.key});

  @override
  State<ImportMarkdownDialog> createState() => _ImportMarkdownDialogState();
}

class _ImportMarkdownDialogState extends State<ImportMarkdownDialog> with SingleTickerProviderStateMixin {
  final _textController = TextEditingController();
  final _urlController = TextEditingController();
  late TabController _tabController;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _textController.dispose();
    _urlController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return StyledDialog(
      width: 700,
      height: 600,
      title: DialogHeader(
        title: AppLocalizations.of(context)!.importMarkdown,
        icon: Icons.upload_file_rounded,
        color: Colors.indigo,
      ),
      contentPadding: EdgeInsets.zero,
      content: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withAlpha(10) : Colors.black.withAlpha(5),
                borderRadius: BorderRadius.circular(16),
              ),
              child: TabBar(
                controller: _tabController,
                labelColor: Colors.white,
                unselectedLabelColor: isDark ? Colors.white60 : Colors.black54,
                indicatorSize: TabBarIndicatorSize.tab,
                indicator: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Colors.indigo, Colors.indigoAccent],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                dividerColor: Colors.transparent,
                labelStyle: GoogleFonts.inter(fontWeight: FontWeight.bold),
                tabs: const [
                  Tab(text: 'Text / File'),
                  Tab(text: 'Fetch from URL'),
                ],
              ),
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildTextTab(isDark),
                _buildUrlTab(isDark),
              ],
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(AppLocalizations.of(context)!.cancel, style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: Colors.grey)),
        ),
        const SizedBox(width: 8),
        FilledButton.icon(
          onPressed: () => _importOrClose(context),
          icon: const Icon(Icons.check_circle_rounded, size: 18),
          label: Text(AppLocalizations.of(context)!.import, style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
          style: FilledButton.styleFrom(
            backgroundColor: Colors.indigo,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }

  Widget _buildTextTab(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.info_outline_rounded, size: 16, color: Colors.grey),
              const SizedBox(width: 8),
              Expanded(child: Text('Paste raw markdown or select a file.', style: GoogleFonts.inter(fontSize: 12, color: Colors.grey))),
              TextButton.icon(
                onPressed: _pickFile,
                icon: const Icon(Icons.folder_open_rounded, size: 18),
                label: const Text('Pick File'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Expanded(
            child: TextField(
              controller: _textController,
              maxLines: null,
              expands: true,
              textAlignVertical: TextAlignVertical.top,
              decoration: InputDecoration(
                hintText: '# My Awesome Project\n\nStarting writing here...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: isDark ? Colors.white.withAlpha(5) : Colors.black.withAlpha(2),
              ),
              style: GoogleFonts.firaCode(fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUrlTab(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.indigo.withAlpha(isDark ? 20 : 10),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.indigo.withAlpha(30)),
            ),
            child: Row(
              children: [
                const Icon(Icons.link_rounded, color: Colors.indigo),
                const SizedBox(width: 16),
                Expanded(child: Text('Import directly from a raw GitHub or Pastebin URL.', style: GoogleFonts.inter(fontSize: 13))),
              ],
            ),
          ),
          const SizedBox(height: 32),
          TextField(
            controller: _urlController,
            decoration: InputDecoration(
              labelText: AppLocalizations.of(context)!.repoUrl,
              hintText: 'https://raw.githubusercontent.com/...',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              prefixIcon: const Icon(Icons.public_rounded),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _fetchUrl,
              icon: _isLoading ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.cloud_download_rounded),
              label: Text(_isLoading ? 'Fetching...' : 'Download & Preview'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['md', 'txt'], withData: true);
    if (result != null && result.files.isNotEmpty) {
      final bytes = result.files.first.bytes;
      if (bytes != null) setState(() { _textController.text = utf8.decode(bytes); });
    }
  }

  Future<void> _fetchUrl() async {
    if (_urlController.text.isEmpty) return;
    setState(() => _isLoading = true);
    try {
      String fetchUrl = _urlController.text;
      if (fetchUrl.contains('github.com') && fetchUrl.contains('/blob/')) fetchUrl = fetchUrl.replaceFirst('/blob/', '/raw/');
      final response = await http.get(Uri.parse(fetchUrl));
      if (response.statusCode == 200) {
        setState(() { _textController.text = response.body; _tabController.animateTo(0); });
        if (mounted) ToastHelper.show(context, AppLocalizations.of(context)!.contentFetched);
      } else {
        if (mounted) ToastHelper.show(context, 'Failed: ${response.statusCode}', isError: true);
      }
    } catch (e) {
      if (mounted) ToastHelper.show(context, 'Error: $e', isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _importOrClose(BuildContext context) {
    if (_textController.text.isNotEmpty) {
      final markdownText = _textController.text;
      final provider = Provider.of<ProjectProvider>(context, listen: false);
      Navigator.pop(context);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        provider.importMarkdown(markdownText);
      });
      ToastHelper.show(context, AppLocalizations.of(context)!.projectImported);
    }
  }
}
