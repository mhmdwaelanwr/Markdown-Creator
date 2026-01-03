import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_highlight/flutter_highlight.dart';
import 'package:flutter_highlight/themes/github.dart';
import 'package:flutter_highlight/themes/dracula.dart';

class GitHubActionsGenerator extends StatefulWidget {
  const GitHubActionsGenerator({super.key});

  @override
  State<GitHubActionsGenerator> createState() => _GitHubActionsGeneratorState();
}

class _GitHubActionsGeneratorState extends State<GitHubActionsGenerator> {
  bool _scheduleEnabled = true;
  String _cronSchedule = '0 0 * * *'; // Daily at midnight
  bool _pushEnabled = true;
  bool _workflowDispatchEnabled = true;

  // Actions
  bool _checkout = true;
  bool _setupNode = false;
  bool _updateFeed = false;
  String _feedUrl = '';
  bool _commitChanges = true;

  String _generateYaml() {
    final buffer = StringBuffer();
    buffer.writeln('name: Update README');
    buffer.writeln();
    buffer.writeln('on:');
    if (_scheduleEnabled) {
      buffer.writeln('  schedule:');
      buffer.writeln('    - cron: "$_cronSchedule"');
    }
    if (_pushEnabled) {
      buffer.writeln('  push:');
      buffer.writeln('    branches: [ main, master ]');
    }
    if (_workflowDispatchEnabled) {
      buffer.writeln('  workflow_dispatch:');
    }
    buffer.writeln();
    buffer.writeln('jobs:');
    buffer.writeln('  build:');
    buffer.writeln('    runs-on: ubuntu-latest');
    buffer.writeln('    steps:');

    if (_checkout) {
      buffer.writeln('      - uses: actions/checkout@v3');
    }

    if (_setupNode) {
      buffer.writeln('      - uses: actions/setup-node@v3');
      buffer.writeln('        with:');
      buffer.writeln('          node-version: 16');
    }

    if (_updateFeed && _feedUrl.isNotEmpty) {
      // Example using a popular action for RSS
      buffer.writeln('      - name: Update Feed');
      buffer.writeln('        uses: sarisia/actions-readme-feed@v1');
      buffer.writeln('        with:');
      buffer.writeln('          url: "$_feedUrl"');
      buffer.writeln('          file: "README.md"');
    }

    if (_commitChanges) {
      buffer.writeln('      - name: Commit changes');
      buffer.writeln('        run: |');
      buffer.writeln('          git config --global user.name "GitHub Actions Bot"');
      buffer.writeln('          git config --global user.email "actions@github.com"');
      buffer.writeln('          git add README.md');
      buffer.writeln('          git commit -m "Update README" || exit 0');
      buffer.writeln('          git push');
    }

    return buffer.toString();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        title: Text('GitHub Actions Generator', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
        actions: [
          IconButton(
            icon: const Icon(Icons.copy),
            tooltip: 'Copy YAML',
            onPressed: () {
              Clipboard.setData(ClipboardData(text: _generateYaml()));
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied to clipboard')));
            },
          ),
        ],
      ),
      body: Row(
        children: [
          // Config
          Expanded(
            flex: 1,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text('Triggers', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                SwitchListTile(
                  title: const Text('Schedule (Cron)'),
                  value: _scheduleEnabled,
                  onChanged: (v) => setState(() => _scheduleEnabled = v),
                ),
                if (_scheduleEnabled)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: TextFormField(
                      initialValue: _cronSchedule,
                      decoration: const InputDecoration(
                        labelText: 'Cron Expression',
                        helperText: 'e.g. 0 0 * * * (Daily)',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (v) => setState(() => _cronSchedule = v),
                    ),
                  ),
                SwitchListTile(
                  title: const Text('On Push (main/master)'),
                  value: _pushEnabled,
                  onChanged: (v) => setState(() => _pushEnabled = v),
                ),
                SwitchListTile(
                  title: const Text('Workflow Dispatch (Manual)'),
                  value: _workflowDispatchEnabled,
                  onChanged: (v) => setState(() => _workflowDispatchEnabled = v),
                ),
                const Divider(height: 32),
                Text('Steps', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                CheckboxListTile(
                  title: const Text('Checkout Repository'),
                  value: _checkout,
                  onChanged: (v) => setState(() => _checkout = v ?? true),
                ),
                CheckboxListTile(
                  title: const Text('Setup Node.js'),
                  value: _setupNode,
                  onChanged: (v) => setState(() => _setupNode = v ?? false),
                ),
                CheckboxListTile(
                  title: const Text('Update RSS Feed'),
                  value: _updateFeed,
                  onChanged: (v) => setState(() => _updateFeed = v ?? false),
                ),
                if (_updateFeed)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: TextFormField(
                      initialValue: _feedUrl,
                      decoration: const InputDecoration(
                        labelText: 'RSS Feed URL',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (v) => setState(() => _feedUrl = v),
                    ),
                  ),
                CheckboxListTile(
                  title: const Text('Commit & Push Changes'),
                  value: _commitChanges,
                  onChanged: (v) => setState(() => _commitChanges = v ?? true),
                ),
              ],
            ),
          ),
          const VerticalDivider(width: 1),
          // Preview
          Expanded(
            flex: 1,
            child: Container(
              color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text('Preview: .github/workflows/readme.yml', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: HighlightView(
                        _generateYaml(),
                        language: 'yaml',
                        theme: isDark ? draculaTheme : githubTheme,
                        padding: const EdgeInsets.all(12),
                        textStyle: GoogleFonts.firaCode(fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
