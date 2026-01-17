import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/project_provider.dart';
import '../../utils/dialog_helper.dart';
import '../../core/constants/app_colors.dart';

class LanguageDialog extends StatelessWidget {
  const LanguageDialog({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return StyledDialog(
      title: DialogHeader(
        title: AppLocalizations.of(context)!.changeLanguage,
        icon: Icons.translate_rounded,
        color: Colors.orange,
      ),
      width: 500,
      height: 600,
      content: Column(
        children: [
          _buildInfoBox('Choose your preferred language for the application interface.', isDark),
          const SizedBox(height: 20),
          Expanded(
            child: Consumer<ProjectProvider>(
              builder: (context, provider, _) {
                return ListView(
                  children: [
                    _buildLanguageItem(context, provider, 'English', 'en', '🇺🇸', isDark),
                    _buildLanguageItem(context, provider, 'العربية', 'ar', '🇪🇬', isDark),
                    _buildLanguageItem(context, provider, 'Español', 'es', '🇪🇸', isDark),
                    _buildLanguageItem(context, provider, 'Français', 'fr', '🇫🇷', isDark),
                    _buildLanguageItem(context, provider, 'Deutsch', 'de', '🇩🇪', isDark),
                    _buildLanguageItem(context, provider, 'हिन्दी', 'hi', '🇮🇳', isDark),
                    _buildLanguageItem(context, provider, '日本語', 'ja', '🇯🇵', isDark),
                    _buildLanguageItem(context, provider, 'Português', 'pt', '🇧🇷', isDark),
                    _buildLanguageItem(context, provider, 'Русский', 'ru', '🇷🇺', isDark),
                    _buildLanguageItem(context, provider, '中文', 'zh', '🇨🇳', isDark),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8.0),
                      child: Divider(),
                    ),
                    _buildSystemDefaultItem(context, provider, isDark),
                  ],
                );
              },
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(AppLocalizations.of(context)!.close, style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }

  Widget _buildInfoBox(String text, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.orange.withAlpha(isDark ? 20 : 10),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.orange.withAlpha(30)),
      ),
      child: Text(text, textAlign: TextAlign.center, style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[600])),
    );
  }

  Widget _buildLanguageItem(BuildContext context, ProjectProvider provider, String name, String code, String flag, bool isDark) {
    final isSelected = provider.locale?.languageCode == code;
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      color: isSelected ? AppColors.primary.withAlpha(isDark ? 30 : 10) : Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: isSelected ? AppColors.primary : Colors.grey.withAlpha(30)),
      ),
      child: ListTile(
        leading: Text(flag, style: const TextStyle(fontSize: 24)),
        title: Text(name, style: GoogleFonts.inter(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
        trailing: isSelected ? const Icon(Icons.check_circle_rounded, color: AppColors.primary) : null,
        onTap: () {
          provider.setLocale(Locale(code));
          Navigator.pop(context);
        },
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Widget _buildSystemDefaultItem(BuildContext context, ProjectProvider provider, bool isDark) {
    final isSelected = provider.locale == null;
    return Card(
      elevation: 0,
      color: isSelected ? AppColors.primary.withAlpha(isDark ? 30 : 10) : Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: isSelected ? AppColors.primary : Colors.grey.withAlpha(30)),
      ),
      child: ListTile(
        leading: const Icon(Icons.settings_suggest_rounded),
        title: Text('System Default', style: GoogleFonts.inter(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
        trailing: isSelected ? const Icon(Icons.check_circle_rounded, color: AppColors.primary) : null,
        onTap: () {
          provider.setLocale(null);
          Navigator.pop(context);
        },
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
