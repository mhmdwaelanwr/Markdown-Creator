import React from 'react';
import { unstable_createElement } from 'react-native';

export default function WebDnDBox({ children, ...props }) {
  return unstable_createElement('div', { ...props, children });
}
