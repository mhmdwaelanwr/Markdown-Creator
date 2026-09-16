import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';

type SoftButtonProps = {
  label: string;
  icon?: string;
  onPress?: () => void;
  disabled?: boolean;
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function SoftButton({
  label,
  icon,
  onPress,
  disabled = false,
  isDark = false,
  style,
}: SoftButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [hovered, setHovered] = useState(false);

  const backgroundColor = hovered
    ? isDark
      ? 'rgba(148,163,184,0.14)'
      : 'rgba(15,23,42,0.06)'
    : isDark
      ? 'rgba(148,163,184,0.10)'
      : 'rgba(15,23,42,0.045)';

  const borderColor = isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)';
  const textColor = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 26, bounciness: 0 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 5 }).start();
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
      style={[{ opacity: disabled ? 0.55 : 1, alignSelf: 'flex-start' }, style]}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          borderRadius: 12,
          borderWidth: 1,
          borderColor,
          backgroundColor,
          paddingHorizontal: 14,
          paddingVertical: 10,
          ...(Platform.OS === 'web' ? ({ cursor: disabled ? 'not-allowed' : 'pointer' } as any) : null),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon ? <Icon name={icon} size={16} color={textColor} /> : null}
          <Text
            style={{
              color: textColor,
              fontWeight: '900',
              fontSize: 12,
              letterSpacing: 0.8,
              marginLeft: icon ? 8 : 0,
            }}
          >
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

