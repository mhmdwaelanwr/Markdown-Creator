import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/project_provider.dart';
import '../../utils/debouncer.dart';
import '../../utils/dialog_helper.dart';

class ProjectSettingsDialog extends StatefulWidget {
  const ProjectSettingsDialog({super.key});

  @override
  State<ProjectSettingsDialog> createState() => _ProjectSettingsDialogState();
}

class _ProjectSettingsDialogState extends State<ProjectSettingsDialog> {
  final _debouncer = Debouncer(milliseconds: 500);

  @override
  void dispose() {
    _debouncer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // We consume provider here so the dialog updates if settings change externally,
    // although typically settings change FROM here.
    final provider = Provider.of<ProjectProvider>(context);

    // Using StyledDialog from dialog_helper
    return StyledDialog(
      title: DialogHeader(
        title: AppLocalizations.of(context)!.projectSettings,
        icon: Icons.settings,
        color: Colors.blueGrey,
      ),
      contentPadding: EdgeInsets.zero,
      width: 600,
      height: 600,
      content: DefaultTabController(
        length: 5,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              margin: const EdgeInsets.fromLTRB(24, 0, 24, 16),
              decoration: BoxDecoration(
                color: Colors.grey.withAlpha(20),
                borderRadius: BorderRadius.circular(8),
              ),
              child: TabBar(
                isScrollable: true,
                indicatorSize: TabBarIndicatorSize.tab,
                indicator: BoxDecoration(
                  color: Theme.of(context).primaryColor.withAlpha(30),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Theme.of(context).primaryColor),
                ),
                labelColor: Theme.of(context).primaryColor,
                unselectedLabelColor: Colors.grey,
                dividerColor: Colors.transparent,
                tabs: [
                  Tab(text: AppLocalizations.of(context)!.variables),
                  Tab(text: AppLocalizations.of(context)!.license),
                  const Tab(text: 'Community'),
                  Tab(text: AppLocalizations.of(context)!.colors),
                  Tab(text: AppLocalizations.of(context)!.formatting),
                ],
              ),
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _buildVariablesTab(context, provider),
                  _buildLicenseTab(context, provider),
                  _buildCommunityTab(context, provider),
                  _buildColorsTab(context, provider),
                  _buildFormattingTab(context, provider),
                ],
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(AppLocalizations.of(context)!.close),
        ),
      ],
    );
  }

  Widget _buildVariablesTab(BuildContext context, ProjectProvider provider) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: provider.variables.entries.map((entry) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: TextFormField(
              initialValue: entry.value,
              decoration: InputDecoration(
                labelText: entry.key,
                border: const OutlineInputBorder(),
              ),
              style: GoogleFonts.inter(),
              onChanged: (value) {
                _debouncer.run(() {
                  provider.updateVariable(entry.key, value);
                });
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildLicenseTab(BuildContext context, ProjectProvider provider) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Select License for your project:', style: GoogleFonts.inter()),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: provider.licenseType,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            items: [
              DropdownMenuItem(value: 'None', child: Text('None', style: GoogleFonts.inter())),
              DropdownMenuItem(value: 'MIT', child: Text('MIT License', style: GoogleFonts.inter())),
              DropdownMenuItem(value: 'Apache 2.0', child: Text('Apache License 2.0', style: GoogleFonts.inter())),
              DropdownMenuItem(value: 'GPLv3', child: Text('GNU GPLv3', style: GoogleFonts.inter())),
              DropdownMenuItem(value: 'BSD 3-Clause', child: Text('BSD 3-Clause License', style: GoogleFonts.inter())),
            ],
            onChanged: (value) {
              if (value != null) provider.setLicenseType(value);
            },
          ),
          const SizedBox(height: 16),
          Text(
            'A LICENSE file will be generated and included in the export.',
            style: GoogleFonts.inter(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildCommunityTab(BuildContext context, ProjectProvider provider) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        child: Column(
          children: [
            SwitchListTile(
              title: Text('Include CONTRIBUTING.md', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
              subtitle: Text('Adds a standard contributing guide.', style: GoogleFonts.inter(fontSize: 12)),
              value: provider.includeContributing,
              onChanged: (value) => provider.setIncludeContributing(value),
            ),
            const Divider(),
            SwitchListTile(
              title: Text('Include SECURITY.md', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
              subtitle: Text('Adds a security policy.', style: GoogleFonts.inter(fontSize: 12)),
              value: provider.includeSecurity,
              onChanged: (value) => provider.setIncludeSecurity(value),
            ),
            const Divider(),
            SwitchListTile(
              title: Text('Include SUPPORT.md', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
              subtitle: Text('Adds support information.', style: GoogleFonts.inter(fontSize: 12)),
              value: provider.includeSupport,
              onChanged: (value) => provider.setIncludeSupport(value),
            ),
            const Divider(),
            SwitchListTile(
              title: Text('Include CODE_OF_CONDUCT.md', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
              subtitle: Text('Adds a contributor covenant code of conduct.', style: GoogleFonts.inter(fontSize: 12)),
              value: provider.includeCodeOfConduct,
              onChanged: (value) => provider.setIncludeCodeOfConduct(value),
            ),
            const Divider(),
            SwitchListTile(
              title: Text('Include Issue Templates', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
              subtitle: Text('Adds GitHub issue and PR templates.', style: GoogleFonts.inter(fontSize: 12)),
              value: provider.includeIssueTemplates,
              onChanged: (value) => provider.setIncludeIssueTemplates(value),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildColorsTab(BuildContext context, ProjectProvider provider) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          ListTile(
            title: Text(AppLocalizations.of(context)!.primaryColor, style: GoogleFonts.inter()),
            subtitle: Text(
              '#${provider.primaryColor.toARGB32().toRadixString(16).toUpperCase().substring(2)}',
              style: GoogleFonts.inter(),
            ),
            trailing: CircleAvatar(backgroundColor: provider.primaryColor),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: Text('Pick Primary Color', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
                  content: SingleChildScrollView(
                    child: ColorPicker(
                      pickerColor: provider.primaryColor,
                      onColorChanged: (color) => provider.setPrimaryColor(color),
                      labelTypes: const [],
                    ),
                  ),
                  actions: [
                    TextButton(
                      child: const Text('Done'),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              );
            },
          ),
          ListTile(
            title: Text(AppLocalizations.of(context)!.secondaryColor, style: GoogleFonts.inter()),
            subtitle: Text(
              '#${provider.secondaryColor.toARGB32().toRadixString(16).toUpperCase().substring(2)}',
              style: GoogleFonts.inter(),
            ),
            trailing: CircleAvatar(backgroundColor: provider.secondaryColor),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: Text('Pick Secondary Color', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
                  content: SingleChildScrollView(
                    child: ColorPicker(
                      pickerColor: provider.secondaryColor,
                      onColorChanged: (color) => provider.setSecondaryColor(color),
                      labelTypes: const [],
                    ),
                  ),
                  actions: [
                    TextButton(
                      child: const Text('Done'),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildFormattingTab(BuildContext context, ProjectProvider provider) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          SwitchListTile(
            title: Text(AppLocalizations.of(context)!.exportHtml, style: GoogleFonts.inter()),
            subtitle: Text('Include a formatted HTML file in the export.', style: GoogleFonts.inter()),
            value: provider.exportHtml,
            onChanged: (value) => provider.setExportHtml(value),
          ),
          const Divider(),
          InputDecorator(
            decoration: InputDecoration(
              labelText: AppLocalizations.of(context)!.listBulletStyle,
              border: const OutlineInputBorder(),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: provider.listBullet,
                isDense: true,
                items: [
                  DropdownMenuItem(value: '*', child: Text('* (Asterisk)', style: GoogleFonts.inter())),
                  DropdownMenuItem(value: '-', child: Text('- (Dash)', style: GoogleFonts.inter())),
                  DropdownMenuItem(value: '+', child: Text('+ (Plus)', style: GoogleFonts.inter())),
                ],
                onChanged: (value) {
                  if (value != null) provider.setListBullet(value);
                },
              ),
            ),
          ),
          const SizedBox(height: 16),
          InputDecorator(
            decoration: InputDecoration(
              labelText: AppLocalizations.of(context)!.sectionSpacing,
              border: const OutlineInputBorder(),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<int>(
                value: provider.sectionSpacing,
                isDense: true,
                items: [
                  DropdownMenuItem(value: 0, child: Text('0 (Compact)', style: GoogleFonts.inter())),
                  DropdownMenuItem(value: 1, child: Text('1 (Standard)', style: GoogleFonts.inter())),
                  DropdownMenuItem(value: 2, child: Text('2 (Spacious)', style: GoogleFonts.inter())),
                ],
                onChanged: (value) {
                  if (value != null) provider.setSectionSpacing(value);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

