import 'dart:ui';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/readme_element.dart';
import '../providers/library_provider.dart';
import '../providers/project_provider.dart';
import '../models/snippet.dart';
import '../core/constants/app_colors.dart';
import '../utils/dialog_helper.dart';

class ComponentsPanel extends StatefulWidget {
  const ComponentsPanel({super.key});

  @override
  State<ComponentsPanel> createState() => _ComponentsPanelState();
}

class _ComponentsPanelState extends State<ComponentsPanel> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Widget _buildFilteredSection(String title, List<ComponentItem> items, bool isDark) {
    final filteredItems = items.where((item) => item.label.toLowerCase().contains(_searchQuery)).toList();

    if (filteredItems.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_searchQuery.isEmpty) _buildSectionHeader(title, isDark),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.4,
          ),
          itemCount: filteredItems.length,
          itemBuilder: (context, index) {
            final item = filteredItems[index];
            return _buildDraggableItem(context, item.type, item.label, item.icon);
          },
        ),
        if (_searchQuery.isEmpty) const SizedBox(height: 24),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final libraryProvider = Provider.of<LibraryProvider>(context);
    final projectProvider = Provider.of<ProjectProvider>(context);

    final typographyItems = [
      ComponentItem(ReadmeElementType.heading, 'Heading', Icons.title_rounded),
      ComponentItem(ReadmeElementType.paragraph, 'Paragraph', Icons.text_fields_rounded),
      ComponentItem(ReadmeElementType.blockquote, 'Quote', Icons.format_quote_rounded),
      ComponentItem(ReadmeElementType.codeBlock, 'Code', Icons.code_rounded),
    ];

    final mediaItems = [
      ComponentItem(ReadmeElementType.image, 'Image', Icons.image_rounded),
      ComponentItem(ReadmeElementType.icon, 'Icon', Icons.emoji_emotions_rounded),
      ComponentItem(ReadmeElementType.linkButton, 'Button', Icons.link_rounded),
      ComponentItem(ReadmeElementType.badge, 'Badge', Icons.shield_rounded),
      ComponentItem(ReadmeElementType.socials, 'Socials', Icons.share_rounded),
      ComponentItem(ReadmeElementType.githubStats, 'Stats', Icons.bar_chart_rounded),
      ComponentItem(ReadmeElementType.contributors, 'People', Icons.people_rounded),
      ComponentItem(ReadmeElementType.dynamicWidget, 'Widget', Icons.extension_rounded),
    ];

    final structureItems = [
      ComponentItem(ReadmeElementType.list, 'List', Icons.list_rounded),
      ComponentItem(ReadmeElementType.table, 'Table', Icons.table_chart_rounded),
      ComponentItem(ReadmeElementType.divider, 'Divider', Icons.horizontal_rule_rounded),
      ComponentItem(ReadmeElementType.collapsible, 'Foldout', Icons.unfold_more_rounded),
    ];

    return DefaultTabController(
      length: 2,
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkBackground : AppColors.lightBackground,
          border: Border(right: BorderSide(color: isDark ? Colors.white.withAlpha(10) : Colors.black.withAlpha(5))),
        ),
        child: Column(
          children: [
            const SizedBox(height: 8),
            TabBar(
              labelColor: AppColors.primary,
              unselectedLabelColor: Colors.grey,
              indicatorColor: AppColors.primary,
              indicatorSize: TabBarIndicatorSize.label,
              labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13),
              tabs: const [
                Tab(text: 'Elements'),
                Tab(text: 'Snippets'),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search...',
                  prefixIcon: const Icon(Icons.search_rounded, size: 20),
                  filled: true,
                  fillColor: isDark ? Colors.white.withAlpha(5) : Colors.black.withAlpha(3),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: EdgeInsets.zero,
                ),
                style: GoogleFonts.inter(fontSize: 14),
              ),
            ),
            Expanded(
              child: TabBarView(
                children: [
                  // Elements Tab
                  ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      _buildFilteredSection('Typography', typographyItems, isDark),
                      _buildFilteredSection('Media & Graphics', mediaItems, isDark),
                      _buildFilteredSection('Structure', structureItems, isDark),
                      const SizedBox(height: 40),
                    ],
                  ),
                  // Snippets Tab
                  Column(
                    children: [
                      if (projectProvider.selectedElement != null)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                          child: SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () => _showSaveSnippetDialog(context, projectProvider.selectedElement!),
                              icon: const Icon(Icons.add_box_rounded),
                              label: const Text('Save Selected as Snippet'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary.withAlpha(30),
                                foregroundColor: AppColors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ),
                        ),
                      Expanded(child: _buildSnippetsTab(libraryProvider, isDark)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDraggableItem(BuildContext context, ReadmeElementType type, String label, IconData icon) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Draggable<ReadmeElementType>(
      data: type,
      feedback: Material(
        elevation: 12,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: 120,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: Colors.white, size: 24),
              const SizedBox(height: 4),
              Text(label, style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => Provider.of<ProjectProvider>(context, listen: false).addElement(type),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            decoration: BoxDecoration(
              color: isDark ? Colors.white.withAlpha(5) : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.withAlpha(30)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 22, color: AppColors.primary),
                const SizedBox(height: 6),
                Text(
                  label,
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0, left: 4),
      child: Text(
        title.toUpperCase(),
        style: GoogleFonts.inter(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: Colors.grey.withAlpha(180),
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildSnippetsTab(LibraryProvider libraryProvider, bool isDark) {
    if (libraryProvider.snippets.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.bookmark_border_rounded, size: 48, color: Colors.grey.withAlpha(100)),
            const SizedBox(height: 16),
            Text('No snippets yet', style: GoogleFonts.inter(color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: libraryProvider.snippets.length,
      itemBuilder: (context, index) {
        final snippet = libraryProvider.snippets[index];
        if (_searchQuery.isNotEmpty && !snippet.name.toLowerCase().contains(_searchQuery)) {
          return const SizedBox.shrink();
        }
        return _buildDraggableSnippet(context, libraryProvider, snippet, isDark);
      },
    );
  }

  Widget _buildDraggableSnippet(BuildContext context, LibraryProvider libraryProvider, Snippet snippet, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: Draggable<Snippet>(
        data: snippet,
        feedback: Material(
          elevation: 8,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(12)),
            child: Text(snippet.name, style: const TextStyle(color: Colors.white)),
          ),
        ),
        child: Card(
          margin: EdgeInsets.zero,
          color: isDark ? Colors.white.withAlpha(5) : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: AppColors.primary.withAlpha(40)),
          ),
          child: ListTile(
            dense: true,
            leading: const Icon(Icons.bookmark_rounded, color: AppColors.primary, size: 18),
            title: Text(snippet.name, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600)),
            trailing: IconButton(
              icon: const Icon(Icons.close_rounded, size: 16),
              onPressed: () => libraryProvider.deleteSnippet(snippet.id),
            ),
            onTap: () => Provider.of<ProjectProvider>(context, listen: false).addSnippet(snippet),
          ),
        ),
      ),
    );
  }

  void _showSaveSnippetDialog(BuildContext context, ReadmeElement element) {
    final nameController = TextEditingController(text: element.description);
    showSafeDialog(
      context,
      builder: (context) => AlertDialog(
        title: Text('Save as Snippet', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(
            labelText: 'Snippet Name',
            border: OutlineInputBorder(),
          ),
          style: GoogleFonts.inter(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (nameController.text.isNotEmpty) {
                Provider.of<LibraryProvider>(context, listen: false).saveSnippet(
                  name: nameController.text,
                  elementJson: jsonEncode(element.toJson()),
                );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Snippet saved!')));
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

class ComponentItem {
  final ReadmeElementType type;
  final String label;
  final IconData icon;
  ComponentItem(this.type, this.label, this.icon);
}
