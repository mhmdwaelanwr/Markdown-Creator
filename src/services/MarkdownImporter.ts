type ElementBase = { id: string; type: string };

type HeadingElement = ElementBase & { type: 'heading'; text: string; level: number };
type ParagraphElement = ElementBase & { type: 'paragraph'; text: string };
type CodeBlockElement = ElementBase & { type: 'codeBlock'; code: string; language?: string };
type ImageElement = ElementBase & { type: 'image'; url: string; altText?: string; width?: number | null };
type ListElement = ElementBase & { type: 'list'; items: string[]; isOrdered: boolean };
type TaskListElement = ElementBase & { type: 'taskList'; items: { text: string; checked: boolean }[] };
type BlockquoteElement = ElementBase & { type: 'blockquote'; text: string };
type DividerElement = ElementBase & { type: 'divider' };
type TableElement = ElementBase & { type: 'table'; headers: string[]; rows: string[][]; alignments?: ('left' | 'center' | 'right')[] };
type LinkButtonElement = ElementBase & { type: 'linkButton'; text: string; url: string };

export type ImportedElement =
  | HeadingElement
  | ParagraphElement
  | CodeBlockElement
  | ImageElement
  | ListElement
  | TaskListElement
  | BlockquoteElement
  | DividerElement
  | TableElement
  | LinkButtonElement
  | (ElementBase & Record<string, any>);

const generateId = () => Math.random().toString(36).slice(2, 11);

const isHorizontalRule = (line: string) => {
  const v = line.trim();
  return /^(-{3,}|\*{3,}|_{3,})$/.test(v.replace(/\s+/g, ''));
};

const stripPipeEdges = (value: string) => value.trim().replace(/^\|/, '').replace(/\|$/, '');

const splitTableRow = (row: string) =>
  stripPipeEdges(row)
    .split('|')
    .map((cell) => cell.trim());

const isTableSeparator = (line: string) => {
  const trimmed = stripPipeEdges(line);
  if (!trimmed.includes('-')) return false;
  const parts = trimmed.split('|').map((p) => p.trim());
  if (!parts.length) return false;
  return parts.every((part) => /^:?-{3,}:?$/.test(part.replace(/\s+/g, '')));
};

const parseAlignments = (line: string): ('left' | 'center' | 'right')[] => {
  const parts = stripPipeEdges(line).split('|').map((p) => p.trim().replace(/\s+/g, ''));
  return parts.map((p) => {
    const starts = p.startsWith(':');
    const ends = p.endsWith(':');
    if (starts && ends) return 'center';
    if (ends) return 'right';
    return 'left';
  });
};

const tryParseMarkdownImage = (line: string): ImageElement | null => {
  const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (!match) return null;
  return { id: generateId(), type: 'image', altText: match[1] || '', url: match[2] || '' };
};

