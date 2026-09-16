// Converted from Dart Snippet model
export class Snippet {
  constructor({ id, name, elementJson }) {
    this.id = id;
    this.name = name;
    this.elementJson = elementJson;
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
      elementJson: this.elementJson,
    };
  }

  static fromJson(json) {
    return new Snippet({
      id: json.id,
      name: json.name,
      elementJson: json.elementJson,
    });
  }
}
