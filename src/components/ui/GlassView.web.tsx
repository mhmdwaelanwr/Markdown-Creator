import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

type GlassTone = 'dark' | 'light';

type GlassViewProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: GlassTone;
  blur?: number;
};

export default function GlassView({ children, style, tone = 'dark', blur = 18 }: GlassViewProps) {
  const backgroundColor =
    tone === 'dark' ? 'rgba(15, 23, 42, 0.56)' : 'rgba(255, 255, 255, 0.72)';
  const borderColor =
    tone === 'dark' ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.10)';

  return (
    <View
      style={[
        {
          backgroundColor,
          borderWidth: 1,
          borderColor,
          overflow: 'hidden',
          backdropFilter: `blur(${blur}px) saturate(180%)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
        } as ViewStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

