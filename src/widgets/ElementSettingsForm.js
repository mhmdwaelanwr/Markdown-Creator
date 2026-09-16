import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import { useProject } from '../context/ProjectContext';
import { SocialPlatforms } from '../constants/SocialPlatforms';
import { DevIcons } from '../constants/DevIcons';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';

const Section = ({ title, children }) => {
  const isDark = useIsDark();
  const borderColor = isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)';
  const backgroundColor = isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)';
  const titleColor = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;

  return (
    <View style={[styles.section, { borderColor, backgroundColor }]}>
      <Text style={[styles.sectionTitle, { color: titleColor }]}>{title}</Text>
      {children}
    </View>
  );
};

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  autoCapitalize,
  autoCorrect,
  keyboardType,
}) => {
  const isDark = useIsDark();
  const placeholderTextColor = isDark ? 'rgba(226,232,240,0.45)' : 'rgba(15,23,42,0.45)';

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? 'rgba(2,6,23,0.35)' : 'rgba(255,255,255,0.80)',
            borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)',
            color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight,
          },
          multiline && styles.textArea,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        keyboardType={keyboardType}
      />
    </View>
  );
};

const Toggle = ({ label, value, onValueChange }) => {
  const isDark = useIsDark();
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.label, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={Colors.primary}
        trackColor={{
          false: isDark ? 'rgba(148,163,184,0.22)' : 'rgba(148,163,184,0.34)',
          true: 'rgba(99,102,241,0.55)',
        }}
      />
    </View>
  );
};

