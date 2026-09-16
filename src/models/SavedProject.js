// Converted from Dart SavedProject model
export class SavedProject {
  constructor({ id, name, description = '', tags = [], lastModified, jsonContent }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.tags = tags;
    this.lastModified = lastModified ? new Date(lastModified) : new Date();
    this.jsonContent = jsonContent;
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      tags: this.tags,
      lastModified: this.lastModified.toISOString(),
      jsonContent: this.jsonContent,
    };
  }

  static fromJson(json) {
    return new SavedProject({
      id: json.id,
      name: json.name,
      description: json.description || '',
      tags: json.tags || [],
      lastModified: json.lastModified,
      jsonContent: json.jsonContent,
    });
  }
}
