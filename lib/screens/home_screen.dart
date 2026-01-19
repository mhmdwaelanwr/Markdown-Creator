import 'dart:convert';
import 'dart:ui';
import 'package:flutter/services.dart';
import 'package:markdown_creator/l10n/app_localizations.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import 'package:provider/provider.dart';
import 'package:pdf/pdf.dart';
import 'package:printing/printing.dart';
import 'package:markdown/markdown.dart' as md;

import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../models/readme_element.dart';
import '../widgets/components_panel.dart';
import '../widgets/editor_canvas.dart';
import '../widgets/settings_panel.dart';
import '../providers/project_provider.dart';
import '../services/preferences_service.dart';
import '../utils/templates.dart';
import '../utils/project_exporter.dart';
import '../utils/downloader.dart';
import '../utils/onboarding_helper.dart';
import 'projects_library_screen.dart';
import 'social_preview_screen.dart';
import 'github_actions_generator.dart';
import '../services/health_check_service.dart';
import '../services/auth_service.dart';
import '../services/ai_service.dart';

import '../utils/toast_helper.dart';
import '../widgets/developer_info_dialog.dart';
import '../utils/dialog_helper.dart';

import 'onboarding_screen.dart';
import 'gallery_screen.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../widgets/element_renderer.dart';
import 'funding_generator_screen.dart';
import '../generator/markdown_generator.dart';
import '../widgets/dialogs/project_settings_dialog.dart';
import '../widgets/dialogs/import_markdown_dialog.dart';
import '../widgets/dialogs/generate_codebase_dialog.dart';
import '../widgets/dialogs/publish_to_github_dialog.dart';
import '../widgets/dialogs/save_to_library_dialog.dart';
import '../widgets/dialogs/snapshots_dialog.dart';
import '../widgets/dialogs/health_check_dialog.dart';
import '../widgets/dialogs/keyboard_shortcuts_dialog.dart';
import '../widgets/dialogs/ai_settings_dialog.dart';
import '../widgets/dialogs/extra_files_dialog.dart';
import '../widgets/dialogs/language_dialog.dart';
import '../widgets/dialogs/confirm_dialog.dart';
import '../widgets/dialogs/about_app_dialog.dart';
import '../widgets/dialogs/login_dialog.dart';
import 'admin_dashboard_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final AuthService _authService = AuthService();
  bool _showPreview = false;
  bool _isFocusMode = false;

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width > 1200;
    final provider = Provider.of<ProjectProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      key: _scaffoldKey,
      extendBodyBehindAppBar: true,
      appBar: _buildModernAppBar(context, isDesktop, provider),
      drawer: isDesktop ? null : const Drawer(child: ComponentsPanel()),
      endDrawer: isDesktop ? null : const Drawer(child: SettingsPanel()),
      body: Stack(
        children: [
          _buildBackgroundEffects(context, isDark),
          Column(
            children: [
              const SizedBox(height: 70), 
              Expanded(
                child: Row(
                  children: [
                    if (isDesktop && !_isFocusMode) 
                      const Expanded(flex: 2, child: ComponentsPanel()),
                    
                    if (isDesktop && !_isFocusMode) VerticalDivider(width: 1, color: (isDark ? Colors.white : Colors.black).withOpacity(0.05)),
                    
                    Expanded(
                      flex: 6,
                      child: const EditorCanvas(),
                    ),
                    
                    if (_showPreview && isDesktop) ...[
                      VerticalDivider(width: 1, color: (isDark ? Colors.white : Colors.black).withOpacity(0.05)),
                      Expanded(
                        flex: 4,
                        child: _buildLiveMarkdownPreview(context, provider, isDark),
                      ),
                    ],
                    
                    if (isDesktop && !_isFocusMode) VerticalDivider(width: 1, color: (isDark ? Colors.white : Colors.black).withOpacity(0.05)),
                    
                    if (isDesktop && !_isFocusMode) 
                      const Expanded(flex: 3, child: SettingsPanel()),
                  ],
                ),
              ),
              _buildModernStatusBar(context, provider, isDark),
            ],
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildModernAppBar(BuildContext context, bool isDesktop, ProjectProvider provider) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      flexibleSpace: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
          child: Container(color: (isDark ? Colors.black : Colors.white).withOpacity(0.7)),
        ),
      ),
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.description_rounded, color: Colors.blueAccent, size: 24),
          const SizedBox(width: 10),
          Text('Markdown Creator', style: GoogleFonts.poppins(fontWeight: FontWeight.w800, fontSize: 17)),
        ],
      ),
      actions: [
        if (isDesktop) ..._buildFullDesktopActions(context, provider),
        if (!isDesktop) ...[
          IconButton(icon: const Icon(Icons.tune_rounded), onPressed: () => _scaffoldKey.currentState?.openEndDrawer()),
          _buildMoreOptionsButton(context),
        ]
      ],
    );
  }

  List<Widget> _buildFullDesktopActions(BuildContext context, ProjectProvider provider) {
    return [
      // 1. Undo/Redo
      _appBarIconButton(Icons.undo_rounded, 'Undo', provider.undo),
      _appBarIconButton(Icons.redo_rounded, 'Redo', provider.redo),
      _divider(),

      // 2. Device Modes
      _appBarIconButton(Icons.desktop_mac, 'Desktop', () => provider.setDeviceMode(DeviceMode.desktop), isActive: provider.deviceMode == DeviceMode.desktop),
      _appBarIconButton(Icons.tablet_mac, 'Tablet', () => provider.setDeviceMode(DeviceMode.tablet), isActive: provider.deviceMode == DeviceMode.tablet),
      _appBarIconButton(Icons.phone_iphone, 'Mobile', () => provider.setDeviceMode(DeviceMode.mobile), isActive: provider.deviceMode == DeviceMode.mobile),
      _divider(),

      // 3. Project Tools
      _appBarIconButton(Icons.file_copy_outlined, 'Templates', () => _showTemplatesMenu(context, provider)),
      _appBarIconButton(Icons.library_books_outlined, 'Library', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProjectsLibraryScreen()))),
      _appBarIconButton(Icons.health_and_safety_outlined, 'Health', () {
        final issues = HealthCheckService.analyze(provider.elements);
        _showHealthCheckDialog(context, issues, provider);
      }),
      _divider(),

      // 4. View Controls
      _appBarIconButton(_showPreview ? Icons.visibility : Icons.visibility_off, 'Preview', () => setState(() => _showPreview = !_showPreview), isActive: _showPreview),
      _appBarIconButton(_isFocusMode ? Icons.fullscreen_exit : Icons.fullscreen, 'Focus', () => setState(() => _isFocusMode = !_isFocusMode), isActive: _isFocusMode),
      
      const SizedBox(width: 8),
      _appBarButton(Icons.download_rounded, 'Export', () => _handleExport(provider), isPrimary: true),
      _buildMoreOptionsButton(context),
      const SizedBox(width: 8),
    ];
  }

  Widget _divider() => VerticalDivider(width: 20, indent: 15, endIndent: 15, color: Colors.grey.withOpacity(0.2));

  Widget _appBarIconButton(IconData icon, String tooltip, VoidCallback onTap, {bool isActive = false, Color? color}) {
    return IconButton(
      icon: Icon(icon, size: 20),
      tooltip: tooltip,
      onPressed: onTap,
      color: isActive ? Colors.blueAccent : color,
    );
  }

  Widget _appBarButton(IconData icon, String tooltip, VoidCallback onTap, {bool isPrimary = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Tooltip(
        message: tooltip,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
            decoration: BoxDecoration(
              color: isPrimary ? Colors.blueAccent : Colors.transparent,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(icon, size: 18, color: isPrimary ? Colors.white : null),
                if (isPrimary) ...[
                  const SizedBox(width: 8),
                  const Text('Export', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMoreOptionsButton(BuildContext context) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.more_vert_rounded),
      tooltip: 'More Options',
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      itemBuilder: (context) => [
        _buildMenuHeader('Project & Files'),
        _buildMenuItem(context, 'save', Icons.save_alt, 'Save to Library', color: Colors.blue),
        _buildMenuItem(context, 'import_md', Icons.file_upload, 'Import Markdown', color: Colors.blue),
        const PopupMenuDivider(),
        _buildMenuHeader('App Settings'),
        _buildMenuItem(context, 'ai', Icons.psychology, 'AI Magic Compose', color: Colors.purple),
        _buildMenuItem(context, 'lang', Icons.language, 'Change Language', color: Colors.grey),
      ],
      onSelected: (val) {
        final provider = Provider.of<ProjectProvider>(context, listen: false);
        if (val == 'save') _showSaveToLibraryDialog(context, provider);
        else if (val == 'ai') _showAISettingsDialog(context, provider);
        else if (val == 'lang') _showLanguageDialog(context, provider);
        else if (val == 'import_md') _showImportMarkdownDialog(context, provider);
      },
    );
  }

  PopupMenuItem<String> _buildMenuItem(BuildContext context, String value, IconData icon, String text, {Color? color}) {
    return PopupMenuItem<String>(
      value: value,
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 12),
          Text(text),
        ],
      ),
    );
  }

  PopupMenuItem<String> _buildMenuHeader(String title) {
    return PopupMenuItem<String>(
      enabled: false,
      child: Text(title.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
    );
  }

  Widget _buildBackgroundEffects(BuildContext context, bool isDark) {
    return Positioned.fill(
      child: Stack(
        children: [
          Positioned(top: -100, right: -50, child: Container(width: 300, height: 300, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.blueAccent.withOpacity(isDark ? 0.1 : 0.03)))),
          Positioned(bottom: -50, left: -50, child: Container(width: 400, height: 400, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.purpleAccent.withOpacity(0.08)))),
        ],
      ),
    );
  }

  Widget _buildLiveMarkdownPreview(BuildContext context, ProjectProvider provider, bool isDark) {
    final markdown = MarkdownGenerator().generate(provider.elements, variables: provider.variables);
    return Container(
      color: isDark ? const Color(0xFF0D1117) : Colors.white,
      padding: const EdgeInsets.all(24),
      child: Markdown(
        data: markdown,
        selectable: true,
        styleSheet: MarkdownStyleSheet.fromTheme(Theme.of(context)).copyWith(
          p: GoogleFonts.inter(height: 1.6, color: isDark ? const Color(0xFFC9D1D9) : const Color(0xFF24292F)),
          h1: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black),
        ),
      ),
    );
  }

  Widget _buildModernStatusBar(BuildContext context, ProjectProvider provider, bool isDark) {
    final score = AIService.calculateHealthScore(provider.elements);
    return Container(
      height: 32,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(color: isDark ? Colors.black45 : Colors.white70, border: Border(top: BorderSide(color: isDark ? Colors.white10 : Colors.black12))),
      child: Row(
        children: [
          _statusItem(Icons.widgets_outlined, '${provider.elements.length} Elements'),
          const SizedBox(width: 24),
          _statusItem(Icons.analytics_outlined, 'Quality Score: ${score.toInt()}/100', color: score > 70 ? Colors.green : Colors.orange),
          const Spacer(),
          _statusItem(Icons.cloud_done_outlined, 'Auto-saved', color: Colors.blueAccent),
        ],
      ),
    );
  }

  Widget _statusItem(IconData icon, String label, {Color? color}) {
    return Row(children: [Icon(icon, size: 14, color: color ?? Colors.grey), const SizedBox(width: 6), Text(label, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: color ?? Colors.grey))]);
  }

  void _showTemplatesMenu(BuildContext context, ProjectProvider provider) {
    final RenderBox button = context.findRenderObject() as RenderBox;
    final RenderBox overlay = Overlay.of(context).context.findRenderObject() as RenderBox;
    final RelativeRect position = RelativeRect.fromRect(Rect.fromPoints(button.localToGlobal(Offset.zero, ancestor: overlay), button.localToGlobal(button.size.bottomRight(Offset.zero), ancestor: overlay)), Offset.zero & overlay.size);
    showMenu<ProjectTemplate>(context: context, position: position, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), items: provider.allTemplates.map((t) => PopupMenuItem(value: t, child: ListTile(leading: const Icon(Icons.article_outlined, color: Colors.blueAccent), title: Text(t.name, style: const TextStyle(fontWeight: FontWeight.bold)), subtitle: Text(t.description, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11))))).toList()).then((template) {
      if (template != null) showSafeDialog(context, builder: (context) => ConfirmDialog(title: 'Load Template?', content: 'This will replace your current workspace.', confirmText: 'Load', onConfirm: () => provider.loadTemplate(template)));
    });
  }

  void _handleExport(ProjectProvider provider) => ProjectExporter.export(elements: provider.elements, variables: provider.variables, licenseType: provider.licenseType, includeContributing: provider.includeContributing);
  void _showLoginDialog(BuildContext context) => showSafeDialog(context, builder: (_) => const LoginDialog());
  void _showSaveToLibraryDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const SaveToLibraryDialog());
  void _showHealthCheckDialog(BuildContext context, List<HealthIssue> issues, ProjectProvider provider) => showSafeDialog(context, builder: (_) => HealthCheckDialog(issues: issues, provider: provider));
  void _showImportMarkdownDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const ImportMarkdownDialog());
  void _showAISettingsDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const AISettingsDialog());
  void _showLanguageDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const LanguageDialog());
}
