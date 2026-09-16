import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SvgUri } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { SocialPlatforms } from '../constants/SocialPlatforms';
import Clipboard from '../platform/clipboard';
import ActionIconButton from './ui/ActionIconButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useProject } from '../context/ProjectContext';

const scrollToCanvasElement = (id) => {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  if (!id) return;

  try {
    const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(String(id)) : String(id);
    const node = document.querySelector(`[data-element-id="${escaped}"]`);
    node?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  } catch {
    // Ignore scroll failures
  }
};

const CodeBlockPreview = ({ element, isDark }) => {
  const [copied, setCopied] = useState(false);
  const languageLabel = (element.language || '').toUpperCase();

  const handleCopy = async () => {
    await Clipboard.setString(element.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
  };

  return (
    <View style={[styles.codeContainer, { backgroundColor: isDark ? '#1E1E1E' : '#F6F8FA' }]}>
      <View style={styles.codeHeader}>
        <View style={styles.codeDots}>
          <View style={[styles.dot, { backgroundColor: '#FF5F56' }]} />
          <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
          <View style={[styles.dot, { backgroundColor: '#27C93F' }]} />
        </View>
        <Text style={styles.codeLang}>{languageLabel}</Text>
        <ActionIconButton
          icon={copied ? 'check' : 'content-copy'}
          onPress={handleCopy}
          isDark={isDark}
          active={copied}
          size={16}
          accessibilityLabel="Copy code"
          style={styles.codeCopyBtn}
        />
      </View>
      <Text style={[styles.codeText, { color: isDark ? '#D4D4D4' : '#24292E' }]}>{element.code}</Text>
    </View>
  );
};

const CollapsiblePreview = ({ element, isDark, textColor }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.collapsible, { borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
      <TouchableOpacity style={styles.collapsibleHeader} activeOpacity={0.85} onPress={() => setOpen((v) => !v)}>
        <Text style={[styles.collapsibleTitle, { color: textColor }]}>{element.summary || 'Details'}</Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color={isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight} />
      </TouchableOpacity>
      {open ? (
        <Text style={[styles.collapsibleContent, { color: textColor }]}>{element.content || 'Hidden content'}</Text>
      ) : null}
    </View>
  );
};

const TocPreview = ({ element, isDark, textColor, allElements }) => {
  const { setSelectedElementId } = useProject();

  const headings = useMemo(() => (allElements || []).filter((e) => e.type === 'heading'), [allElements]);
  if (!headings.length) {
    return <Text style={{ color: textColor }}>Add headings to build a table of contents.</Text>;
  }

  return (
    <View style={styles.tocContainer}>
      <Text style={[styles.tocTitle, { color: textColor }]}>{element.title || 'Table of Contents'}</Text>
      {headings.map((heading, index) => (
        <TouchableOpacity
          key={`${element.id}-toc-${index}`}
          activeOpacity={0.8}
          onPress={() => {
            setSelectedElementId(heading.id);
            scrollToCanvasElement(heading.id);
          }}
          style={[styles.tocItemRow, { marginLeft: ((heading.level || 1) - 1) * 12 }]}
        >
          <Icon name="chevron-right" size={14} color={isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight} />
          <Text style={[styles.tocItem, { color: textColor }]} numberOfLines={1}>
            {heading.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ElementRenderer = ({ element, isDark, allElements = [] }) => {
  const textColor = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;

  const renderBadge = (url, height = 20) => {
    if (!url) return null;
    if (url.toLowerCase().endsWith('.svg') || url.includes('img.shields.io')) {
      if (SvgUri) {
        return <SvgUri uri={url} height={height} style={styles.badge} />;
      }
      return (
        <Image
          source={{ uri: url }}
          style={[styles.badge, { height, width: Platform.OS === 'web' ? 'auto' : height * 4 }]}
          resizeMode="contain"
        />
      );
    }
    return <Image source={{ uri: url }} style={[styles.badge, { height }]} resizeMode="contain" />;
  };

  const renderImage = (url, width, height, style) => {
    if (!url) return null;
    if (url.toLowerCase().endsWith('.svg') || url.includes('img.shields.io')) {
      if (SvgUri) {
        return <SvgUri uri={url} width={width} height={height} style={style} />;
      }
      const fallbackWidth = width ?? (Platform.OS === 'web' ? 'auto' : height ? height * 4 : 120);
      return <Image source={{ uri: url }} style={[style, { width: fallbackWidth, height }]} resizeMode="contain" />;
    }
    return <Image source={{ uri: url }} style={[style, { width, height }]} resizeMode="contain" />;
  };

  switch (element.type) {
    case 'heading': {
      const headingStyles = [
        element.level === 1 ? styles.h1 : element.level === 2 ? styles.h2 : styles.h3,
        { color: textColor },
      ];
      return (
        <View style={[styles.headingContainer, element.level <= 2 && styles.headingBorder]}>
          <Text style={headingStyles}>{element.text}</Text>
        </View>
      );
    }

    case 'paragraph':
      return (
        <Markdown
          style={{
            body: { color: textColor, fontSize: 16, lineHeight: 24 },
            link: { color: Colors.primary, textDecorationLine: 'underline' },
            strong: { fontWeight: 'bold' },
            em: { fontStyle: 'italic' },
            code_inline: {
              backgroundColor: isDark ? '#334155' : '#E2E8F0',
              color: textColor,
              fontFamily: 'monospace',
            },
          }}
        >
          {element.text || ''}
        </Markdown>
      );

    case 'code':
    case 'codeBlock':
      return <CodeBlockPreview element={element} isDark={isDark} />;

    case 'blockquote':
      return (
        <View style={[styles.blockquote, { borderLeftColor: isDark ? '#334155' : '#CBD5F5' }]}>
          <Text style={[styles.blockquoteText, { color: textColor }]}>{element.text}</Text>
        </View>
      );

    case 'list': {
      const items = element.items || [];
      const ordered = element.isOrdered;
      return (
        <View style={styles.list}>
          {items.map((item, index) => (
            <View key={`${element.id}-item-${index}`} style={styles.listItem}>
              <Text style={[styles.listBullet, { color: textColor }]}>
                {ordered ? `${index + 1}.` : '-'}
              </Text>
              <Text style={[styles.listText, { color: textColor }]}>{item}</Text>
            </View>
          ))}
        </View>
      );
    }

    case 'taskList': {
      const items = Array.isArray(element.items) ? element.items : [];
      return (
        <View style={styles.list}>
          {items.map((item, index) => {
            const checked = typeof item === 'string' ? false : !!item?.checked;
            const text = typeof item === 'string' ? item : item?.text;
            return (
              <View key={`${element.id}-task-${index}`} style={styles.listItem}>
                <Icon
                  name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={18}
                  color={isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight}
                  style={styles.taskIcon}
                />
                <Text
                  style={[
                    styles.listText,
                    {
                      color: textColor,
                      textDecorationLine: checked ? 'line-through' : 'none',
                      opacity: checked ? 0.78 : 1,
                    },
                  ]}
                >
                  {text}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }

    case 'table': {
      const headers = element.headers || [];
      const rows = element.rows || [];
      return (
        <View style={[styles.table, { borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
          {headers.length > 0 && (
            <View style={[styles.tableRow, styles.tableHeaderRow, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
              {headers.map((header, index) => (
                <Text key={`${element.id}-header-${index}`} style={[styles.tableHeaderCell, { color: textColor }]}>
                  {header}
                </Text>
              ))}
            </View>
          )}
          {rows.map((row, rowIndex) => (
            <View key={`${element.id}-row-${rowIndex}`} style={styles.tableRow}>
              {row.map((cell, cellIndex) => (
                <Text key={`${element.id}-cell-${rowIndex}-${cellIndex}`} style={[styles.tableCell, { color: textColor }]}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    }

    case 'image':
      return (
        <View style={styles.imageContainer}>
          {renderImage(element.url || '', element.width || '100%', 200, { borderRadius: 8 })}
          {element.altText && <Text style={styles.altText}>{element.altText}</Text>}
        </View>
      );

    case 'badge':
      return (
        <View style={styles.row}>
          {element.targetUrl ? (
            <TouchableOpacity onPress={() => Linking.openURL(element.targetUrl)} activeOpacity={0.8}>
              {renderBadge(element.imageUrl, 28)}
            </TouchableOpacity>
          ) : (
            renderBadge(element.imageUrl, 28)
          )}
        </View>
      );

    case 'icon': {
      if (element.url) {
        return <View style={styles.iconContainer}>{renderImage(element.url, element.size || 40, element.size || 40)}</View>;
      }
      return (
        <View style={[styles.iconPlaceholder, { borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
          <Text style={[styles.iconPlaceholderText, { color: textColor }]}>{element.name || 'Icon'}</Text>
        </View>
      );
    }

    case 'button':
    case 'linkButton':
      return (
        <TouchableOpacity
          style={[styles.linkButton, { backgroundColor: Colors.primary }]}
          onPress={() => element.url && Linking.openURL(element.url)}
          activeOpacity={0.8}
        >
          <Text style={styles.linkButtonText}>{element.text || 'Open Link'}</Text>
        </TouchableOpacity>
      );

    case 'embed':
    case 'youtube':
    case 'codepen':
    case 'gist': {
      const label = (element.typeName || element.provider || element.type || 'embed').toUpperCase();
      return (
        <TouchableOpacity
          style={[styles.embedCard, { borderColor: isDark ? '#334155' : '#E2E8F0', backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}
          onPress={() => element.url && Linking.openURL(element.url)}
          activeOpacity={0.8}
        >
          <Text style={[styles.embedLabel, { color: Colors.primary }]}>{label}</Text>
          <Text style={[styles.embedUrl, { color: textColor }]} numberOfLines={1}>
            {element.url || 'Paste a link to embed'}
          </Text>
        </TouchableOpacity>
      );
    }

    case 'divider':
      return <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />;

    case 'socials': {
      const profiles = element.profiles || [];
      if (!profiles.length) {
        return <Text style={{ color: textColor }}>Add social profiles to display badges.</Text>;
      }
      return (
        <View style={styles.row}>
          {profiles.map((profile, index) => {
            const badgeUrl = SocialPlatforms.getBadgeUrl(profile.platform, element.style);
            const targetUrl = SocialPlatforms.getTargetUrl(profile.platform, profile.username);
            return (
              <TouchableOpacity key={`${element.id}-social-${index}`} onPress={() => targetUrl && Linking.openURL(targetUrl)} activeOpacity={0.8}>
                {renderBadge(badgeUrl, 22)}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    case 'githubStats': {
      const repo = element.repoName || '';
      const badges = [];
      if (repo) {
        if (element.showStars) badges.push({ url: `https://img.shields.io/github/stars/${repo}?style=social`, link: `https://github.com/${repo}` });
        if (element.showForks) badges.push({ url: `https://img.shields.io/github/forks/${repo}?style=social`, link: `https://github.com/${repo}/network/members` });
        if (element.showIssues) badges.push({ url: `https://img.shields.io/github/issues/${repo}`, link: `https://github.com/${repo}/issues` });
        if (element.showLicense) badges.push({ url: `https://img.shields.io/github/license/${repo}`, link: `https://github.com/${repo}/blob/master/LICENSE` });
      }
      if (!badges.length) {
        return <Text style={{ color: textColor }}>Set a repository to display stats.</Text>;
      }
      return (
        <View style={styles.row}>
          {badges.map((badge, index) => (
            <TouchableOpacity key={`${element.id}-stat-${index}`} onPress={() => badge.link && Linking.openURL(badge.link)} activeOpacity={0.8}>
              {renderBadge(badge.url, 22)}
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    case 'contributors': {
      if (!element.repoName) {
        return <Text style={{ color: textColor }}>Add a repository to show contributors.</Text>;
      }
      const imageUrl = `https://contrib.rocks/image?repo=${element.repoName}`;
      return (
        <TouchableOpacity onPress={() => Linking.openURL(`https://github.com/${element.repoName}/graphs/contributors`)} activeOpacity={0.9}>
          {renderImage(imageUrl, '100%', 120, styles.contributorsImage)}
        </TouchableOpacity>
      );
    }

    case 'mermaid':
      return (
        <View style={[styles.codeContainer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
          <View style={styles.codeHeader}>
            <View style={[styles.dot, { backgroundColor: '#4ADE80' }]} />
            <Text style={styles.codeLang}>MERMAID</Text>
          </View>
          <Text style={[styles.codeText, { color: textColor }]}>{element.code}</Text>
        </View>
      );

    case 'toc':
      return <TocPreview element={element} isDark={isDark} textColor={textColor} allElements={allElements} />;

    case 'collapsible':
      return <CollapsiblePreview element={element} isDark={isDark} textColor={textColor} />;

    case 'dynamicWidget': {
      const widgetType = element.widgetType || 'widget';
      let url = '';
      let height = 120;
      if (widgetType === 'spotify') {
        url = `https://spotify-github-profile.vercel.app/api/view?uid=${element.identifier}&cover_image=true&theme=${element.theme || 'default'}&show_offline=true&background_color=121212&interchange=true&bar_color=53b14f&bar_color_cover=false`;
        height = 120;
      } else if (widgetType === 'youtube') {
        url = `https://github-readme-youtube-cards.vercel.app/?channel_id=${element.identifier}&theme=${element.theme || 'default'}`;
        height = 120;
      } else if (widgetType === 'medium') {
        url = `https://github-readme-medium-recent-article.vercel.app/medium/@${element.identifier}/0`;
        height = 90;
      } else if (widgetType === 'activity') {
        url = `https://activity-graph.herokuapp.com/graph?username=${element.identifier}&theme=${element.theme || 'default'}`;
        height = 180;
      }
      if (!url) {
        return <Text style={{ color: textColor }}>Configure widget details to render preview.</Text>;
      }
      return <View style={styles.widgetContainer}>{renderImage(url, '100%', height, styles.widgetImage)}</View>;
    }

    case 'raw':
      return (
        <View style={[styles.rawContainer, { borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
          <Text style={[styles.rawTitle, { color: textColor }]}>Raw HTML/CSS</Text>
          <Text style={[styles.rawContent, { color: textColor }]} numberOfLines={6}>
            {element.content || 'No content provided.'}
          </Text>
        </View>
      );

    default:
      return <Text style={{ color: 'red' }}>Unsupported Element: {element.type}</Text>;
  }
};

const styles = StyleSheet.create({
  headingContainer: { marginVertical: 10, paddingBottom: 4 },
  headingBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.2)' },
  h1: { fontSize: 32, fontWeight: '800' },
  h2: { fontSize: 24, fontWeight: '700' },
  h3: { fontSize: 20, fontWeight: '600' },
  codeContainer: { borderRadius: 8, overflow: 'hidden', marginVertical: 12, borderWidth: 1, borderColor: 'rgba(150,150,150,0.1)' },
  codeHeader: { flexDirection: 'row', padding: 10, alignItems: 'center', backgroundColor: 'rgba(150,150,150,0.05)' },
  codeDots: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  codeLang: { flex: 1, textAlign: 'right', fontSize: 10, fontWeight: 'bold', color: 'grey' },
  codeCopyBtn: { marginLeft: 8 },
  codeText: { padding: 16, fontFamily: 'monospace', fontSize: 14 },
  imageContainer: { marginVertical: 12 },
  altText: { fontSize: 12, color: 'grey', marginTop: 4, textAlign: 'center' },
  badge: { marginRight: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  divider: { height: 2, width: '100%', marginVertical: 16 },
  blockquote: { borderLeftWidth: 3, paddingLeft: 12, marginVertical: 12 },
  blockquoteText: { fontSize: 16, fontStyle: 'italic' },
  list: { marginVertical: 8 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  listBullet: { width: 22, fontSize: 16, lineHeight: 22 },
  listText: { flex: 1, fontSize: 16, lineHeight: 22 },
  taskIcon: { width: 22, marginTop: 2 },
  table: { borderWidth: 1, borderRadius: 8, overflow: 'hidden', marginVertical: 12 },
  tableRow: { flexDirection: 'row' },
  tableHeaderRow: { borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.2)' },
  tableHeaderCell: { flex: 1, fontSize: 12, fontWeight: '700', padding: 10 },
  tableCell: { flex: 1, fontSize: 13, padding: 10 },
  iconContainer: { marginVertical: 8, alignItems: 'center' },
  iconPlaceholder: { borderWidth: 1, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, alignSelf: 'flex-start' },
  iconPlaceholderText: { fontSize: 13, fontWeight: '600' },
  linkButton: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginVertical: 8 },
  linkButtonText: { color: '#fff', fontWeight: 'bold' },
  embedCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginVertical: 10 },
  embedLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  embedUrl: { fontSize: 14 },
  contributorsImage: { borderRadius: 10 },
  tocContainer: { marginVertical: 8 },
  tocTitle: { fontSize: 14, fontWeight: '800', marginBottom: 6 },
  tocItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  tocItem: { fontSize: 13, marginLeft: 6 },
  collapsible: { borderWidth: 1, borderRadius: 10, padding: 12, marginVertical: 8 },
  collapsibleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  collapsibleTitle: { fontSize: 14, fontWeight: '800', flex: 1, marginRight: 10 },
  collapsibleContent: { fontSize: 13, lineHeight: 20 },
  widgetContainer: { marginVertical: 8 },
  widgetImage: { borderRadius: 10 },
  rawContainer: { borderWidth: 1, borderRadius: 10, padding: 12, marginVertical: 8 },
  rawTitle: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  rawContent: { fontSize: 12, lineHeight: 18 },
});

export default ElementRenderer;
