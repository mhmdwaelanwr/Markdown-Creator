import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/saved_project.dart';
import '../models/snippet.dart';
import '../services/preferences_service.dart';

class LibraryProvider with ChangeNotifier {
  final PreferencesService _prefsService = PreferencesService();
  List<SavedProject> _projects = [];
  List<Snippet> _snippets = [];

  List<SavedProject> get projects => _projects;
  List<Snippet> get snippets => _snippets;

  LibraryProvider() {
    _loadLibrary();
  }

  Future<void> _loadLibrary() async {
    final projectsJson = await _prefsService.loadStringList(PreferencesService.keySavedProjects);
    if (projectsJson != null) {
      _projects = projectsJson
          .map((str) => SavedProject.fromJson(jsonDecode(str)))
          .toList();
    }

    final snippetsJson = await _prefsService.loadStringList(PreferencesService.keySavedSnippets);
    if (snippetsJson != null) {
      _snippets = snippetsJson
          .map((str) => Snippet.fromJson(jsonDecode(str)))
          .toList();
    }

    notifyListeners();
  }

  Future<void> _saveLibrary() async {
    final projectsJson = _projects.map((p) => jsonEncode(p.toJson())).toList();
    await _prefsService.saveStringList(PreferencesService.keySavedProjects, projectsJson);

    final snippetsJson = _snippets.map((s) => jsonEncode(s.toJson())).toList();
    await _prefsService.saveStringList(PreferencesService.keySavedSnippets, snippetsJson);
  }

  void saveProject({
    required String name,
    required String description,
    required List<String> tags,
    required String jsonContent,
    String? id,
  }) {
    final now = DateTime.now();
    if (id != null) {
      // Update existing
      final index = _projects.indexWhere((p) => p.id == id);
      if (index != -1) {
        _projects[index] = SavedProject(
          id: id,
          name: name,
          description: description,
          tags: tags,
          lastModified: now,
          jsonContent: jsonContent,
        );
      }
    } else {
      // Create new
      final newProject = SavedProject(
        id: const Uuid().v4(),
        name: name,
        description: description,
        tags: tags,
        lastModified: now,
        jsonContent: jsonContent,
      );
      _projects.add(newProject);
    }
    _saveLibrary();
    notifyListeners();
  }

  void deleteProject(String id) {
    _projects.removeWhere((p) => p.id == id);
    _saveLibrary();
    notifyListeners();
  }

  void saveSnippet({required String name, required String elementJson}) {
    final snippet = Snippet(
      id: const Uuid().v4(),
      name: name,
      elementJson: elementJson,
    );
    _snippets.add(snippet);
    _saveLibrary();
    notifyListeners();
  }

  void deleteSnippet(String id) {
    _snippets.removeWhere((s) => s.id == id);
    _saveLibrary();
    notifyListeners();
  }
}