const tryParseHtmlImage = (line: string): ImageElement | null => {
  if (!/^<img\b/i.test(line) || !/src\s*=/.test(line)) return null;
  const src = line.match(/src\s*=\s*["']([^"']+)["']/i)?.[1] || '';
  if (!src) return null;
  const altText = line.match(/alt\s*=\s*["']([^"']*)["']/i)?.[1] || '';
  const widthRaw = line.match(/width\s*=\s*["']?(\d+)["']?/i)?.[1];
  const width = widthRaw ? Number.parseInt(widthRaw, 10) : undefined;
  return { id: generateId(), type: 'image', altText, url: src, width: Number.isFinite(width) ? width : undefined };
};

const tryParseLinkButton = (line: string): LinkButtonElement | null => {
  const match = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (!match) return null;
  return { id: generateId(), type: 'linkButton', text: match[1] || '', url: match[2] || '' };
};

export class MarkdownImporter {
  parse(markdown: string): ImportedElement[] {
    const elements: ImportedElement[] = [];
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');

    let paragraphLines: string[] = [];

    const flushParagraph = () => {
      const content = paragraphLines.join('\n').trim();
      if (content.length > 0) {
        elements.push({ id: generateId(), type: 'paragraph', text: content });
      }
      paragraphLines = [];
    };

    const flushList = (items: string[], isOrdered: boolean) => {
      if (!items.length) return;
      elements.push({ id: generateId(), type: 'list', items, isOrdered });
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i] ?? '';
      const line = rawLine.trim();

      if (line.length === 0) {
        flushParagraph();
        continue;
      }

      // Code fences
      if (line.startsWith('```')) {
        flushParagraph();
        const language = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !(lines[i] ?? '').trim().startsWith('```')) {
          codeLines.push(lines[i] ?? '');
          i++;
        }
        elements.push({ id: generateId(), type: 'codeBlock', code: codeLines.join('\n').trimEnd(), language });
        continue;
      }

      // Headings
      if (/^#{1,6}\s+/.test(line)) {
        flushParagraph();
        const level = line.match(/^#+/)?.[0]?.length || 1;
        const text = line.replace(/^#{1,6}\s+/, '');
        elements.push({ id: generateId(), type: 'heading', level, text });
        continue;
      }

      // Horizontal rule
      if (isHorizontalRule(line)) {
        flushParagraph();
        elements.push({ id: generateId(), type: 'divider' });
        continue;
      }

      // Blockquote
      if (line.startsWith('>')) {
        flushParagraph();
        const quoteLines: string[] = [];
        while (i < lines.length) {
          const candidate = (lines[i] ?? '').trim();
          if (!candidate.startsWith('>')) break;
          quoteLines.push(candidate.replace(/^>\s?/, ''));
          i++;
        }
        i--; // rewind: outer loop will increment
        elements.push({ id: generateId(), type: 'blockquote', text: quoteLines.join('\n').trim() });
        continue;
      }

      // Tables (GFM)
      const nextLine = i + 1 < lines.length ? (lines[i + 1] ?? '').trim() : '';
      if (line.includes('|') && nextLine && nextLine.includes('|') && isTableSeparator(nextLine)) {
        flushParagraph();
        const headers = splitTableRow(line);
        const alignments = parseAlignments(nextLine);
        const rows: string[][] = [];
        const columnCount = headers.length;

        i += 2;
        while (i < lines.length) {
          const rowLine = (lines[i] ?? '').trim();
          if (!rowLine || !rowLine.includes('|')) break;
          if (isTableSeparator(rowLine)) break;
          const cells = splitTableRow(rowLine);
          while (cells.length < columnCount) cells.push('');
          rows.push(cells.slice(0, columnCount));
          i++;
        }
        i--; // rewind for outer loop
        elements.push({
          id: generateId(),
          type: 'table',
          headers: headers.map((h) => h || ''),
          rows,
          alignments: Array.from({ length: columnCount }, (_, idx) => alignments[idx] || 'left'),
        });
        continue;
      }

      // Lists (simple single-level)
      const unorderedMatch = line.match(/^([-*+])\s+(.+)$/);
      const orderedMatch = line.match(/^(\d+)[.)]\s+(.+)$/);
      if (unorderedMatch || orderedMatch) {
        flushParagraph();
        const isOrdered = !!orderedMatch;
        if (!isOrdered) {
          const firstTask = line.match(/^[-*+]\s+\[(x| )\]\s+(.+)$/i);
          if (firstTask) {
            const items: { text: string; checked: boolean }[] = [];
            while (i < lines.length) {
              const candidate = (lines[i] ?? '').trim();
              const match = candidate.match(/^[-*+]\s+\[(x| )\]\s+(.+)$/i);
              if (!match) break;
              items.push({ checked: match[1].toLowerCase() === 'x', text: (match[2] || '').trim() });
              i++;
            }
            i--;
            elements.push({ id: generateId(), type: 'taskList', items });
            continue;
          }
        }

        const items: string[] = [];

        while (i < lines.length) {
          const candidateRaw = lines[i] ?? '';
          const candidate = candidateRaw.trim();
          const u = candidate.match(/^([-*+])\s+(.+)$/);
          const o = candidate.match(/^(\d+)[.)]\s+(.+)$/);
          if (isOrdered) {
            if (!o) break;
            items.push(o[2].trim());
          } else {
            if (!u) break;
            items.push(u[2].trim());
          }
          i++;
        }
        i--;
        flushList(items, isOrdered);
        continue;
      }

      // Images
      const image =
        tryParseMarkdownImage(line) ||
        tryParseHtmlImage(line);
      if (image) {
        flushParagraph();
        elements.push(image);
        continue;
      }

      // Link-only line -> button
      const linkButton = tryParseLinkButton(line);
      if (linkButton) {
        flushParagraph();
        elements.push(linkButton);
        continue;
      }

      // Default: paragraph continuation
      paragraphLines.push(rawLine);
    }

    flushParagraph();
    return elements;
  }
}

export default new MarkdownImporter();
