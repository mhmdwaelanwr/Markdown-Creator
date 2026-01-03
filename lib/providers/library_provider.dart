import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../models/saved_project.dart';
import '../models/snippet.dart';

class LibraryProvider with ChangeNotifier {
  List<SavedProject> _projects = [];
  List<Snippet> _snippets = [];

  List<SavedProject> get projects => _projects;
  List<Snippet> get snippets => _snippets;

  LibraryProvider() {
    _loadLibrary();
  }

  Future<void> _loadLibrary() async {
    final prefs = await SharedPreferences.getInstance();

    final projectsJson = prefs.getStringList('saved_projects');
    if (projectsJson != null) {
      _projects = projectsJson
          .map((str) => SavedProject.fromJson(jsonDecode(str)))
          .toList();
    }

    final snippetsJson = prefs.getStringList('saved_snippets');
    if (snippetsJson != null) {
      _snippets = snippetsJson
          .map((str) => Snippet.fromJson(jsonDecode(str)))
          .toList();
    }

    notifyListeners();
  }

  Future<void> _saveLibrary() async {
    final prefs = await SharedPreferences.getInstance();

    final projectsJson = _projects.map((p) => jsonEncode(p.toJson())).toList();
    await prefs.setStringList('saved_projects', projectsJson);

    final snippetsJson = _snippets.map((s) => jsonEncode(s.toJson())).toList();
    await prefs.setStringList('saved_snippets', snippetsJson);
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

