import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/readme_element.dart';
import '../models/snippet.dart';
import '../providers/project_provider.dart';
import '../utils/templates.dart';
import 'canvas_item.dart';
import '../core/constants/app_colors.dart';
import '../utils/dialog_helper.dart';

class EditorCanvas extends StatelessWidget {
  const EditorCanvas({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ProjectProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    double maxWidth = 850;
    double deviceHeight = double.infinity;
    double borderRadius = 12;
    EdgeInsets canvasPadding = const EdgeInsets.all(32);

    if (provider.deviceMode == DeviceMode.tablet) {
      maxWidth = 600;
      deviceHeight = 800;
      borderRadius = 24;
    } else if (provider.deviceMode == DeviceMode.mobile) {
      maxWidth = 375;
      deviceHeight = 667;
      borderRadius = 32;
      canvasPadding = const EdgeInsets.all(16);
    }

    return CallbackShortcuts(
      bindings: {
        const SingleActivator(LogicalKeyboardKey.keyZ, control: true): () => provider.undo(),
        const SingleActivator(LogicalKeyboardKey.keyY, control: true): () => provider.redo(),
        const SingleActivator(LogicalKeyboardKey.delete): () {
          if (provider.selectedElementId != null) provider.removeElement(provider.selectedElementId!);
        },
      },
      child: Focus(
        autofocus: true,
        child: DragTarget<Object>(
          onWillAcceptWithDetails: (details) => details.data is ReadmeElementType || details.data is Snippet,
          onAcceptWithDetails: (details) {
            if (details.data is ReadmeElementType) {
              provider.addElement(details.data as ReadmeElementType);
            } else if (details.data is Snippet) {
              provider.addSnippet(details.data as Snippet);
            }
          },
          builder: (context, candidateData, rejectedData) {
            return Container(
              color: isDark ? AppColors.editorBackgroundDark : AppColors.editorBackgroundLight,
              child: Stack(
                children: [
                  // Improved Dotted Grid
                  if (provider.showGrid)
                    Positioned.fill(
                      child: CustomPaint(
                        painter: DottedGridPainter(isDark: isDark),
                      ),
                    ),

                  // Main Canvas Area
                  Center(
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(height: 80), // Space for floating toolbar
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 400),
                            curve: Curves.easeInOut,
                            constraints: BoxConstraints(
                              maxWidth: maxWidth,
                              minHeight: provider.deviceMode == DeviceMode.desktop ? 0 : deviceHeight,
                            ),
                            margin: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.canvasBackgroundDark : AppColors.canvasBackgroundLight,
                              borderRadius: BorderRadius.circular(borderRadius),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withAlpha(isDark ? 120 : 30),
                                  blurRadius: 40,
                                  offset: const Offset(0, 20),
                                ),
                              ],
                              border: Border.all(
                                color: isDark ? Colors.white.withAlpha(15) : Colors.grey.withAlpha(30),
                                width: provider.deviceMode == DeviceMode.desktop ? 1 : 8, // Thicker border for mobile/tablet frame
                              ),
                            ),
                            clipBehavior: Clip.hardEdge,
                            child: GestureDetector(
                              onTap: () => provider.selectElement(''),
                              child: provider.elements.isEmpty
                                  ? _buildEmptyState(context)
                                  : ReorderableListView.builder(
                                      shrinkWrap: true,
                                      physics: const NeverScrollableScrollPhysics(),
                                      padding: canvasPadding,
                                      itemCount: provider.elements.length,
                                      onReorder: provider.reorderElements,
                                      proxyDecorator: (child, index, animation) => _proxyDecorator(child, index, animation, isDark),
                                      itemBuilder: (context, index) {
                                        final element = provider.elements[index];
                                        return KeyedSubtree(
                                          key: ValueKey(element.id),
                                          child: DropZone(
                                            onDrop: (data) {
                                              if (data is ReadmeElementType) {
                                                provider.insertElement(index, data);
                                              } else if (data is Snippet) {
                                                provider.insertSnippet(index, data);
                                              }
                                            },
                                            child: CanvasItem(
                                              element: element,
                                              isSelected: element.id == provider.selectedElementId,
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                            ),
                          ),
                          const SizedBox(height: 80),
                        ],
                      ),
                    ),
                  ),

                  // Floating Glassmorphic Toolbar
                  Positioned(
                    top: 24,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: (isDark ? Colors.black : Colors.white).withOpacity(0.7),
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: (isDark ? Colors.white : Colors.black).withAlpha(20)),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withAlpha(20), blurRadius: 10),
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                _buildToolbarAction(Icons.undo_rounded, 'Undo', provider.undo),
                                _buildToolbarAction(Icons.redo_rounded, 'Redo', provider.redo),
                                const Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 8),
                                  child: SizedBox(height: 20, child: VerticalDivider(width: 1)),
                                ),
                                _buildToolbarAction(
                                  Icons.delete_sweep_rounded,
                                  'Delete Selected',
                                  provider.selectedElementId != null ? () => provider.removeElement(provider.selectedElementId!) : null,
                                  color: Colors.redAccent,
                                ),
                                const Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 8),
                                  child: SizedBox(height: 20, child: VerticalDivider(width: 1)),
                                ),
                                _buildToolbarAction(
                                  Icons.grid_4x4_rounded,
                                  'Toggle Grid',
                                  provider.toggleGrid,
                                  isActive: provider.showGrid,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Drag & Drop Indicator Overlay
                  if (candidateData.isNotEmpty)
                    IgnorePointer(
                      child: Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: Theme.of(context).primaryColor, width: 4),
                          color: Theme.of(context).primaryColor.withAlpha(20),
                        ),
                        child: Center(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                            decoration: BoxDecoration(
                              color: Theme.of(context).primaryColor,
                              borderRadius: BorderRadius.circular(40),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.add_circle_outline, color: Colors.white, size: 28),
                                SizedBox(width: 12),
                                Text(
                                  'Drop to add component',
                                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildToolbarAction(IconData icon, String tooltip, VoidCallback? onPressed, {Color? color, bool isActive = false}) {
    return Tooltip(
      message: tooltip,
      child: IconButton(
        icon: Icon(icon, size: 20),
        onPressed: onPressed,
        color: isActive ? Colors.blue : color,
        style: IconButton.styleFrom(
          hoverColor: Colors.blue.withAlpha(30),
          padding: const EdgeInsets.all(10),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final provider = Provider.of<ProjectProvider>(context, listen: false);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 100),
      child: Center(
        child: Column(
          children: [
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: 1),
              duration: const Duration(seconds: 1),
              builder: (context, value, child) {
                return Transform.scale(
                  scale: value,
                  child: Container(
                    padding: const EdgeInsets.all(40),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [colorScheme.primary, colorScheme.secondary],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(color: colorScheme.primary.withAlpha(100), blurRadius: 20, spreadRadius: 5),
                      ],
                    ),
                    child: const Icon(Icons.auto_awesome_mosaic_rounded, size: 80, color: Colors.white),
                  ),
                );
              },
            ),
            const SizedBox(height: 40),
            Text(
              'Your Masterpiece Starts Here',
              style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              'Select a template or drag a component from the left panel\nto begin crafting your professional README.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 16, color: Colors.grey, height: 1.5),
            ),
            const SizedBox(height: 48),
            FilledButton.icon(
              icon: const Icon(Icons.rocket_launch_rounded),
              label: const Text('Browse Quick Templates'),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () => _showTemplatesDialog(context, provider),
            ),
          ],
        ),
      ),
    );
  }

