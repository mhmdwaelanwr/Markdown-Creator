import { SocialPlatforms } from '../constants/SocialPlatforms';
import { ReadmeTranslations } from '../constants/ReadmeTranslations';

class MarkdownGenerator {
  generate(
    elements,
    variables = {},
    listBullet = '*',
    sectionSpacing = 1,
    targetLanguage = 'en',
    isPreview = false,
  ) {
    const spacing = '\n'.repeat(sectionSpacing + 1);
    let markdown = elements
      .map((element) => this._generateElement(element, listBullet, elements, targetLanguage, isPreview))
      .join(spacing);

    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      markdown = markdown.replace(regex, variables[key]);
    });

    return markdown;
  }

  _generateElement(element, listBullet, allElements, targetLanguage, isPreview) {
    switch (element.type) {
      case 'heading': {
        const text = ReadmeTranslations.get ? ReadmeTranslations.get(element.text, targetLanguage) : element.text;
        return '#'.repeat(element.level) + ' ' + text;
      }
      case 'paragraph':
        return element.text;
      case 'image': {
        const width = Number(element.width || 0);
        return !isPreview && width > 0
          ? `<img src="${element.url}" alt="${element.altText}" width="${width}" />`
          : `![${element.altText}](${element.url})`;
      }
      case 'linkButton':
      case 'button':
        return `[${element.text}](${element.url})`;
      case 'code':
      case 'codeBlock':
        return `\`\`\`${element.language || ''}\n${element.code}\n\`\`\``;
      case 'list':
        return element.items
          .map((item, i) => (element.isOrdered ? `${i + 1}. ${item}` : `${listBullet} ${item}`))
          .join('\n');
      case 'taskList': {
        const items = Array.isArray(element.items) ? element.items : [];
        return items
          .map((item) => {
            if (typeof item === 'string') return `- [ ] ${item}`;
            const checked = !!item.checked;
            const text = (item.text ?? '').toString();
            return `- [${checked ? 'x' : ' '}] ${text}`;
          })
          .join('\n');
      }
      case 'table': {
        const headers = Array.isArray(element.headers) ? element.headers : [];
        const rows = Array.isArray(element.rows) ? element.rows : [];
        const columnCount = headers.length || Math.max(0, ...rows.map((r) => (Array.isArray(r) ? r.length : 0)));

        if (!columnCount) return '';

        const safeHeaders =
          headers.length === columnCount ? headers : Array.from({ length: columnCount }, (_, i) => headers[i] || `Column ${i + 1}`);

        const alignments = Array.isArray(element.alignments) ? element.alignments : [];
        const safeAlignments = Array.from({ length: columnCount }, (_, i) => alignments[i] || 'left');
        const separatorCells = safeAlignments.map((align) => {
          if (align === 'center') return ':---:';
          if (align === 'right') return '---:';
          return ':---';
        });

        const rowLines = rows.map((row) => {
          const cells = Array.isArray(row) ? row : [];
          const safeCells = Array.from({ length: columnCount }, (_, i) => (cells[i] ?? '').toString());
          return `| ${safeCells.join(' | ')} |`;
        });

        return [`| ${safeHeaders.join(' | ')} |`, `| ${separatorCells.join(' | ')} |`, ...rowLines].join('\n').trim();
      }
      case 'divider':
        return '---';
      case 'blockquote':
        return element.text.split('\n').map((line) => `> ${line}`).join('\n');
      case 'badge':
        return element.targetUrl
          ? `[![${element.label}](${element.imageUrl})](${element.targetUrl})`
          : `![${element.label}](${element.imageUrl})`;
      case 'icon':
        if (isPreview) return `![${element.name}](${element.url})`;
        return `<img src="${element.url}" alt="${element.name}" width="${element.size}" height="${element.size}"/>`;
      case 'embed':
      case 'youtube':
      case 'codepen':
      case 'gist': {
        const typeName = element.typeName || element.provider || '';
        if (typeName === 'youtube') {
          const match = typeof element.url === 'string' ? element.url.match(/[?&]v=([^&]+)/) : null;
          const videoId = match ? match[1] : '';
          if (videoId) {
            return `[![${typeName}](https://img.youtube.com/vi/${videoId}/0.jpg)](${element.url})`;
          }
          return `[${typeName}](${element.url})`;
        }
        if (typeName === 'codepen') {
          const match = typeof element.url === 'string'
            ? element.url.match(/codepen\.io\/([^/]+)\/pen\/([^/?]+)/)
            : null;
          if (match) {
            const user = match[1];
            const slug = match[2];
            return `[![CodePen](https://shots.codepen.io/${user}/pen/${slug}-800.jpg)](${element.url})`;
          }
          return '[CodePen](' + element.url + ')';
        }
        return `[${typeName || 'embed'}](${element.url})`;
      }
      case 'contributors':
        if (!element.repoName) return '';
        if (isPreview) {
          return `![Contributors](https://contrib.rocks/image?repo=${element.repoName})`;
        }
        if (element.style === 'grid') {
          return `<a href="https://github.com/${element.repoName}/graphs/contributors">\n  <img src="https://contrib.rocks/image?repo=${element.repoName}" alt="Contributors" />\n</a>`;
        }
        return `[Contributors](https://github.com/${element.repoName}/graphs/contributors)`;
      case 'githubStats': {
        const e = element;
        let stats = '';
        if (e.showStars) stats += `[![Stars](https://img.shields.io/github/stars/${e.repoName}?style=social)](https://github.com/${e.repoName}) `;
        if (e.showForks) stats += `[![Forks](https://img.shields.io/github/forks/${e.repoName}?style=social)](https://github.com/${e.repoName}/network/members) `;
        if (e.showIssues) stats += `[![Issues](https://img.shields.io/github/issues/${e.repoName})](https://github.com/${e.repoName}/issues) `;
        if (e.showLicense) stats += `[![License](https://img.shields.io/github/license/${e.repoName})](https://github.com/${e.repoName}/blob/master/LICENSE) `;
        return stats.trim();
      }
      case 'mermaid':
        return `\`\`\`mermaid\n${element.code}\n\`\`\``;
      case 'collapsible':
        return isPreview
          ? `### ${element.summary}\n${element.content}`
          : `<details>\n<summary>${element.summary}</summary>\n\n${element.content}\n</details>`;
      case 'toc': {
        if (!allElements) return '<!-- TOC -->';
        let toc = `## ${ReadmeTranslations.get ? ReadmeTranslations.get('Table of Contents', targetLanguage) : 'Table of Contents'}\n`;
        allElements.filter((e) => e.type === 'heading').forEach((h) => {
          const indent = '  '.repeat(Math.max(0, (h.level || 1) - 1));
          const anchor = h.text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
          toc += `${indent}- [${h.text}](#${anchor})\n`;
        });
        return toc.trim();
      }
      case 'socials': {
        const profiles = element.profiles || [];
        let output = '';
        profiles.forEach((profile) => {
          const badgeUrl = SocialPlatforms.getBadgeUrl(profile.platform, element.style);
          const targetUrl = SocialPlatforms.getTargetUrl(profile.platform, profile.username);
          if (badgeUrl && targetUrl) {
            output += `[![${profile.platform}](${badgeUrl})](${targetUrl}) `;
          }
        });
        return output.trim();
      }
      case 'raw':
        if (isPreview) return '*[Raw HTML/CSS Hidden in Preview]*';
        if (element.css) return `<style>\n${element.css}\n</style>\n\n${element.content}`;
        return element.content;
      case 'dynamicWidget': {
        switch (element.widgetType) {
          case 'spotify':
            return `[![Spotify](https://spotify-github-profile.vercel.app/api/view?uid=${element.identifier}&cover_image=true&theme=${element.theme}&show_offline=true&background_color=121212&interchange=true&bar_color=53b14f&bar_color_cover=false)](https://open.spotify.com/user/${element.identifier})`;
          case 'youtube':
            return `[![YouTube Channel](https://github-readme-youtube-cards.vercel.app/?channel_id=${element.identifier}&theme=${element.theme})](${element.identifier})`;
          case 'medium':
            return `[![Medium](https://github-readme-medium-recent-article.vercel.app/medium/@${element.identifier}/0)](https://medium.com/@${element.identifier})`;
          case 'activity':
            return `![GitHub Activity Graph](https://activity-graph.herokuapp.com/graph?username=${element.identifier}&theme=${element.theme})`;
          default:
            return '';
        }
      }
      default:
        return '';
    }
  }
}

export default new MarkdownGenerator();
