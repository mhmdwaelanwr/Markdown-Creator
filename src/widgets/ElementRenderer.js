// ElementRenderer for React Native (stub)
import React from 'react';
import { View, Text } from 'react-native';

export default function ElementRenderer({ element }) {
  // TODO: Render different element types (Heading, Paragraph, Badge, etc.)
  return (
    <View>
      <Text>Render: {element?.type}</Text>
    </View>
  );
}
