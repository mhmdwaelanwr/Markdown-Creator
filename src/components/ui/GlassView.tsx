import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';

type GlassTone = 'dark' | 'light';

type GlassViewProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: GlassTone;
  blurAmount?: number;
};

export default function GlassView({
  children,
  style,
  tone = 'dark',
  blurAmount = 18,
}: GlassViewProps) {
  const blurType = tone === 'dark' ? 'dark' : 'light';
  const borderColor =
    tone === 'dark' ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.10)';
  const fallbackColor = tone === 'dark' ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.86)';

  return (
    <BlurView
      blurType={blurType}
      blurAmount={blurAmount}
      reducedTransparencyFallbackColor={fallbackColor}
      style={[{ borderWidth: 1, borderColor, overflow: 'hidden' }, style]}
    >
      <View style={{ flex: 1 }}>{children}</View>
    </BlurView>
  );
}

