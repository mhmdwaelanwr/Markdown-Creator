// Converted: All ReadmeElement classes from Dart to JS (React Native)
import { v4 as uuidv4 } from 'uuid';

export const ReadmeElementType = {
  heading: 'heading',
  paragraph: 'paragraph',
  image: 'image',
  linkButton: 'linkButton',
  codeBlock: 'codeBlock',
  list: 'list',
  badge: 'badge',
  table: 'table',
  icon: 'icon',
  embed: 'embed',
  githubStats: 'githubStats',
  contributors: 'contributors',
  mermaid: 'mermaid',
  toc: 'toc',
  socials: 'socials',
  blockquote: 'blockquote',
  divider: 'divider',
  raw: 'raw',
  collapsible: 'collapsible',
  dynamicWidget: 'dynamicWidget',
};

export class ReadmeElement {
  constructor({ type, id }) {
    this.id = id || uuidv4();
    this.type = type;
  }
}

// SocialProfile
export class SocialProfile {
  constructor({ platform, username }) {
    this.platform = platform;
    this.username = username;
  }
  toJson() { return { platform: this.platform, username: this.username }; }
  static fromJson(json) { return new SocialProfile({ platform: json.platform, username: json.username }); }
  copy() { return new SocialProfile({ platform: this.platform, username: this.username }); }
}

// SocialsElement
export class SocialsElement extends ReadmeElement {
  constructor({ profiles = [], style = 'for-the-badge', id }) {
    super({ type: ReadmeElementType.socials, id });
    this.profiles = profiles.map(p => p instanceof SocialProfile ? p : SocialProfile.fromJson(p));
    this.style = style;
  }
  get description() { return 'Social Links'; }
  toJson() { return { id: this.id, type: this.type, profiles: this.profiles.map(e => e.toJson()), style: this.style }; }
  copy() { return new SocialsElement({ profiles: this.profiles.map(p => p.copy()), style: this.style }); }
  static fromJson(json) { return new SocialsElement({ profiles: (json.profiles || []).map(e => SocialProfile.fromJson(e)), style: json.style || 'for-the-badge', id: json.id }); }
}

// MermaidElement
export class MermaidElement extends ReadmeElement {
  constructor({ code = 'graph TD;\n    A-->B;', id }) {
    super({ type: ReadmeElementType.mermaid, id });
    this.code = code;
  }
  get description() { return 'Mermaid Diagram'; }
  toJson() { return { id: this.id, type: this.type, code: this.code }; }
  copy() { return new MermaidElement({ code: this.code }); }
  static fromJson(json) { return new MermaidElement({ code: json.code || '', id: json.id }); }
}

// TOCElement
export class TOCElement extends ReadmeElement {
  constructor({ title = 'Table of Contents', id }) {
    super({ type: ReadmeElementType.toc, id });
    this.title = title;
  }
  get description() { return 'Table of Contents'; }
  toJson() { return { id: this.id, type: this.type, title: this.title }; }
  copy() { return new TOCElement({ title: this.title }); }
  static fromJson(json) { return new TOCElement({ title: json.title || 'Table of Contents', id: json.id }); }
}

// HeadingElement
export class HeadingElement extends ReadmeElement {
  constructor({ text = 'Heading', level = 1, id }) {
    super({ type: ReadmeElementType.heading, id });
    this.text = text;
    this.level = level;
  }
  get description() { return `Heading ${this.level}`; }
  toJson() { return { id: this.id, type: this.type, text: this.text, level: this.level }; }
  copy() { return new HeadingElement({ text: this.text, level: this.level }); }
  static fromJson(json) { return new HeadingElement({ text: json.text, level: json.level, id: json.id }); }
}

