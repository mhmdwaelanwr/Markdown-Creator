import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/library_provider.dart';
import '../../providers/project_provider.dart';
import '../../utils/dialog_helper.dart';
import '../../utils/toast_helper.dart';

class SaveToLibraryDialog extends StatefulWidget {
  const SaveToLibraryDialog({super.key});

  @override
  State<SaveToLibraryDialog> createState() => _SaveToLibraryDialogState();
}

class _SaveToLibraryDialogState extends State<SaveToLibraryDialog> {
  late TextEditingController _nameController;
  final _descController = TextEditingController();
  final _tagsController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final provider = Provider.of<ProjectProvider>(context, listen: false);
    _nameController = TextEditingController(text: provider.variables['PROJECT_NAME'] ?? 'My Project');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    _tagsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StyledDialog(
      title: DialogHeader(
        title: AppLocalizations.of(context)!.saveToLibrary,
        icon: Icons.save_alt,
        color: Colors.blue,
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Save your current project to the local library for quick access later.',
            style: GoogleFonts.inter(color: Colors.grey),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _nameController,
            decoration: InputDecoration(
              labelText: AppLocalizations.of(context)!.projectName,
              border: const OutlineInputBorder(),
              prefixIcon: const Icon(Icons.title),
            ),
            style: GoogleFonts.inter(),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _descController,
            decoration: InputDecoration(
              labelText: AppLocalizations.of(context)!.description,
              border: const OutlineInputBorder(),
              prefixIcon: const Icon(Icons.description),
            ),
            style: GoogleFonts.inter(),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _tagsController,
            decoration: InputDecoration(
              labelText: AppLocalizations.of(context)!.tags,
              hintText: 'flutter, readme, docs',
              border: const OutlineInputBorder(),
              prefixIcon: const Icon(Icons.label),
            ),
            style: GoogleFonts.inter(),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(AppLocalizations.of(context)!.cancel),
        ),
        FilledButton(
          onPressed: () => _save(context),
          child: Text(AppLocalizations.of(context)!.save),
        ),
      ],
    );
  }

  void _save(BuildContext context) {
    final provider = Provider.of<ProjectProvider>(context, listen: false);
    final libraryProvider = Provider.of<LibraryProvider>(context, listen: false);

    final tags = _tagsController.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();

    libraryProvider.saveProject(
      name: _nameController.text,
      description: _descController.text,
      tags: tags,
      jsonContent: provider.exportToJson(),
    );

    Navigator.pop(context);
    ToastHelper.show(context, AppLocalizations.of(context)!.projectSaved);
  }
}