  void _showTemplatesDialog(BuildContext context, ProjectProvider provider) {
    showSafeDialog(
      context,
      builder: (context) => AlertDialog(
        title: Text('Quick Templates', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        content: SizedBox(
          width: 600,
          child: GridView.builder(
            shrinkWrap: true,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.4,
            ),
            itemCount: Templates.all.length,
            itemBuilder: (context, index) {
              final template = Templates.all[index];
              return InkWell(
                onTap: () {
                  provider.loadTemplate(template);
                  Navigator.pop(context);
                },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.withAlpha(50)),
                    color: Theme.of(context).colorScheme.surface,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.description_rounded, color: Colors.blue),
                      const Spacer(),
                      Text(template.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text(template.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _proxyDecorator(Widget child, int index, Animation<double> animation, bool isDark) {
    return AnimatedBuilder(
      animation: animation,
      builder: (BuildContext context, Widget? child) {
        return Material(
          elevation: 10,
          color: isDark ? Colors.grey[850] : Colors.white,
          borderRadius: BorderRadius.circular(12),
          child: child,
        );
      },
      child: child,
    );
  }
}

class DottedGridPainter extends CustomPainter {
  final bool isDark;
  DottedGridPainter({required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = isDark ? Colors.white.withAlpha(40) : Colors.black.withAlpha(20)
      ..strokeWidth = 1.5;

    const double gap = 30.0;
    for (double x = 0; x < size.width; x += gap) {
      for (double y = 0; y < size.height; y += gap) {
        canvas.drawCircle(Offset(x, y), 1, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant DottedGridPainter oldDelegate) => oldDelegate.isDark != isDark;
}

class DropZone extends StatefulWidget {
  final Widget child;
  final Function(Object data) onDrop;
  const DropZone({super.key, required this.child, required this.onDrop});
  @override
  State<DropZone> createState() => _DropZoneState();
}

class _DropZoneState extends State<DropZone> {
  bool _isHovered = false;
  @override
  Widget build(BuildContext context) {
    return DragTarget<Object>(
      onWillAcceptWithDetails: (details) {
        final accepts = details.data is ReadmeElementType || details.data is Snippet;
        if (accepts) setState(() => _isHovered = true);
        return accepts;
      },
      onLeave: (_) => setState(() => _isHovered = false),
      onAcceptWithDetails: (details) {
        setState(() => _isHovered = false);
        widget.onDrop(details.data);
      },
      builder: (context, candidateData, rejectedData) {
        return Column(
          children: [
            if (_isHovered)
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                height: 6,
                margin: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  borderRadius: BorderRadius.circular(3),
                  boxShadow: [BoxShadow(color: Theme.of(context).primaryColor.withAlpha(100), blurRadius: 10)],
                ),
              ),
            widget.child,
          ],
        );
      },
    );
  }
}
