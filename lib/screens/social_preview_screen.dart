import 'dart:ui' as ui;
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:io';
import '../providers/project_provider.dart';

class SocialPreviewScreen extends StatefulWidget {
  const SocialPreviewScreen({super.key});

  @override
  State<SocialPreviewScreen> createState() => _SocialPreviewScreenState();
}

class _SocialPreviewScreenState extends State<SocialPreviewScreen> {
  final GlobalKey _previewKey = GlobalKey();
  Color _backgroundColor = const Color(0xFF1A202C); // Dark GitHub-like
  Color _textColor = Colors.white;
  double _titleSize = 64;
  double _descSize = 32;
  bool _showBorder = true;

  Future<void> _exportImage() async {
    try {
      final boundary = _previewKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
      if (boundary == null) return;

      final image = await boundary.toImage(pixelRatio: 2.0); // High res
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData != null) {
        final pngBytes = byteData.buffer.asUint8List();
        // Use downloader util
        // We need to convert Uint8List to String for downloadJsonFile? No, that's for JSON.
        // We need a binary downloader.
        // Let's check utils/downloader.dart
        // It seems we only have downloadJsonFile.
        // I'll implement a simple download helper here or update downloader.dart.
        // For now, let's assume I can use a similar method or just implement it.
        // Actually, I should check downloader.dart first.
        // But I can't check it right now without interrupting flow.
        // I'll assume I need to implement binary download.
        // Wait, I can just use the same technique as downloadJsonFile but with bytes.
        // Let's check if I can import 'dart:html' if web, or use file_picker/path_provider if desktop.
        // Since this is a Flutter app, I should use a cross-platform way.
        // For now, I'll just use a placeholder or try to use the existing downloader if it supports bytes.
        // Let's just implement a quick save dialog for desktop.

        // Actually, I'll just use FilePicker to save.
        // But wait, FilePicker.saveFile is not available on all platforms easily in older versions.
        // Let's use the same approach as `ProjectExporter` if it saves files.
        // `ProjectExporter` likely uses `downloadJsonFile`.

        // Let's just use a simple method for now.
        // I'll add a method to `Downloader` class later if needed.
        // For now, I'll just print "Exported" to console and show snackbar,
        // but to be useful I need to save it.
        // I'll use `Printing` package to share/save? No, that's for PDF.
        // I'll use `file_picker` to save if possible, or just `File` write if desktop.

        // Let's try to use `file_picker`'s `saveFile` if available (it is in recent versions).
        // Or just `File` write.

        // Since I am on Windows, I can use `File`.
        // But I want it to be generic.
        // Let's use `FilePicker.platform.saveFile`.

        // Wait, `file_picker` 10.3.8 supports `saveFile`.

        /*
        String? outputFile = await FilePicker.platform.saveFile(
          dialogTitle: 'Save Social Preview',
          fileName: 'social-preview.png',
        );

        if (outputFile != null) {
           final file = File(outputFile);
           await file.writeAsBytes(pngBytes);
           if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Saved!')));
        }
        */
        // But I need `dart:io`.
        // I'll add imports.

        // For web support, I would need `dart:html`.
        // I'll stick to desktop for now as per environment.

        // Actually, let's just use a simple helper that I will add to `downloader.dart` later.
        // For now, I will implement `_saveImage` locally.
        _saveImage(pngBytes);
      }
    } catch (e) {
      debugPrint('Error exporting image: $e');
    }
  }

  Future<void> _saveImage(Uint8List bytes) async {
    String? outputFile = await FilePicker.platform.saveFile(
      dialogTitle: 'Save Social Preview',
      fileName: 'social-preview.png',
      type: FileType.image,
    );

    if (outputFile != null) {
      try {
        final file = File(outputFile);
        await file.writeAsBytes(bytes);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Image saved successfully!')));
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error saving image: $e')));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ProjectProvider>(context);
    final projectName = provider.variables['PROJECT_NAME'] ?? 'Project Name';
    final projectDesc = provider.variables['PROJECT_DESCRIPTION'] ?? 'A short description of your project.';

    return Scaffold(
      appBar: AppBar(
        title: Text('Social Preview Designer', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
        actions: [
          IconButton(
            icon: const Icon(Icons.download),
            tooltip: 'Export Image',
            onPressed: _exportImage,
          ),
        ],
      ),
      body: Row(
        children: [
          // Settings Panel
          Container(
            width: 300,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(right: BorderSide(color: Colors.grey.withAlpha(50))),
            ),
            child: ListView(
              children: [
                Text('Settings', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                ListTile(
                  title: const Text('Background Color'),
                  trailing: CircleAvatar(backgroundColor: _backgroundColor),
                  onTap: () => _pickColor(_backgroundColor, (c) => setState(() => _backgroundColor = c)),
                  contentPadding: EdgeInsets.zero,
                ),
                ListTile(
                  title: const Text('Text Color'),
                  trailing: CircleAvatar(backgroundColor: _textColor),
                  onTap: () => _pickColor(_textColor, (c) => setState(() => _textColor = c)),
                  contentPadding: EdgeInsets.zero,
                ),
                const Divider(),
                Text('Typography', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Text('Title Size'),
                    Expanded(
                      child: Slider(
                        value: _titleSize,
                        min: 24,
                        max: 120,
                        onChanged: (v) => setState(() => _titleSize = v),
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    const Text('Desc Size'),
                    Expanded(
                      child: Slider(
                        value: _descSize,
                        min: 12,
                        max: 60,
                        onChanged: (v) => setState(() => _descSize = v),
                      ),
                    ),
                  ],
                ),
                const Divider(),
                SwitchListTile(
                  title: const Text('Show Border'),
                  value: _showBorder,
                  onChanged: (v) => setState(() => _showBorder = v),
                  contentPadding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
          // Preview Area
          Expanded(
            child: Container(
              color: Colors.grey[200], // Canvas background
              child: Center(
                child: SingleChildScrollView(
                  child: RepaintBoundary(
                    key: _previewKey,
                    child: Container(
                      width: 1280,
                      height: 640,
                      decoration: BoxDecoration(
                        color: _backgroundColor,
                        border: _showBorder ? Border.all(color: Colors.white.withAlpha(50), width: 20) : null,
                      ),
                      child: Stack(
                        children: [
                          // Decorative elements
                          Positioned(
                            top: -100,
                            right: -100,
                            child: Container(
                              width: 400,
                              height: 400,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white.withAlpha(10),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: -50,
                            left: -50,
                            child: Container(
                              width: 300,
                              height: 300,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white.withAlpha(10),
                              ),
                            ),
                          ),
                          Center(
                            child: Padding(
                              padding: const EdgeInsets.all(64.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    projectName,
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.inter(
                                      fontSize: _titleSize,
                                      fontWeight: FontWeight.w800,
                                      color: _textColor,
                                      height: 1.1,
                                    ),
                                  ),
                                  const SizedBox(height: 32),
                                  Text(
                                    projectDesc,
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.inter(
                                      fontSize: _descSize,
                                      fontWeight: FontWeight.w400,
                                      color: _textColor.withAlpha(200),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _pickColor(Color initialColor, ValueChanged<Color> onColorPicked) {
    showDialog(
      context: context,
      builder: (context) {
        Color pickedColor = initialColor;
        return AlertDialog(
          title: const Text('Pick a color'),
          content: SingleChildScrollView(
            child: ColorPicker(
              pickerColor: initialColor,
              onColorChanged: (color) {
                pickedColor = color;
              },
              labelTypes: const [],
              pickerAreaHeightPercent: 0.7,
            ),
          ),
          actions: [
            TextButton(
              child: const Text('Cancel'),
              onPressed: () => Navigator.of(context).pop(),
            ),
            TextButton(
              child: const Text('Select'),
              onPressed: () {
                onColorPicked(pickedColor);
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }
}

