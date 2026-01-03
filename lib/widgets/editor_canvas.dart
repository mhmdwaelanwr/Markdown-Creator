import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/readme_element.dart';
import '../models/snippet.dart';
import '../providers/project_provider.dart';
import 'canvas_item.dart';

class EditorCanvas extends StatelessWidget {
  const EditorCanvas({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ProjectProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    double maxWidth = 850;
    if (provider.deviceMode == DeviceMode.tablet) {
      maxWidth = 600;
    } else if (provider.deviceMode == DeviceMode.mobile) {
      maxWidth = 400;
    }

    return DragTarget<Object>(
      onWillAcceptWithDetails: (details) => details.data is ReadmeElementType || details.data is Snippet,
      onAcceptWithDetails: (details) {
        if (details.data is ReadmeElementType) {
          provider.addElement(details.data as ReadmeElementType);
        } else if (details.data is Snippet) {
          provider.addSnippet(details.data as Snippet);
        }
      },
      builder: (context, candidateData, rejectedData) {
        final colorScheme = Theme.of(context).colorScheme;
        return Container(
          color: candidateData.isNotEmpty
              ? colorScheme.primary.withAlpha(30)
              : (isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9)), // Slate 900 / Slate 100
          child: Stack(
            children: [
              if (provider.showGrid)
                Positioned.fill(
                  child: CustomPaint(
                    painter: GridPainter(isDark: isDark),
                  ),
                ),
              Center(
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  constraints: BoxConstraints(maxWidth: maxWidth),
                  child: GestureDetector(
                    onTap: () => provider.selectElement(''), // Deselect
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : Colors.white, // Slate 800 / White
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(isDark ? 100 : 20),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                        border: Border.all(
                          color: isDark ? Colors.white.withAlpha(10) : Colors.grey.withAlpha(20),
                        ),
                      ),
                      clipBehavior: Clip.hardEdge,
                      child: Stack(
                        children: [
                          if (provider.showGrid)
                            Positioned.fill(
                              child: CustomPaint(
                                painter: GridPainter(isDark: isDark),
                              ),
                            ),
                          provider.elements.isEmpty
                              ? _buildEmptyState(context)
                              : ReorderableListView.builder(
                                  padding: const EdgeInsets.all(32),
                                  itemCount: provider.elements.length,
                                  onReorder: provider.reorderElements,
                                  proxyDecorator: (child, index, animation) => _proxyDecorator(child, index, animation, isDark),
                                  itemBuilder: (context, index) {
                                    final element = provider.elements[index];
                                    final isSelected = element.id == provider.selectedElementId;

                                    return KeyedSubtree(
                                      key: ValueKey(element.id),
                                      child: CanvasItem(
                                        element: element,
                                        isSelected: isSelected,
                                      ),
                                    );
                                  },
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
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.drag_indicator, size: 64, color: colorScheme.primary.withAlpha(100)),
          const SizedBox(height: 16),
          Text(
            'Drag components here',
            style: TextStyle(
              fontSize: 18,
              color: colorScheme.onSurface.withAlpha(150),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Start building your README',
            style: TextStyle(
              fontSize: 14,
              color: colorScheme.onSurface.withAlpha(100),
            ),
          ),
        ],
      ),
    );
  }

  Widget _proxyDecorator(Widget child, int index, Animation<double> animation, bool isDark) {
    return AnimatedBuilder(
      animation: animation,
      builder: (BuildContext context, Widget? child) {
        final double animValue = Curves.easeInOut.transform(animation.value);
        final double elevation = lerpDouble(0, 6, animValue)!;
        return Material(
          elevation: elevation,
          color: isDark ? Colors.grey[800] : Colors.white,
          shadowColor: Colors.black.withAlpha(50),
          borderRadius: BorderRadius.circular(8),
          child: child,
        );
      },
      child: child,
    );
  }
}

class GridPainter extends CustomPainter {
  final bool isDark;

  GridPainter({required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = (isDark ? Colors.white : Colors.black).withAlpha(20)
      ..strokeWidth = 1;

    const double gridSize = 20.0;

    for (double x = 0; x < size.width; x += gridSize) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    for (double y = 0; y < size.height; y += gridSize) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
