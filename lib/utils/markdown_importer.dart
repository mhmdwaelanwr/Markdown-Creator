import 'package:markdown/markdown.dart' as md;
import '../models/readme_element.dart';

class MarkdownImporter {
  List<ReadmeElement> parse(String markdown) {
    final List<ReadmeElement> elements = [];
    final document = md.Document(
      extensionSet: md.ExtensionSet.gitHubWeb,
      encodeHtml: false,
    );

    // We parse lines to blocks
    final nodes = document.parseLines(markdown.split('\n'));

    for (final node in nodes) {
      if (node is md.Element) {
        _parseElement(node, elements);
      } else if (node is md.Text) {
        // Top level text, treat as paragraph
        elements.add(ParagraphElement(text: node.text));
      }
    }

    return elements;
  }

  void _parseElement(md.Element node, List<ReadmeElement> elements) {
    switch (node.tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        final level = int.tryParse(node.tag.substring(1)) ?? 1;
        // Extract text content
        final text = node.textContent;
        elements.add(HeadingElement(text: text, level: level));
        break;

      case 'p':
        // Check if it's an image wrapped in paragraph (common in markdown)
        if (node.children != null &&
            node.children!.length == 1 &&
            node.children!.first is md.Element &&
            (node.children!.first as md.Element).tag == 'img') {
          _parseImage(node.children!.first as md.Element, elements);
        } else {
          // Regular paragraph
          // We want to preserve some formatting like bold/italic if possible,
          // but our ParagraphElement currently just takes a String.
          // The renderer handles markdown syntax in the string.
          // So we should try to reconstruct the markdown string for this paragraph?
          // Or just take textContent? textContent strips formatting.
          // Ideally we want the raw markdown for this block.
          // Since we are parsing AST, we lose the raw markdown unless we reconstruct it.
          // Reconstructing markdown from AST is hard.
          // Alternative: Use the AST to build the string with markers.
          // For now, let's use textContent, but this is lossy.
          // BETTER APPROACH:
          // Since our ParagraphElement supports markdown syntax (bold, italic),
          // we should try to keep it.
          // However, the `markdown` package parses it out.
          // Let's try to reconstruct basic formatting.
          final text = _reconstructMarkdown(node.children);
          elements.add(ParagraphElement(text: text));
        }
        break;

      case 'img':
        _parseImage(node, elements);
        break;

      case 'pre':
        // Code block
        // Usually <pre><code>...</code></pre>
        if (node.children != null && node.children!.isNotEmpty) {
          final codeNode = node.children!.first;
          if (codeNode is md.Element && codeNode.tag == 'code') {
            final code = codeNode.textContent;
            // Language class is usually "language-dart"
            String language = '';
            if (codeNode.attributes['class'] != null) {
              language = codeNode.attributes['class']!.replaceAll('language-', '');
            }
            elements.add(CodeBlockElement(code: code, language: language));
          }
        }
        break;

      case 'ul':
      case 'ol':
        final isOrdered = node.tag == 'ol';
        final items = <String>[];
        if (node.children != null) {
          for (final child in node.children!) {
            if (child is md.Element && child.tag == 'li') {
              items.add(_reconstructMarkdown(child.children));
            }
          }
        }
        elements.add(ListElement(items: items, isOrdered: isOrdered));
        break;

      case 'table':
        _parseTable(node, elements);
        break;

      case 'blockquote':
         // Treat as paragraph with > prefix? Or just paragraph.
         final text = _reconstructMarkdown(node.children);
         elements.add(ParagraphElement(text: '> $text'));
         break;

      default:
        // Fallback
        // elements.add(ParagraphElement(text: node.textContent));
        break;
    }
  }

  void _parseImage(md.Element node, List<ReadmeElement> elements) {
    final src = node.attributes['src'] ?? '';
    final alt = node.attributes['alt'] ?? '';
    // Check if it's a badge (often linked)
    // But here we just have img.
    // If it was wrapped in <a>, the parent would be <p><a><img></a></p> or just <a><img></a>
    // The parser might handle this differently.
    // For now, simple image.
    elements.add(ImageElement(url: src, altText: alt));
  }

  void _parseTable(md.Element node, List<ReadmeElement> elements) {
    // Table parsing logic
    // <thead> <tr> <th>...
    // <tbody> <tr> <td>...
    final headers = <String>[];
    final rows = <List<String>>[];
    final alignments = <ColumnAlignment>[];

    if (node.children == null) return;

    for (final child in node.children!) {
      if (child is md.Element) {
        if (child.tag == 'thead') {
          if (child.children != null) {
            for (final row in child.children!) {
              if (row is md.Element && row.tag == 'tr') {
                if (row.children != null) {
                  for (final cell in row.children!) {
                    if (cell is md.Element && cell.tag == 'th') {
                      headers.add(cell.textContent);
                      // Check alignment style if present (markdown package might not expose it easily in AST attributes for GFM tables)
                      // Default to left
                      alignments.add(ColumnAlignment.left);
                    }
                  }
                }
              }
            }
          }
        } else if (child.tag == 'tbody') {
          if (child.children != null) {
            for (final row in child.children!) {
              if (row is md.Element && row.tag == 'tr') {
                final rowData = <String>[];
                if (row.children != null) {
                  for (final cell in row.children!) {
                    if (cell is md.Element && cell.tag == 'td') {
                      rowData.add(cell.textContent);
                    }
                  }
                }
                rows.add(rowData);
              }
            }
          }
        }
      }
    }

    if (headers.isNotEmpty) {
      elements.add(TableElement(headers: headers, rows: rows, alignments: alignments));
    }
  }

  String _reconstructMarkdown(List<md.Node>? nodes) {
    if (nodes == null) return '';
    final buffer = StringBuffer();
    for (final node in nodes) {
      if (node is md.Text) {
        buffer.write(node.text);
      } else if (node is md.Element) {
        if (node.tag == 'strong') {
          buffer.write('**${_reconstructMarkdown(node.children)}**');
        } else if (node.tag == 'em') {
          buffer.write('*${_reconstructMarkdown(node.children)}*');
        } else if (node.tag == 'code') {
          buffer.write('`${node.textContent}`');
        } else if (node.tag == 'a') {
          final href = node.attributes['href'] ?? '';
          buffer.write('[${_reconstructMarkdown(node.children)}]($href)');
        } else if (node.tag == 'img') {
           final src = node.attributes['src'] ?? '';
           final alt = node.attributes['alt'] ?? '';
           buffer.write('![$alt]($src)');
        } else {
          buffer.write(_reconstructMarkdown(node.children));
        }
      }
    }
    return buffer.toString();
  }
}

