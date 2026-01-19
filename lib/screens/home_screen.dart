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
import '../core/constants/app_colors.dart';

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

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late AnimationController _mainController;
  late Animation<double> _fadeAnimation;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final AuthService _authService = AuthService();
  bool _showPreview = false;
  bool _isFocusMode = false;

  @override
  void initState() {
    super.initState();
    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fadeAnimation = CurvedAnimation(parent: _mainController, curve: Curves.easeOutQuart);
    _mainController.forward();
  }

  @override
  void dispose() {
    _mainController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width > 1200;
    final provider = Provider.of<ProjectProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return CallbackShortcuts(
      bindings: {
        const SingleActivator(LogicalKeyboardKey.keyK, control: true): () => _showCommandPalette(context, provider),
      },
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: Scaffold(
          key: _scaffoldKey,
          extendBodyBehindAppBar: true,
          backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
          appBar: _buildFutureAppBar(context, isDesktop, provider),
          drawer: isDesktop ? null : const Drawer(child: ComponentsPanel()),
          endDrawer: isDesktop ? null : const Drawer(child: SettingsPanel()),
          body: Stack(
            children: [
              _buildDynamicBackground(context, isDark),
              Column(
                children: [
                  const SizedBox(height: 100), 
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          if (isDesktop && !_isFocusMode) 
                            _buildSidePanel(const ComponentsPanel(), flex: 2),
                          
                          if (isDesktop && !_isFocusMode) const SizedBox(width: 16),
                          
                          Expanded(
                            flex: 6,
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(32),
                              child: const EditorCanvas(),
                            ),
                          ),
                          
                          if (_showPreview && isDesktop) ...[
                            const SizedBox(width: 16),
                            _buildSidePanel(_buildLiveMarkdownPreview(context, provider, isDark), flex: 4),
                          ],
                          
                          if (isDesktop && !_isFocusMode) const SizedBox(width: 16),
                          
                          if (isDesktop && !_isFocusMode) 
                            _buildSidePanel(const SettingsPanel(), flex: 3),
                        ],
                      ),
                    ),
                  ),
                  _buildStudioStatusBar(context, provider, isDark),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildFutureAppBar(BuildContext context, bool isDesktop, ProjectProvider provider) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return PreferredSize(
      preferredSize: const Size.fromHeight(100),
      child: Container(
        margin: const EdgeInsets.fromLTRB(24, 20, 24, 0),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 25, sigmaY: 25),
            child: Container(
              height: 64,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: (isDark ? Colors.black : Colors.white).withOpacity(0.6),
                border: Border.all(color: (isDark ? Colors.white : Colors.black).withOpacity(0.08)),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Row(
                children: [
                  _appIcon(),
                  const SizedBox(width: 12),
                  Text('MD Studio', style: GoogleFonts.poppins(fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: -0.5)),
                  const Spacer(),
                  if (isDesktop) ..._buildFullStudioActions(context, provider),
                  if (!isDesktop) IconButton(icon: const Icon(Icons.tune_rounded), onPressed: () => _scaffoldKey.currentState?.openEndDrawer()),
                  _buildMoreOptionsButton(context),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildFullStudioActions(BuildContext context, ProjectProvider provider) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return [
      // 1. History
      _actionIcon(Icons.undo_rounded, provider.undo, tooltip: 'Undo (Ctrl+Z)'),
      _actionIcon(Icons.redo_rounded, provider.redo, tooltip: 'Redo (Ctrl+Y)'),
      _divider(),

      // 2. Devices
      _deviceIcon(Icons.desktop_mac, DeviceMode.desktop, provider),
      _deviceIcon(Icons.tablet_mac, DeviceMode.tablet, provider),
      _deviceIcon(Icons.phone_iphone, DeviceMode.mobile, provider),
      _divider(),

      // 3. Core Tools
      _actionIcon(Icons.file_copy_outlined, () => _showTemplatesMenu(context, provider), tooltip: 'Templates'),
      _actionIcon(Icons.library_books_outlined, () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProjectsLibraryScreen())), tooltip: 'Projects'),
      _actionIcon(Icons.health_and_safety_outlined, () {
        final issues = HealthCheckService.analyze(provider.elements);
        _showHealthCheckDialog(context, issues, provider);
      }, tooltip: 'Health Audit'),
      _divider(),

      // 4. Studio Appearance
      _actionIcon(isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded, provider.toggleTheme, tooltip: 'Toggle Theme', color: isDark ? Colors.amber : Colors.blueGrey),
      _actionIcon(Icons.settings_outlined, () => _showProjectSettingsDialog(context, provider), tooltip: 'Studio Settings'),
      _divider(),

      // 5. Viewing
      _actionIcon(_showPreview ? Icons.visibility : Icons.visibility_off, () => setState(() => _showPreview = !_showPreview), active: _showPreview, tooltip: 'Live View'),
      _actionIcon(_isFocusMode ? Icons.fullscreen_exit : Icons.fullscreen, () => setState(() => _isFocusMode = !_isFocusMode), active: _isFocusMode, tooltip: 'Focus Mode'),
      
      const SizedBox(width: 12),
      // 6. Action
      _appBarPrimaryButton('Export', Icons.rocket_launch_rounded, () => _handleExport(provider)),
      const SizedBox(width: 8),
      
      // 7. Auth Avatar
      _buildUserAvatar(),
    ];
  }

  Widget _buildUserAvatar() {
    return StreamBuilder(
      stream: _authService.user,
      builder: (context, snapshot) {
        final user = snapshot.data;
        if (user == null) return IconButton(icon: const Icon(Icons.account_circle_outlined), onPressed: () => _showLoginDialog(context));
        return Padding(
          padding: const EdgeInsets.only(left: 8),
          child: InkWell(
            onTap: () => _authService.signOut(),
            child: CircleAvatar(radius: 14, backgroundImage: NetworkImage(user.photoURL ?? '')),
          ),
        );
      },
    );
  }

  Widget _appIcon() {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 18),
    );
  }

  Widget _appBarPrimaryButton(String label, IconData icon, VoidCallback onTap) {
    return ElevatedButton.icon(
      onPressed: onTap,
      icon: Icon(icon, size: 16),
      label: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Widget _divider() => VerticalDivider(width: 24, indent: 20, endIndent: 20, color: Colors.grey.withOpacity(0.2));

  Widget _actionIcon(IconData icon, VoidCallback onTap, {bool active = false, String? tooltip, Color? color}) {
    return Tooltip(
      message: tooltip ?? '',
      child: IconButton(
        icon: Icon(icon, size: 19, color: active ? AppColors.primary : color),
        onPressed: onTap,
        splashRadius: 22,
      ),
    );
  }

  Widget _deviceIcon(IconData icon, DeviceMode mode, ProjectProvider provider) {
    final active = provider.deviceMode == mode;
    return Tooltip(
      message: mode.name.toUpperCase(),
      child: IconButton(
        icon: Icon(icon, size: 19, color: active ? AppColors.primary : Colors.grey),
        onPressed: () => provider.setDeviceMode(mode),
      ),
    );
  }

  Widget _buildSidePanel(Widget child, {required int flex}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Expanded(
      flex: flex,
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? Colors.black26 : Colors.white70,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: (isDark ? Colors.white : Colors.black).withOpacity(0.05)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 20)],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(28),
          child: child,
        ),
      ),
    );
  }

  Widget _buildDynamicBackground(BuildContext context, bool isDark) {
    return Positioned.fill(
      child: Stack(
        children: [
          Positioned(top: -100, right: -50, child: Container(width: 400, height: 400, decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.primary.withOpacity(isDark ? 0.15 : 0.05)))),
          Positioned(bottom: -150, left: -50, child: Container(width: 500, height: 500, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.purpleAccent.withOpacity(isDark ? 0.1 : 0.03)))),
        ],
      ),
    );
  }

  Widget _buildLiveMarkdownPreview(BuildContext context, ProjectProvider provider, bool isDark) {
    final markdown = MarkdownGenerator().generate(provider.elements, variables: provider.variables);
    return Container(
      color: isDark ? const Color(0xFF0D1117) : Colors.white,
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.code_rounded, size: 14, color: Colors.grey),
              const SizedBox(width: 8),
              Text('MARKDOWN PREVIEW', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.2)),
            ],
          ),
          const Divider(height: 32),
          Expanded(
            child: Markdown(
              data: markdown,
              selectable: true,
              styleSheet: MarkdownStyleSheet.fromTheme(Theme.of(context)).copyWith(
                p: GoogleFonts.inter(height: 1.6, color: isDark ? const Color(0xFFC9D1D9) : const Color(0xFF24292F)),
                h1: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black),
                code: GoogleFonts.firaCode(backgroundColor: isDark ? Colors.white10 : Colors.black.withOpacity(0.05)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudioStatusBar(BuildContext context, ProjectProvider provider, bool isDark) {
    final score = HealthCheckService.calculateDocumentationScore(provider.elements);
    return Container(
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      decoration: BoxDecoration(color: isDark ? Colors.black38 : Colors.white70, border: Border(top: BorderSide(color: (isDark ? Colors.white : Colors.black).withOpacity(0.05)))),
      child: Row(
        children: [
          _statusItem(Icons.layers_rounded, '${provider.elements.length} Components'),
          const SizedBox(width: 24),
          _statusItem(Icons.analytics_outlined, 'Doc Health: ${score.toInt()}%', color: score > 70 ? Colors.greenAccent : Colors.orangeAccent),
          const Spacer(),
          if (provider.isSaving) 
            const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
          else
            _statusItem(Icons.cloud_done_rounded, 'Studio Synced', color: AppColors.primary),
        ],
      ),
    );
  }

  Widget _statusItem(IconData icon, String label, {Color? color}) {
    return Row(children: [Icon(icon, size: 14, color: color ?? Colors.grey), const SizedBox(width: 6), Text(label, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: color ?? Colors.grey))]);
  }

  Widget _buildMoreOptionsButton(BuildContext context) {
    final provider = Provider.of<ProjectProvider>(context, listen: false);
    return PopupMenuButton<String>(
      icon: const Icon(Icons.grid_view_rounded, size: 20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      offset: const Offset(0, 50),
      itemBuilder: (context) => [
        _menuHeader('Projects & Files'),
        _menuItem('save', Icons.save_alt_rounded, 'Save Project', Colors.blue),
        _menuItem('snapshots', Icons.history_rounded, 'Local Snapshots', Colors.blue),
        _menuItem('import_md', Icons.file_upload_outlined, 'Import Markdown', Colors.blue),
        _menuItem('export_json', Icons.javascript_rounded, 'Export JSON', Colors.blue),
        _menuItem('import_json', Icons.data_object_rounded, 'Import JSON', Colors.blue),
        _menuItem('clear', Icons.delete_sweep_rounded, 'Clear Workspace', Colors.red, isDestructive: true),
        const PopupMenuDivider(),
        _menuHeader('Intelligence'),
        _menuItem('ai', Icons.psychology_rounded, 'AI Settings & Magic', Colors.purple),
        _menuItem('codebase', Icons.auto_awesome_rounded, 'Generate From Codebase', Colors.purple),
        _menuItem('publish', Icons.cloud_upload_rounded, 'Publish to GitHub', Colors.teal),
        const PopupMenuDivider(),
        _menuHeader('Advanced Tools'),
        _menuItem('social', Icons.auto_graph_rounded, 'Social Preview Designer', Colors.orange),
        _menuItem('actions', Icons.terminal_rounded, 'GitHub Actions Generator', Colors.orange),
        _menuItem('funding', Icons.volunteer_activism_rounded, 'Funding Generator', Colors.pink),
        _menuItem('extra', Icons.library_add_rounded, 'Generate Extra Files', Colors.deepOrange),
        const PopupMenuDivider(),
        _menuHeader('App Settings'),
        _menuItem('lang', Icons.translate_rounded, 'Change Language', Colors.grey),
        _menuItem('shortcuts', Icons.keyboard_command_key_rounded, 'Keyboard Shortcuts', Colors.grey),
        _menuItem('about', Icons.info_outline_rounded, 'About Application', Colors.grey),
      ],
      onSelected: (val) {
        if (val == 'save') _showSaveToLibraryDialog(context, provider);
        else if (val == 'snapshots') _showSnapshotsDialog(context, provider);
        else if (val == 'import_md') _showImportMarkdownDialog(context, provider);
        else if (val == 'export_json') downloadJsonFile(provider.exportToJson(), 'readme_project.json');
        else if (val == 'import_json') _handleImportJson(provider);
        else if (val == 'clear') showSafeDialog(context, builder: (context) => ConfirmDialog(title: 'Clear Workspace?', content: 'This will remove all elements.', confirmText: 'Clear', isDestructive: true, onConfirm: () => provider.clearElements()));
        else if (val == 'gallery') Navigator.push(context, MaterialPageRoute(builder: (_) => const GalleryScreen()));
        else if (val == 'social') Navigator.push(context, MaterialPageRoute(builder: (_) => const SocialPreviewScreen()));
        else if (val == 'actions') Navigator.push(context, MaterialPageRoute(builder: (_) => const GitHubActionsGenerator()));
        else if (val == 'funding') Navigator.push(context, MaterialPageRoute(builder: (_) => const FundingGeneratorScreen()));
        else if (val == 'extra') _showExtraFilesDialog(context, provider);
        else if (val == 'ai') _showAISettingsDialog(context, provider);
        else if (val == 'codebase') _showGenerateFromCodebaseDialog(context, provider);
        else if (val == 'publish') _showPublishToGitHubDialog(context, provider);
        else if (val == 'lang') _showLanguageDialog(context, provider);
        else if (val == 'shortcuts') _showKeyboardShortcutsDialog(context);
        else if (val == 'about') _showAboutAppDialog(context);
      },
    );
  }

  PopupMenuItem<String> _menuHeader(String title) => PopupMenuItem(enabled: false, height: 30, child: Text(title.toUpperCase(), style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.2)));
  PopupMenuItem<String> _menuItem(String val, IconData icon, String text, Color color, {bool isDestructive = false}) => PopupMenuItem(value: val, child: Row(children: [Icon(icon, color: isDestructive ? Colors.red : color, size: 18), const SizedBox(width: 12), Text(text, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isDestructive ? Colors.red : null))]));

  void _showTemplatesMenu(BuildContext context, ProjectProvider provider) {
    final RenderBox button = context.findRenderObject() as RenderBox;
    final RenderBox overlay = Overlay.of(context).context.findRenderObject() as RenderBox;
    final RelativeRect position = RelativeRect.fromRect(Rect.fromPoints(button.localToGlobal(Offset.zero, ancestor: overlay), button.localToGlobal(button.size.bottomRight(Offset.zero), ancestor: overlay)), Offset.zero & overlay.size);
    showMenu<ProjectTemplate>(context: context, position: position, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), items: provider.allTemplates.map((t) => PopupMenuItem(value: t, child: ListTile(leading: const Icon(Icons.article_outlined, color: AppColors.primary), title: Text(t.name, style: const TextStyle(fontWeight: FontWeight.bold)), subtitle: Text(t.description, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11))))).toList()).then((template) {
      if (template != null) showSafeDialog(context, builder: (context) => ConfirmDialog(title: 'Load Template?', content: 'This will replace your current workspace.', confirmText: 'Load', onConfirm: () => provider.loadTemplate(template)));
    });
  }

  void _showCommandPalette(BuildContext context, ProjectProvider provider) {
    // A future-gen quick search feature
    showDialog(context: context, builder: (context) => const Center(child: Text('Command Palette Coming Soon...')));
  }

  Future<void> _handleImportJson(ProjectProvider provider) async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['json']);
      if (result != null) {
        String? content;
        if (result.files.first.bytes != null) content = utf8.decode(result.files.first.bytes!);
        if (content != null) {
          provider.importFromJson(content);
          if (context.mounted) ToastHelper.show(context, 'Project imported successfully');
        }
      }
    } catch (e) {
      if (context.mounted) ToastHelper.show(context, 'Error: $e', isError: true);
    }
  }

  void _handleExport(ProjectProvider provider) => ProjectExporter.export(elements: provider.elements, variables: provider.variables, licenseType: provider.licenseType, includeContributing: provider.includeContributing);
  void _showLoginDialog(BuildContext context) => showSafeDialog(context, builder: (_) => const LoginDialog());
  void _showProjectSettingsDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const ProjectSettingsDialog());
  void _showSaveToLibraryDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const SaveToLibraryDialog());
  void _showSnapshotsDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const SnapshotsDialog());
  void _showHealthCheckDialog(BuildContext context, List<HealthIssue> issues, ProjectProvider provider) => showSafeDialog(context, builder: (_) => HealthCheckDialog(issues: issues, provider: provider));
  void _showImportMarkdownDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const ImportMarkdownDialog());
  void _showAISettingsDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const AISettingsDialog());
  void _showPublishToGitHubDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const PublishToGitHubDialog());
  void _showGenerateFromCodebaseDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const GenerateCodebaseDialog());
  void _showExtraFilesDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const ExtraFilesDialog());
  void _showLanguageDialog(BuildContext context, ProjectProvider provider) => showSafeDialog(context, builder: (_) => const LanguageDialog());
  void _showKeyboardShortcutsDialog(BuildContext context) => showSafeDialog(context, builder: (_) => const KeyboardShortcutsDialog());
  void _showAboutAppDialog(BuildContext context) => showSafeDialog(context, builder: (_) => const AboutAppDialog());
}
