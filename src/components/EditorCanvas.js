import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, useWindowDimensions, Pressable, Platform } from 'react-native';
import Svg, { Defs, Pattern, Rect, Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useProject } from '../context/ProjectContext';
import CanvasItem from './CanvasItem';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import WebDnDBox from './WebDnDBox';
import GlassView from './ui/GlassView';
import ActionIconButton from './ui/ActionIconButton';
import InlineNotice from './ui/InlineNotice';

const EditorCanvas = ({ isDark, notice }) => {
  const { t } = useTranslation();
  const {
    elements,
    selectedElementId,
    clearElements,
    undo,
    redo,
    removeElement,
    reorderElements,
    showGrid,
    toggleGrid,
    deviceMode,
    setSelectedElementId,
    dragPayload,
    addElement,
    addSnippet,
    endDrag,
  } = useProject();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const [isDragOver, setIsDragOver] = useState(false);
  const glassTone = isDark ? 'dark' : 'light';
  const isCompactUi = deviceMode === 'mobile' || width < 520;

  let maxWidth = 850;
  let minHeight = 500;
  let borderRadius = 20;
  let canvasPadding = 24;

  if (deviceMode === 'tablet') {
    maxWidth = 600;
    minHeight = 800;
    borderRadius = 24;
  } else if (deviceMode === 'mobile') {
    maxWidth = 375;
    minHeight = 667;
    borderRadius = 32;
    canvasPadding = 16;
  }

  const safeWidth = Math.min(maxWidth, Math.max(240, width - 48));
  const noticeWidthStyle = { width: '90%', maxWidth: safeWidth };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="auto-awesome-mosaic" size={80} color={Colors.primary} opacity={0.5} />
      <Text style={[styles.emptyTitle, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
        {t('startMasterpiece')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
        {t('startMasterpieceHint')}
      </Text>
    </View>
  );

  const handleCanvasDragOver = (event) => {
    if (!isWeb) return;
    event?.preventDefault?.();
    setIsDragOver(true);
  };

  const handleCanvasDragLeave = () => {
    if (!isWeb) return;
    setIsDragOver(false);
  };

  const getPayloadFromEvent = (event) => {
    const dataTransfer = event?.dataTransfer || event?.nativeEvent?.dataTransfer;
    const raw = dataTransfer?.getData?.('text/plain');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const handleCanvasDrop = (event) => {
    if (!isWeb) return;
    event?.preventDefault?.();
    setIsDragOver(false);

    const payload = getPayloadFromEvent(event) || dragPayload;
    if (!payload) return;

    if (payload.kind === 'element') {
      addElement(payload.elementType);
    } else if (payload.kind === 'snippet') {
      addSnippet(payload.snippet);
    } else if (payload.kind === 'canvas') {
      const fromIndex = elements.findIndex((el) => el.id === payload.elementId);
      if (fromIndex >= 0 && elements.length > 0) {
        reorderElements(fromIndex, elements.length - 1);
      }
    }

    endDrag();
  };

  const canvasDragProps = isWeb
    ? {
        onDragOver: handleCanvasDragOver,
        onDragLeave: handleCanvasDragLeave,
        onDrop: handleCanvasDrop,
      }
    : {};

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.editorBackgroundDark : Colors.editorBackgroundLight }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingVertical: isCompactUi ? 72 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {notice?.message ? (
          <View style={[styles.noticeWrap, noticeWidthStyle]}>
            <InlineNotice
              isDark={isDark}
              variant="info"
              icon={notice.icon || 'information-outline'}
              message={notice.message}
              actionLabel={notice.actionLabel}
              onAction={notice.onAction}
            />
          </View>
        ) : null}
        <WebDnDBox
        testID="editor-canvas-dropzone"
        style={[
          styles.canvas,
          isDragOver && styles.canvasDragOver,
          {
            backgroundColor: isDark ? Colors.canvasBackgroundDark : Colors.canvasBackgroundLight,
            maxWidth: safeWidth,
            minHeight,
            borderRadius,
            padding: canvasPadding,
          },
        ]}
        {...canvasDragProps}
        >
          {showGrid && (
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
              <Defs>
                <Pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <Circle cx="1" cy="1" r="1" fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} />
                </Pattern>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#grid)" />
            </Svg>
          )}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedElementId(null)} />
          {elements.length === 0 ? (
            renderEmptyState()
          ) : (
            elements.map((item) => (
              <CanvasItem
                key={item.id}
                element={item}
                allElements={elements}
                isSelected={item.id === selectedElementId}
                isDark={isDark}
              />
            ))
          )}
        </WebDnDBox>
      </ScrollView>

      {/* Floating Toolbar */}
      <GlassView
        tone={glassTone}
        style={[
          styles.toolbar,
          isCompactUi ? styles.toolbarBottom : styles.toolbarTop,
          {
            borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
          },
        ]}
      >
        <ActionIconButton icon="undo" onPress={undo} isDark={isDark} accessibilityLabel="Undo" />
        <ActionIconButton icon="redo" onPress={redo} isDark={isDark} accessibilityLabel="Redo" />
        <View style={styles.divider} />
        <ActionIconButton
          icon="delete-sweep"
          onPress={() => selectedElementId && removeElement(selectedElementId)}
          disabled={!selectedElementId}
          isDark={isDark}
          color={selectedElementId ? Colors.error : (isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight)}
          accessibilityLabel="Delete selected"
        />
        <ActionIconButton icon="grid" onPress={toggleGrid} active={showGrid} isDark={isDark} accessibilityLabel="Grid" />
        <View style={styles.divider} />
        <ActionIconButton icon="delete-forever" onPress={clearElements} isDark={isDark} color={Colors.warning} accessibilityLabel="Clear canvas" />
      </GlassView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { alignItems: 'center' },
  noticeWrap: { marginBottom: 14 },
  canvas: {
    width: '90%',
    minHeight: 500,
    borderRadius: 32,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
  },
  canvasDragOver: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 32 },
  emptySubtitle: { color: 'grey', marginTop: 8 },
  toolbar: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 24,
    elevation: 5,
    shadowOpacity: 0.1,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.1)',
  },
  toolbarTop: { top: 20 },
  toolbarBottom: { bottom: 18 },
  divider: { width: 1, height: 20, backgroundColor: 'rgba(150,150,150,0.2)', marginHorizontal: 8, alignSelf: 'center' }
});

export default EditorCanvas;
