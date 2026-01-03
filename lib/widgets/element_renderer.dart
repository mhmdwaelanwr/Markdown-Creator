import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_highlight/flutter_highlight.dart';
import 'package:flutter_highlight/themes/github.dart';
import 'package:flutter_highlight/themes/dracula.dart';
import 'package:provider/provider.dart';
import '../models/readme_element.dart';
import '../providers/project_provider.dart';

class ElementRenderer extends StatelessWidget {
  final ReadmeElement element;

  const ElementRenderer({super.key, required this.element});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : Colors.black;

    if (element is HeadingElement) {
      final e = element as HeadingElement;
      TextStyle style;
      switch (e.level) {
        case 1:
          style = Theme.of(context).textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.bold, color: textColor) ?? TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: textColor);
          break;
        case 2:
          style = Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, color: textColor) ?? TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: textColor);
          break;
        case 3:
          style = Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: textColor) ?? TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: textColor);
          break;
        default:
          style = TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor);
      }
      return Text(e.text, style: style);
    } else if (element is ParagraphElement) {
      final e = element as ParagraphElement;
      return _buildRichText(e.text, textColor);
    } else if (element is ImageElement) {
      final e = element as ImageElement;
      if (e.localData != null) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Image.memory(
              e.localData!,
              width: e.width,
              errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image, size: 50),
            ),
            if (e.altText.isNotEmpty)
              Text(e.altText, style: const TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        );
      }
      if (e.url.isEmpty) return const Text('Empty Image URL', style: TextStyle(color: Colors.red));
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Image.network(
            e.url,
            width: e.width,
            errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image, size: 50),
          ),
          if (e.altText.isNotEmpty)
            Text(e.altText, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        ],
      );
    } else if (element is LinkButtonElement) {
      final e = element as LinkButtonElement;
      return ElevatedButton(
        onPressed: null, // Disabled in editor
        child: Text(e.text),
      );
    } else if (element is CodeBlockElement) {
      final e = element as CodeBlockElement;
      final isDark = Theme.of(context).brightness == Brightness.dark;

      return Container(
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: HighlightView(
            e.code,
            language: e.language.isEmpty ? 'plaintext' : e.language,
            theme: isDark ? draculaTheme : githubTheme,
            padding: const EdgeInsets.all(12),
            textStyle: const TextStyle(
              fontFamily: 'monospace',
              fontSize: 14,
            ),
          ),
        ),
      );
    } else if (element is ListElement) {
      final e = element as ListElement;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: e.items.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          final prefix = e.isOrdered ? '${index + 1}.' : '•';
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 2.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(width: 24, child: Text(prefix, style: TextStyle(fontWeight: FontWeight.bold, color: textColor))),
                Expanded(child: Text(item, style: TextStyle(color: textColor))),
              ],
            ),
          );
        }).toList(),
      );
    } else if (element is BadgeElement) {
      final e = element as BadgeElement;
      if (e.imageUrl.isEmpty) return const Text('Empty Badge URL', style: TextStyle(color: Colors.red));
      return Image.network(
        e.imageUrl,
        errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image),
      );
    } else if (element is IconElement) {
      final e = element as IconElement;
      if (e.url.isEmpty) return const Text('Empty Icon URL', style: TextStyle(color: Colors.red));
      return Column(
        children: [
          Image.network(
            e.url,
            width: e.size,
            height: e.size,
            errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image),
          ),
          Text(e.name, style: TextStyle(fontSize: 10, color: textColor.withAlpha(150))),
        ],
      );
    } else if (element is EmbedElement) {
      final e = element as EmbedElement;
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? Colors.grey[800] : Colors.grey[200],
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
        ),
        child: Column(
          children: [
            Icon(Icons.code, size: 40, color: isDark ? Colors.grey[500] : Colors.grey[600]),
            const SizedBox(height: 8),
            Text('Embed: ${e.typeName}', style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
            const SizedBox(height: 4),
            Text(e.url, style: TextStyle(color: textColor.withAlpha(180), fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 8),
            const Text('(Embeds are rendered as HTML in Markdown)', style: TextStyle(fontSize: 10, fontStyle: FontStyle.italic)),
          ],
        ),
      );
    } else if (element is GitHubStatsElement) {
      final e = element as GitHubStatsElement;
      if (e.repoName.isEmpty) return const Text('Enter Repo Name (user/repo)', style: TextStyle(color: Colors.red));

      return Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          if (e.showStars)
            Image.network('https://img.shields.io/github/stars/${e.repoName}?style=social', errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image)),
          if (e.showForks)
            Image.network('https://img.shields.io/github/forks/${e.repoName}?style=social', errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image)),
          if (e.showIssues)
            Image.network('https://img.shields.io/github/issues/${e.repoName}', errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image)),
          if (e.showLicense)
            Image.network('https://img.shields.io/github/license/${e.repoName}', errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image)),
        ],
      );
    } else if (element is ContributorsElement) {
      final e = element as ContributorsElement;
      if (e.repoName.isEmpty) return const Text('Enter Repo Name (user/repo)', style: TextStyle(color: Colors.red));

      // In editor, we just show a placeholder or maybe fetch if we want to be fancy.
      // For now, let's show a static representation to avoid too many API calls during editing.
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? Colors.grey[800] : Colors.grey[200],
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
        ),
        child: Column(
          children: [
            Icon(Icons.people, size: 40, color: isDark ? Colors.grey[500] : Colors.grey[600]),
            const SizedBox(height: 8),
            Text('Contributors: ${e.repoName}', style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: List.generate(5, (index) => CircleAvatar(
                radius: 16,
                backgroundColor: Colors.grey,
                child: Icon(Icons.person, size: 20, color: Colors.white),
              )),
            ),
            const SizedBox(height: 8),
            const Text('(Actual contributors will be fetched on export)', style: TextStyle(fontSize: 10, fontStyle: FontStyle.italic)),
          ],
        ),
      );
    } else if (element is TableElement) {
      final e = element as TableElement;
      // Ensure consistency between headers and row cells to prevent DataTable assertions
      final columnCount = e.headers.length;

      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          headingRowColor: WidgetStateProperty.all(isDark ? Colors.grey[800] : Colors.grey[200]),
          dataRowColor: WidgetStateProperty.all(isDark ? Colors.grey[900] : Colors.white),
          border: TableBorder.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
          columns: e.headers.map((h) => DataColumn(label: Text(h, style: TextStyle(fontWeight: FontWeight.bold, color: textColor)))).toList(),
          rows: e.rows.map((row) {
            // Pad row with empty strings if it has fewer cells than columns
            final cells = List<String>.from(row);
            while (cells.length < columnCount) {
              cells.add('');
            }
            // Truncate if it has more (though UI prevents this, data might be stale)
            if (cells.length > columnCount) {
              cells.length = columnCount;
            }

            return DataRow(
              cells: cells.asMap().entries.map((entry) {
                final index = entry.key;
                final cell = entry.value;
                Alignment alignment = Alignment.centerLeft;
                if (index < e.alignments.length) {
                   switch(e.alignments[index]) {
                     case ColumnAlignment.left: alignment = Alignment.centerLeft; break;
                     case ColumnAlignment.center: alignment = Alignment.center; break;
                     case ColumnAlignment.right: alignment = Alignment.centerRight; break;
                   }
                }
                return DataCell(
                  Container(
                    alignment: alignment,
                    width: double.infinity,
                    child: Text(cell, style: TextStyle(color: textColor)),
                  )
                );
              }).toList(),
            );
          }).toList(),
        ),
      );
    } else if (element is MermaidElement) {
      final e = element as MermaidElement;
      final base64Code = base64Encode(utf8.encode(e.code));
      final imageUrl = 'https://mermaid.ink/img/$base64Code';

      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey),
          borderRadius: BorderRadius.circular(8),
          color: Colors.white, // Mermaid usually needs white background
        ),
        child: Column(
          children: [
            Image.network(
              imageUrl,
              errorBuilder: (context, error, stackTrace) => const Column(
                children: [
                  Icon(Icons.broken_image, color: Colors.red),
                  SizedBox(height: 8),
                  Text('Failed to render diagram. Check your syntax.', style: TextStyle(color: Colors.red)),
                ],
              ),
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;
                return const Center(child: CircularProgressIndicator());
              },
            ),
          ],
        ),
      );
    } else if (element is TOCElement) {
      final e = element as TOCElement;
      final provider = Provider.of<ProjectProvider>(context);
      final headings = provider.elements.whereType<HeadingElement>().toList();

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.withAlpha(100)),
          borderRadius: BorderRadius.circular(8),
          color: isDark ? Colors.grey[850] : Colors.grey[50],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(e.title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: textColor)),
            const SizedBox(height: 8),
            if (headings.isEmpty)
              const Text('No headings found.', style: TextStyle(color: Colors.grey)),
            ...headings.map((h) {
              return Padding(
                padding: EdgeInsets.only(left: (h.level - 1) * 16.0, bottom: 4),
                child: Row(
                  children: [
                    const Icon(Icons.link, size: 14, color: Colors.blue),
                    const SizedBox(width: 4),
                    Text(h.text, style: const TextStyle(color: Colors.blue, decoration: TextDecoration.underline)),
                  ],
                ),
              );
            }).toList(),
          ],
        ),
      );
    }
    return Text('Unknown Element: ${element.type}');
  }

  Widget _buildRichText(String text, Color textColor) {
    List<TextSpan> spans = [];
    final RegExp exp = RegExp(r'(\*\*(.*?)\*\*)|(\*(.*?)\*)|(`(.*?)`)');
    int start = 0;

    for (final match in exp.allMatches(text)) {
      if (match.start > start) {
        spans.add(TextSpan(text: text.substring(start, match.start), style: TextStyle(color: textColor)));
      }

      if (match.group(1) != null) { // Bold **text**
        spans.add(TextSpan(text: match.group(2), style: TextStyle(fontWeight: FontWeight.bold, color: textColor)));
      } else if (match.group(3) != null) { // Italic *text*
        spans.add(TextSpan(text: match.group(4), style: TextStyle(fontStyle: FontStyle.italic, color: textColor)));
      } else if (match.group(5) != null) { // Code `text`
        spans.add(TextSpan(
          text: match.group(6),
          style: TextStyle(
            fontFamily: 'monospace',
            backgroundColor: Colors.grey.withAlpha(50),
            color: textColor,
          ),
        ));
      }
      start = match.end;
    }

    if (start < text.length) {
      spans.add(TextSpan(text: text.substring(start), style: TextStyle(color: textColor)));
    }

    return RichText(text: TextSpan(children: spans));
  }
}

