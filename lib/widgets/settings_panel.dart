import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';
import '../models/readme_element.dart';
import '../providers/project_provider.dart';
import '../generator/markdown_generator.dart';
import 'element_settings_form.dart';

class SettingsPanel extends StatelessWidget {
  const SettingsPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return DefaultTabController(
      length: 2,
      child: Container(
        color: colorScheme.surface,
        child: Column(
          children: [
            const TabBar(
              tabs: [
                Tab(text: 'Settings'),
                Tab(text: 'Preview'),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _buildSettingsTab(context),
                  _buildPreviewTab(context),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsTab(BuildContext context) {
    final provider = Provider.of<ProjectProvider>(context);
    final element = provider.selectedElement;
    final colorScheme = Theme.of(context).colorScheme;

    if (element == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.tune, size: 48, color: colorScheme.primary.withAlpha(100)),
            const SizedBox(height: 16),
            Text(
              'Select an element to edit',
              style: TextStyle(color: colorScheme.onSurface.withAlpha(150)),
            ),
          ],
        ),
      );
    }

    // Use Key to force rebuild when selection changes
    return ListView(
      key: ValueKey(element.id),
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: colorScheme.primaryContainer.withAlpha(50),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: colorScheme.primary.withAlpha(50)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Edit ${element.description}',
                style: TextStyle(fontWeight: FontWeight.bold, color: colorScheme.primary),
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_upward),
                    onPressed: () => _moveElement(provider, element, -1),
                    tooltip: 'Move Up',
                    iconSize: 20,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.arrow_downward),
                    onPressed: () => _moveElement(provider, element, 1),
                    tooltip: 'Move Down',
                    iconSize: 20,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ElementSettingsForm(element: element),
      ],
    );
  }

  void _moveElement(ProjectProvider provider, ReadmeElement element, int direction) {
    final index = provider.elements.indexOf(element);
    if (index == -1) return;

    final newIndex = index + direction;
    if (newIndex >= 0 && newIndex < provider.elements.length) {
      // reorderElements expects oldIndex and newIndex logic similar to ReorderableListView
      // But here we can just swap manually or use reorderElements
      // reorderElements(old, new) logic: if old < new, new -= 1.
      // If moving down: index -> index + 1. old < new. newIndex passed should be index + 2?
      // Let's just swap in the list if we had access, but provider only exposes reorderElements.

      // If moving down (direction 1): old=index, target=index+1.
      // reorderElements(index, index + 2) -> newIndex -= 1 -> index + 1. Correct.

      // If moving up (direction -1): old=index, target=index-1.
      // reorderElements(index, index - 1) -> old > new -> no adjustment. Correct.

      if (direction == 1) {
         provider.reorderElements(index, index + 2);
      } else {
         provider.reorderElements(index, index - 1 + 1); // index.
      }
    }
  }

  Widget _buildPreviewTab(BuildContext context) {
    final provider = Provider.of<ProjectProvider>(context);
    final generator = MarkdownGenerator();
    final markdown = generator.generate(provider.elements);
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Stack(
      children: [
        Container(
          width: double.infinity,
          height: double.infinity,
          padding: const EdgeInsets.all(16),
          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC), // Slate 900 / Slate 50
          child: SingleChildScrollView(
            child: SelectableText(
              markdown,
              style: TextStyle(
                fontFamily: 'monospace',
                color: colorScheme.onSurface,
                fontSize: 13,
              ),
            ),
          ),
        ),
        Positioned(
          top: 16,
          right: 16,
          child: FloatingActionButton.small(
            tooltip: 'Copy to Clipboard',
            onPressed: () {
              Clipboard.setData(ClipboardData(text: markdown));
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied to clipboard')));
            },
            child: const Icon(Icons.copy),
          ),
        ),
      ],
    );
  }
}