// ParagraphElement
export class ParagraphElement extends ReadmeElement {
  constructor({ text = 'Paragraph text', id }) {
    super({ type: ReadmeElementType.paragraph, id });
    this.text = text;
  }
  get description() { return 'Paragraph'; }
  toJson() { return { id: this.id, type: this.type, text: this.text }; }
  copy() { return new ParagraphElement({ text: this.text }); }
  static fromJson(json) { return new ParagraphElement({ text: json.text, id: json.id }); }
}

// ImageElement
export class ImageElement extends ReadmeElement {
  constructor({ url = 'https://via.placeholder.com/150', altText = 'Image', width = null, id }) {
    super({ type: ReadmeElementType.image, id });
    this.url = url;
    this.altText = altText;
    this.width = width;
  }
  get description() { return 'Image'; }
  toJson() { return { id: this.id, type: this.type, url: this.url, altText: this.altText, width: this.width }; }
  copy() { return new ImageElement({ url: this.url, altText: this.altText, width: this.width }); }
  static fromJson(json) { return new ImageElement({ url: json.url, altText: json.altText, width: json.width, id: json.id }); }
}

// LinkButtonElement
export class LinkButtonElement extends ReadmeElement {
  constructor({ text = 'Link', url = 'https://example.com', id }) {
    super({ type: ReadmeElementType.linkButton, id });
    this.text = text;
    this.url = url;
  }
  get description() { return 'Link Button'; }
  toJson() { return { id: this.id, type: this.type, text: this.text, url: this.url }; }
  copy() { return new LinkButtonElement({ text: this.text, url: this.url }); }
  static fromJson(json) { return new LinkButtonElement({ text: json.text, url: json.url, id: json.id }); }
}

// CodeBlockElement
export class CodeBlockElement extends ReadmeElement {
  constructor({ code = 'print("Hello World");', language = 'dart', id }) {
    super({ type: ReadmeElementType.codeBlock, id });
    this.code = code;
    this.language = language;
  }
  get description() { return 'Code Block'; }
  toJson() { return { id: this.id, type: this.type, code: this.code, language: this.language }; }
  copy() { return new CodeBlockElement({ code: this.code, language: this.language }); }
  static fromJson(json) { return new CodeBlockElement({ code: json.code, language: json.language, id: json.id }); }
}

// ListElement
export class ListElement extends ReadmeElement {
  constructor({ items = ['Item 1'], isOrdered = false, id }) {
    super({ type: ReadmeElementType.list, id });
    this.items = items;
    this.isOrdered = isOrdered;
  }
  get description() { return 'List'; }
  toJson() { return { id: this.id, type: this.type, items: this.items, isOrdered: this.isOrdered }; }
  copy() { return new ListElement({ items: [...this.items], isOrdered: this.isOrdered }); }
  static fromJson(json) { return new ListElement({ items: json.items, isOrdered: json.isOrdered, id: json.id }); }
}

// BadgeElement
export class BadgeElement extends ReadmeElement {
  constructor({ imageUrl = 'https://img.shields.io/badge/Label-Message-blue', targetUrl = '', label = 'Badge', badgeLabel = null, badgeMessage = null, badgeColor = null, badgeStyle = null, badgeLogo = null, badgeLogoColor = null, badgeLabelColor = null, id }) {
    super({ type: ReadmeElementType.badge, id });
    this.imageUrl = imageUrl;
    this.targetUrl = targetUrl;
    this.label = label;
    this.badgeLabel = badgeLabel;
    this.badgeMessage = badgeMessage;
    this.badgeColor = badgeColor;
    this.badgeStyle = badgeStyle;
    this.badgeLogo = badgeLogo;
    this.badgeLogoColor = badgeLogoColor;
    this.badgeLabelColor = badgeLabelColor;
  }
  get description() { return `Badge: ${this.label}`; }
  toJson() { return { id: this.id, type: this.type, imageUrl: this.imageUrl, targetUrl: this.targetUrl, label: this.label, badgeLabel: this.badgeLabel, badgeMessage: this.badgeMessage, badgeColor: this.badgeColor, badgeStyle: this.badgeStyle, badgeLogo: this.badgeLogo, badgeLogoColor: this.badgeLogoColor, badgeLabelColor: this.badgeLabelColor }; }
  copy() { return new BadgeElement({ imageUrl: this.imageUrl, targetUrl: this.targetUrl, label: this.label, badgeLabel: this.badgeLabel, badgeMessage: this.badgeMessage, badgeColor: this.badgeColor, badgeStyle: this.badgeStyle, badgeLogo: this.badgeLogo, badgeLogoColor: this.badgeLogoColor, badgeLabelColor: this.badgeLabelColor }); }
  static fromJson(json) { return new BadgeElement({ imageUrl: json.imageUrl, targetUrl: json.targetUrl, label: json.label, badgeLabel: json.badgeLabel, badgeMessage: json.badgeMessage, badgeColor: json.badgeColor, badgeStyle: json.badgeStyle, badgeLogo: json.badgeLogo, badgeLogoColor: json.badgeLogoColor, badgeLabelColor: json.badgeLabelColor, id: json.id }); }
}

