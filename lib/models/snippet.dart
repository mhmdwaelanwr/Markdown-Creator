class Snippet {
  final String id;
  final String name;
  final String elementJson; // JSON of the ReadmeElement

  Snippet({
    required this.id,
    required this.name,
    required this.elementJson,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'elementJson': elementJson,
      };

  factory Snippet.fromJson(Map<String, dynamic> json) {
    return Snippet(
      id: json['id'],
      name: json['name'],
      elementJson: json['elementJson'],
    );
  }
}

