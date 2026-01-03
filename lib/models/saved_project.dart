
class SavedProject {
  final String id;
  final String name;
  final String description;
  final List<String> tags;
  final DateTime lastModified;
  final String jsonContent; // The full project export JSON

  SavedProject({
    required this.id,
    required this.name,
    required this.description,
    required this.tags,
    required this.lastModified,
    required this.jsonContent,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'tags': tags,
        'lastModified': lastModified.toIso8601String(),
        'jsonContent': jsonContent,
      };

  factory SavedProject.fromJson(Map<String, dynamic> json) {
    return SavedProject(
      id: json['id'],
      name: json['name'],
      description: json['description'] ?? '',
      tags: List<String>.from(json['tags'] ?? []),
      lastModified: DateTime.parse(json['lastModified']),
      jsonContent: json['jsonContent'],
    );
  }
}

