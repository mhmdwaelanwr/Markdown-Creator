import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

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
    return Scaffold(
      appBar: AppBar(
        title: const Text('GitHub Actions Generator'),
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
                const Text('Triggers', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                SwitchListTile(
                  title: const Text('Schedule (Cron)'),
                  value: _scheduleEnabled,
                  onChanged: (v) => setState(() => _scheduleEnabled = v),
                ),
                if (_scheduleEnabled)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: TextFormField(
                      initialValue: _cronSchedule,
                      decoration: const InputDecoration(labelText: 'Cron Expression'),
                      onChanged: (v) => setState(() => _cronSchedule = v),
                    ),
                  ),
                SwitchListTile(
                  title: const Text('On Push (main/master)'),
                  value: _pushEnabled,
                  onChanged: (v) => setState(() => _pushEnabled = v),
                ),
                SwitchListTile(
                  title: const Text('Manual Trigger (workflow_dispatch)'),
                  value: _workflowDispatchEnabled,
                  onChanged: (v) => setState(() => _workflowDispatchEnabled = v),
                ),
                const Divider(),
                const Text('Steps', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: TextFormField(
                      initialValue: _feedUrl,
                      decoration: const InputDecoration(labelText: 'RSS Feed URL'),
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
              color: const Color(0xFF1E1E1E),
              padding: const EdgeInsets.all(16),
              child: SingleChildScrollView(
                child: SelectableText(
                  _generateYaml(),
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    color: Color(0xFFD4D4D4),
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