export default function ElementSettingsForm({ element }) {
  const { updateElementById } = useProject();
  const [socialDraft, setSocialDraft] = useState('');
  const type = element?.type;

  const socialHint = useMemo(() => {
    const supported = Object.keys(SocialPlatforms.platforms || {}).slice(0, 5).join(', ');
    return `platform:username (e.g. GitHub:octocat). Supported: ${supported}`;
  }, []);

  if (!element) return null;

  const update = (patch) => updateElementById(element.id, patch);

  if (type === 'heading') {
    return (
      <Section title="Heading">
        <Field label="Text" value={element.text || ''} onChangeText={(text) => update({ text })} placeholder="Heading text" />
        <View style={styles.levelRow}>
          {[1, 2, 3].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => update({ level })}
              style={[
                styles.levelBtn,
                element.level === level && styles.levelBtnActive,
                Platform.OS === 'web' ? { cursor: 'pointer' } : null,
              ]}
            >
              <Text style={[styles.levelText, element.level === level && styles.levelTextActive]}>H{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>
    );
  }

  if (type === 'paragraph' || type === 'blockquote') {
    return (
      <Section title={type === 'blockquote' ? 'Blockquote' : 'Paragraph'}>
        <Field
          label="Text"
          value={element.text || ''}
          onChangeText={(text) => update({ text })}
          placeholder="Write content..."
          multiline
        />
      </Section>
    );
  }

  if (type === 'image') {
    return (
      <Section title="Image">
        <Field label="Image URL" value={element.url || ''} onChangeText={(url) => update({ url })} placeholder="https://..." />
        <Field label="Alt Text" value={element.altText || ''} onChangeText={(altText) => update({ altText })} placeholder="Image description" />
        <Field
          label="Width (px)"
          value={element.width ? String(element.width) : ''}
          onChangeText={(val) => update({ width: Number.parseInt(val, 10) || null })}
          placeholder="Optional"
        />
      </Section>
    );
  }

  if (type === 'linkButton' || type === 'button') {
    return (
      <Section title="Button">
        <Field label="Label" value={element.text || ''} onChangeText={(text) => update({ text })} placeholder="Button text" />
        <Field label="URL" value={element.url || ''} onChangeText={(url) => update({ url })} placeholder="https://..." />
      </Section>
    );
  }

  if (type === 'code' || type === 'codeBlock') {
    return (
      <Section title="Code Block">
        <Field label="Language" value={element.language || ''} onChangeText={(language) => update({ language })} placeholder="javascript" />
        <Field label="Code" value={element.code || ''} onChangeText={(code) => update({ code })} placeholder="Your code..." multiline />
      </Section>
    );
  }

  if (type === 'list') {
    const itemsText = (element.items || []).join('\n');
    return (
      <Section title="List">
        <Field
          label="Items (one per line)"
          value={itemsText}
          onChangeText={(text) => update({ items: text.split('\n').filter((line) => line.trim().length > 0) })}
          placeholder="Item 1"
          multiline
        />
        <Toggle label="Ordered List" value={!!element.isOrdered} onValueChange={(isOrdered) => update({ isOrdered })} />
      </Section>
    );
  }

  if (type === 'taskList') {
    const tasksText = (element.items || [])
      .map((item) => {
        if (typeof item === 'string') return `[ ] ${item}`;
        return `${item.checked ? '[x]' : '[ ]'} ${item.text || ''}`;
      })
      .join('\n');

    return (
      <Section title="Task List">
        <Field
          label="Tasks (one per line)"
          value={tasksText}
          onChangeText={(text) => {
            const items = (text || '')
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => {
                const match = line.match(/^(?:[-*+]\\s+)?\\[(x| )\\]\\s*(.*)$/i);
                if (match) {
                  return { checked: match[1].toLowerCase() === 'x', text: (match[2] || '').trim() };
                }
                return { checked: false, text: line };
              })
              .filter((item) => item.text.length > 0);
            update({ items });
          }}
          placeholder="[ ] Write docs"
          multiline
          autoCorrect={false}
          autoCapitalize="sentences"
        />
      </Section>
    );
  }

  if (type === 'table') {
    const headersText = (element.headers || []).join(', ');
    const rowsText = (element.rows || []).map((row) => row.join(', ')).join('\n');
    const alignText = (element.alignments || []).join(', ');
    return (
      <Section title="Table">
        <Field
          label="Headers (comma separated)"
          value={headersText}
          onChangeText={(text) => update({ headers: text.split(',').map((h) => h.trim()).filter(Boolean) })}
          placeholder="Name, Description"
        />
        <Field
          label="Rows (comma separated per line)"
          value={rowsText}
          onChangeText={(text) =>
            update({
              rows: text
                .split('\n')
                .filter((line) => line.trim().length > 0)
                .map((line) => line.split(',').map((cell) => cell.trim())),
            })
          }
          placeholder="Cell1, Cell2"
          multiline
        />
        <Field
          label="Alignments (left, center, right)"
          value={alignText}
          onChangeText={(text) =>
            update({
              alignments: text
                .split(',')
                .map((val) => val.trim())
                .filter(Boolean),
            })
          }
          placeholder="left, left"
        />
      </Section>
    );
  }

  if (type === 'badge') {
    return (
      <Section title="Badge">
        <Field label="Label" value={element.label || ''} onChangeText={(label) => update({ label })} placeholder="Badge label" />
        <Field label="Image URL" value={element.imageUrl || ''} onChangeText={(imageUrl) => update({ imageUrl })} placeholder="https://img.shields.io/..." />
        <Field label="Target URL" value={element.targetUrl || ''} onChangeText={(targetUrl) => update({ targetUrl })} placeholder="https://..." />
        <Field label="Style" value={element.badgeStyle || ''} onChangeText={(badgeStyle) => update({ badgeStyle })} placeholder="flat, for-the-badge" />
        <Field label="Badge Label" value={element.badgeLabel || ''} onChangeText={(badgeLabel) => update({ badgeLabel })} placeholder="Label param" />
        <Field label="Badge Message" value={element.badgeMessage || ''} onChangeText={(badgeMessage) => update({ badgeMessage })} placeholder="Message param" />
        <Field label="Badge Color" value={element.badgeColor || ''} onChangeText={(badgeColor) => update({ badgeColor })} placeholder="blue" />
      </Section>
    );
  }

  if (type === 'icon') {
    return (
      <Section title="Icon">
        <Field label="Name" value={element.name || ''} onChangeText={(name) => update({ name })} placeholder="React" />
        <Field
          label="Icon URL"
          value={element.url || ''}
          onChangeText={(url) => update({ url })}
          placeholder={DevIcons.icons?.React || 'https://...'}
        />
        <Field label="Size" value={element.size ? String(element.size) : ''} onChangeText={(val) => update({ size: Number.parseInt(val, 10) || 40 })} placeholder="40" />
      </Section>
    );
  }

  if (type === 'embed' || type === 'youtube' || type === 'codepen' || type === 'gist') {
    return (
      <Section title="Embed">
        <Field label="Type" value={element.typeName || element.provider || ''} onChangeText={(typeName) => update({ typeName })} placeholder="youtube" />
        <Field label="URL" value={element.url || ''} onChangeText={(url) => update({ url })} placeholder="https://..." />
      </Section>
    );
  }

  if (type === 'githubStats') {
    return (
      <Section title="GitHub Stats">
        <Field label="Repo (user/name)" value={element.repoName || ''} onChangeText={(repoName) => update({ repoName })} placeholder="user/repo" />
        <Toggle label="Show Stars" value={!!element.showStars} onValueChange={(showStars) => update({ showStars })} />
        <Toggle label="Show Forks" value={!!element.showForks} onValueChange={(showForks) => update({ showForks })} />
        <Toggle label="Show Issues" value={!!element.showIssues} onValueChange={(showIssues) => update({ showIssues })} />
        <Toggle label="Show License" value={!!element.showLicense} onValueChange={(showLicense) => update({ showLicense })} />
      </Section>
    );
  }

  if (type === 'contributors') {
    return (
      <Section title="Contributors">
        <Field label="Repo (user/name)" value={element.repoName || ''} onChangeText={(repoName) => update({ repoName })} placeholder="user/repo" />
        <Field label="Style" value={element.style || ''} onChangeText={(style) => update({ style })} placeholder="avatar" />
      </Section>
    );
  }

  if (type === 'mermaid') {
    return (
      <Section title="Mermaid Diagram">
        <Field label="Code" value={element.code || ''} onChangeText={(code) => update({ code })} placeholder="graph TD; A-->B;" multiline />
      </Section>
    );
  }

  if (type === 'toc') {
    return (
      <Section title="Table of Contents">
        <Field label="Title" value={element.title || ''} onChangeText={(title) => update({ title })} placeholder="Table of Contents" />
      </Section>
    );
  }

  if (type === 'socials') {
    const profilesText = (element.profiles || []).map((p) => `${p.platform}:${p.username}`).join('\n');
    return (
      <Section title="Social Links">
        <Field label="Style" value={element.style || ''} onChangeText={(style) => update({ style })} placeholder="for-the-badge" />
        <Field
          label="Profiles"
          value={profilesText}
          onChangeText={(text) => {
            const profiles = text
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => {
                const [platform, username] = line.split(':');
                return { platform: platform?.trim() || 'GitHub', username: username?.trim() || '' };
              });
            update({ profiles });
          }}
          placeholder={socialHint}
          multiline
        />
        <Field
          label="Quick Add"
          value={socialDraft}
          onChangeText={setSocialDraft}
          placeholder={socialHint}
        />
        <TouchableOpacity
          style={[styles.addButton, Platform.OS === 'web' ? { cursor: 'pointer' } : null]}
          onPress={() => {
            if (!socialDraft.trim()) return;
            const [platform, username] = socialDraft.split(':');
            const nextProfiles = [
              ...(element.profiles || []),
              { platform: platform?.trim() || 'GitHub', username: username?.trim() || '' },
            ];
            update({ profiles: nextProfiles });
            setSocialDraft('');
          }}
        >
          <Text style={styles.addButtonText}>Add Profile</Text>
        </TouchableOpacity>
      </Section>
    );
  }

  if (type === 'collapsible') {
    return (
      <Section title="Collapsible">
        <Field label="Summary" value={element.summary || ''} onChangeText={(summary) => update({ summary })} placeholder="Click to expand" />
        <Field label="Content" value={element.content || ''} onChangeText={(content) => update({ content })} placeholder="Hidden content" multiline />
      </Section>
    );
  }

  if (type === 'dynamicWidget') {
    return (
      <Section title="Dynamic Widget">
        <Field label="Widget Type" value={element.widgetType || ''} onChangeText={(widgetType) => update({ widgetType })} placeholder="spotify" />
        <Field label="Identifier" value={element.identifier || ''} onChangeText={(identifier) => update({ identifier })} placeholder="User ID / Channel ID" />
        <Field label="Theme" value={element.theme || ''} onChangeText={(theme) => update({ theme })} placeholder="default" />
      </Section>
    );
  }

  if (type === 'raw') {
    return (
      <Section title="Raw Markdown / HTML">
        <Field label="Content" value={element.content || ''} onChangeText={(content) => update({ content })} placeholder="<div>...</div>" multiline />
        <Field label="CSS" value={element.css || ''} onChangeText={(css) => update({ css })} placeholder="Optional CSS" multiline />
      </Section>
    );
  }

  return (
    <Section title="Element">
      <Text style={styles.label}>No editor available for this element type yet.</Text>
    </Section>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 14, borderWidth: 1, borderRadius: 16, padding: 14 },
  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 0.7, marginBottom: 10 },
  field: { marginBottom: 12 },
  label: { fontSize: 12, marginBottom: 6, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  textArea: { minHeight: 100 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  levelRow: { flexDirection: 'row' },
  levelBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginRight: 10 },
  levelBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  levelText: { fontSize: 12, fontWeight: '900' },
  levelTextActive: { color: '#FFFFFF' },
  addButton: { backgroundColor: Colors.primary, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12, letterSpacing: 0.3 },
});
