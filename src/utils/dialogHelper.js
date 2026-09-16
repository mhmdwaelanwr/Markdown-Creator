// Dialog helpers for React Native
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export function showDialog(visible, onClose, title, content, actions = []) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.content}>{content}</View>
          <View style={styles.actions}>
            {actions.map((action, idx) => (
              <TouchableOpacity key={idx} onPress={action.onPress} style={styles.button}>
                <Text style={styles.buttonText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    borderRadius: 16,
    padding: 24,
    minWidth: 280,
    maxWidth: '90%',
    elevation: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 12,
  },
  content: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

// GlassCard and DialogHeader can be implemented as custom components if needed
