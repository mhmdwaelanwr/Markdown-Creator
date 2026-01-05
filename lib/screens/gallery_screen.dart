import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../utils/templates.dart';
import '../providers/project_provider.dart';
import '../generator/markdown_generator.dart';

class GalleryScreen extends StatelessWidget {
  const GalleryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Readme Showcase', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
          maxCrossAxisExtent: 400,
          childAspectRatio: 0.8,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: Templates.all.length,
        itemBuilder: (context, index) {
          final template = Templates.all[index];
          return Card(
            clipBehavior: Clip.antiAlias,
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  child: Container(
                    color: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF0D1117) : Colors.white,
                    padding: const EdgeInsets.all(8),
                    child: AbsorbPointer( // Disable interaction in preview
                      child: Markdown(
                        data: MarkdownGenerator().generate(template.elements),
                        physics: const NeverScrollableScrollPhysics(),
                        shrinkWrap: true,
                        styleSheet: MarkdownStyleSheet.fromTheme(Theme.of(context)).copyWith(
                          p: GoogleFonts.inter(fontSize: 10),
                          h1: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold),
                          h2: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(template.name, style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 4),
                      Text(template.description, style: GoogleFonts.inter(fontSize: 12, color: Colors.grey), maxLines: 2, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () {
                          showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: Text('Use ${template.name}?', style: GoogleFonts.inter()),
                              content: const Text('This will replace your current workspace.'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context),
                                  child: const Text('Cancel'),
                                ),
                                TextButton(
                                  onPressed: () {
                                    Provider.of<ProjectProvider>(context, listen: false).loadTemplate(template);
                                    Navigator.pop(context); // Close dialog
                                    Navigator.pop(context); // Close gallery
                                  },
                                  child: const Text('Load Template'),
                                ),
                              ],
                            ),
                          );
                        },
                        child: const Text('Use Template'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

