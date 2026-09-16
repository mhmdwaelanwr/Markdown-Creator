// StyledDialog component for React Native
import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';

export default function StyledDialog({ visible, onClose, title, content, actions = [], width = 320, height, contentPadding = 24 }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { width, height }]}> 
          {title}
          <View style={{ padding: contentPadding }}>{content}</View>
          {actions.length > 0 && <View style={styles.actions}>{actions}</View>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(33,150,243,0.1)',
    elevation: 8,
    maxHeight: '85%',
    maxWidth: '90%',
    paddingBottom: 0,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
});
