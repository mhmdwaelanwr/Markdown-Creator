import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import ConfirmDialog from './ConfirmDialog';
import { useProject } from '../context/ProjectContext';
import ElementRenderer from './ElementRenderer';
import { Colors } from '../constants/Colors';
import WebDnDBox from './WebDnDBox';
import GlassView from './ui/GlassView';
import ActionIconButton from './ui/ActionIconButton';

const CanvasItem = ({ element, isSelected, isDark, allElements }) => {
  const { setSelectedElementId, removeElement, moveElementUp, moveElementDown, duplicateElement, reorderElements, insertElement, insertSnippet, dragPayload, startDrag, endDrag } = useProject();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const isWeb = Platform.OS === 'web';

  const handleSelect = () => {
    setSelectedElementId(element.id);
  };

  const handleDragStart = (event) => {
    if (!isWeb) return;
    startDrag({ kind: 'canvas', elementId: element.id });
    const dataTransfer = event?.dataTransfer || event?.nativeEvent?.dataTransfer;
    try {
      dataTransfer?.setData('text/plain', JSON.stringify({ kind: 'canvas', elementId: element.id }));
      dataTransfer.effectAllowed = 'move';
    } catch (_) {
      // Ignore dataTransfer errors (not required for internal drag state)
    }
  };

  const handleDragEnd = () => {
    if (!isWeb) return;
    setIsDragOver(false);
    endDrag();
  };

  const handleDragOver = (event) => {
    if (!isWeb) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
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

  const handleDrop = (event) => {
    if (!isWeb) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setIsDragOver(false);

    const payload = getPayloadFromEvent(event) || dragPayload;
    if (!payload) return;

    const targetIndex = allElements.findIndex((el) => el.id === element.id);
    if (targetIndex < 0) return;

    if (payload.kind === 'element') {
      insertElement(targetIndex, payload.elementType);
    } else if (payload.kind === 'snippet') {
      insertSnippet(targetIndex, payload.snippet);
    } else if (payload.kind === 'canvas') {
      const fromIndex = allElements.findIndex((el) => el.id === payload.elementId);
      if (fromIndex < 0 || fromIndex === targetIndex) return;

      const insertIndex = fromIndex < targetIndex ? Math.max(0, targetIndex - 1) : targetIndex;
      reorderElements(fromIndex, insertIndex);
    }

    endDrag();
  };

  const webDnDProps = isWeb
    ? {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
      }
    : {};

  return (
    <WebDnDBox
      data-element-id={element.id}
      data-element-type={element.type}
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isDragOver && styles.dragOverContainer,
        { backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent' },
      ]}
      {...webDnDProps}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={handleSelect}>
        <View style={styles.content}>
          <ElementRenderer element={element} isDark={isDark} allElements={allElements} />
        </View>
      </TouchableOpacity>

      {isSelected && (
        <GlassView tone={isDark ? 'dark' : 'light'} style={[styles.actionToolbar, isDark && styles.actionToolbarDark]}>
          <ActionButton icon="chevron-up" onPress={() => moveElementUp(element.id)} isDark={isDark} />
          <ActionButton icon="chevron-down" onPress={() => moveElementDown(element.id)} isDark={isDark} />
          <View style={styles.divider} />
          <ActionButton icon="content-copy" onPress={() => duplicateElement(element.id)} isDark={isDark} />
          <ActionButton icon="trash-can-outline" color={Colors.error} onPress={() => setShowConfirm(true)} isDark={isDark} />
        </GlassView>
      )}

      <ConfirmDialog
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          removeElement(element.id);
          setShowConfirm(false);
        }}
        title="Delete Element"
        message="Are you sure you want to delete this element?"
      />
    </WebDnDBox>
  );
};

const ActionButton = ({ icon, onPress, color = Colors.primary, isDark }) => (
  <ActionIconButton icon={icon} onPress={onPress} color={color} isDark={isDark} size={18} style={styles.actionBtn} />
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedContainer: {
    borderColor: Colors.primary,
  },
  dragOverContainer: {
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  content: {
    padding: 20,
  },
  actionToolbar: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  actionToolbarDark: {
    borderColor: 'rgba(148,163,184,0.16)',
  },
  actionBtn: { marginHorizontal: 2 },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(150,150,150,0.2)',
    marginHorizontal: 4,
    alignSelf: 'center',
  },
});

export default CanvasItem;