// TableElement
export const ColumnAlignment = { left: 'left', center: 'center', right: 'right' };
export class TableElement extends ReadmeElement {
  constructor({ headers = ['Header 1', 'Header 2'], rows = [['Cell 1', 'Cell 2']], alignments = [ColumnAlignment.left, ColumnAlignment.left], id }) {
    super({ type: ReadmeElementType.table, id });
    this.headers = headers;
    this.rows = rows;
    this.alignments = alignments;
  }
  get description() { return 'Table'; }
  toJson() { return { id: this.id, type: this.type, headers: this.headers, rows: this.rows, alignments: this.alignments }; }
  copy() { return new TableElement({ headers: [...this.headers], rows: this.rows.map(r => [...r]), alignments: [...this.alignments] }); }
  static fromJson(json) { return new TableElement({ headers: json.headers, rows: json.rows, alignments: json.alignments, id: json.id }); }
}

// IconElement
export class IconElement extends ReadmeElement {
  constructor({ name = 'Flutter', url = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg', size = 40, id }) {
    super({ type: ReadmeElementType.icon, id });
    this.name = name;
    this.url = url;
    this.size = size;
  }
  get description() { return `Icon: ${this.name}`; }
  toJson() { return { id: this.id, type: this.type, name: this.name, url: this.url, size: this.size }; }
  copy() { return new IconElement({ name: this.name, url: this.url, size: this.size }); }
  static fromJson(json) { return new IconElement({ name: json.name, url: json.url, size: json.size, id: json.id }); }
}

// EmbedElement
export class EmbedElement extends ReadmeElement {
  constructor({ url = '', typeName = 'gist', id }) {
    super({ type: ReadmeElementType.embed, id });
    this.url = url;
    this.typeName = typeName;
  }
  get description() { return `Embed: ${this.typeName}`; }
  toJson() { return { id: this.id, type: this.type, url: this.url, typeName: this.typeName }; }
  copy() { return new EmbedElement({ url: this.url, typeName: this.typeName }); }
  static fromJson(json) { return new EmbedElement({ url: json.url, typeName: json.typeName, id: json.id }); }
}

// GitHubStatsElement
export class GitHubStatsElement extends ReadmeElement {
  constructor({ repoName = '', showStars = true, showForks = true, showIssues = true, showLicense = true, id }) {
    super({ type: ReadmeElementType.githubStats, id });
    this.repoName = repoName;
    this.showStars = showStars;
    this.showForks = showForks;
    this.showIssues = showIssues;
    this.showLicense = showLicense;
  }
  get description() { return 'GitHub Stats'; }
  toJson() { return { id: this.id, type: this.type, repoName: this.repoName, showStars: this.showStars, showForks: this.showForks, showIssues: this.showIssues, showLicense: this.showLicense }; }
  copy() { return new GitHubStatsElement({ repoName: this.repoName, showStars: this.showStars, showForks: this.showForks, showIssues: this.showIssues, showLicense: this.showLicense }); }
  static fromJson(json) { return new GitHubStatsElement({ repoName: json.repoName, showStars: json.showStars, showForks: json.showForks, showIssues: json.showIssues, showLicense: json.showLicense, id: json.id }); }
}

// ContributorsElement
export class ContributorsElement extends ReadmeElement {
  constructor({ repoName = '', style = 'grid', id }) {
    super({ type: ReadmeElementType.contributors, id });
    this.repoName = repoName;
    this.style = style;
  }
  get description() { return 'Contributors'; }
  toJson() { return { id: this.id, type: this.type, repoName: this.repoName, style: this.style }; }
  copy() { return new ContributorsElement({ repoName: this.repoName, style: this.style }); }
  static fromJson(json) { return new ContributorsElement({ repoName: json.repoName, style: json.style, id: json.id }); }
}

// BlockquoteElement
export class BlockquoteElement extends ReadmeElement {
  constructor({ text = 'Blockquote text', id }) {
    super({ type: ReadmeElementType.blockquote, id });
    this.text = text;
  }
  get description() { return 'Blockquote'; }
  toJson() { return { id: this.id, type: this.type, text: this.text }; }
  copy() { return new BlockquoteElement({ text: this.text }); }
  static fromJson(json) { return new BlockquoteElement({ text: json.text, id: json.id }); }
}

// DividerElement
export class DividerElement extends ReadmeElement {
  constructor({ id }) {
    super({ type: ReadmeElementType.divider, id });
  }
  get description() { return 'Divider'; }
  toJson() { return { id: this.id, type: this.type }; }
  copy() { return new DividerElement({}); }
  static fromJson(json) { return new DividerElement({ id: json.id }); }
}

// CollapsibleElement
export class CollapsibleElement extends ReadmeElement {
  constructor({ summary = 'Click to expand', content = 'Hidden content', id }) {
    super({ type: ReadmeElementType.collapsible, id });
    this.summary = summary;
    this.content = content;
  }
  get description() { return 'Collapsible Section'; }
  toJson() { return { id: this.id, type: this.type, summary: this.summary, content: this.content }; }
  copy() { return new CollapsibleElement({ summary: this.summary, content: this.content }); }
  static fromJson(json) { return new CollapsibleElement({ summary: json.summary, content: json.content, id: json.id }); }
}

// DynamicWidgetType
export const DynamicWidgetType = { spotify: 'spotify', youtube: 'youtube', medium: 'medium', activity: 'activity' };

// DynamicWidgetElement
export class DynamicWidgetElement extends ReadmeElement {
  constructor({ widgetType = DynamicWidgetType.spotify, identifier = '', theme = 'default', id }) {
    super({ type: ReadmeElementType.dynamicWidget, id });
    this.widgetType = widgetType;
    this.identifier = identifier;
    this.theme = theme;
  }
  get description() { return `Dynamic Widget: ${this.widgetType}`; }
  toJson() { return { id: this.id, type: this.type, widgetType: this.widgetType, identifier: this.identifier, theme: this.theme }; }
  copy() { return new DynamicWidgetElement({ widgetType: this.widgetType, identifier: this.identifier, theme: this.theme }); }
  static fromJson(json) { return new DynamicWidgetElement({ widgetType: json.widgetType, identifier: json.identifier, theme: json.theme, id: json.id }); }
}

// RawElement
export class RawElement extends ReadmeElement {
  constructor({ content = '', css = '', id }) {
    super({ type: ReadmeElementType.raw, id });
    this.content = content;
    this.css = css;
  }
  get description() { return 'Raw Markdown / HTML'; }
  toJson() { return { id: this.id, type: this.type, content: this.content, css: this.css }; }
  copy() { return new RawElement({ content: this.content, css: this.css }); }
  static fromJson(json) { return new RawElement({ content: json.content, css: json.css, id: json.id }); }
}
