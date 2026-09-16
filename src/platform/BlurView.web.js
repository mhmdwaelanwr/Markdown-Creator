import React from 'react';
import { View } from 'react-native';

export const BlurView = ({
  style,
  blurType,
  blurAmount,
  reducedTransparencyFallbackColor,
  ...rest
}) => (
  <View
    {...rest}
    style={[
      style,
      {
        backgroundColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      },
    ]}
  />
);
