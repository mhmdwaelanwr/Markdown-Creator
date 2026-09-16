import React, { useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';

type ActionIconButtonProps = {
  icon: string;
  onPress?: () => void;
  active?: boolean;
  disabled?: boolean;
  isDark?: boolean;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export default function ActionIconButton({
  icon,
  onPress,
  active = false,
  disabled = false,
  isDark = false,
  size = 18,
  color,
  style,
  accessibilityLabel,
}: ActionIconButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [hovered, setHovered] = useState(false);

  const iconColor = useMemo(() => {
    if (color) return color;
    if (active) return Colors.primary;
    return isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;
  }, [active, color, isDark]);

  const chrome = useMemo(() => {
    if (active) {
      return {
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.16)' : 'rgba(99, 102, 241, 0.12)',
        borderColor: isDark ? 'rgba(129, 140, 248, 0.30)' : 'rgba(99, 102, 241, 0.22)',
      };
    }
    if (hovered) {
      return {
        backgroundColor: isDark ? 'rgba(148, 163, 184, 0.10)' : 'rgba(15, 23, 42, 0.06)',
        borderColor: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.10)',
      };
    }
    return { backgroundColor: 'transparent', borderColor: 'transparent' };
  }, [active, hovered, isDark]);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 28, bounciness: 0 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
      style={[
        {
          opacity: disabled ? 0.45 : 1,
          borderRadius: 12,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            width: 34,
            height: 34,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            transform: [{ scale }],
            ...(Platform.OS === 'web' ? { cursor: disabled ? 'not-allowed' : 'pointer' } : null),
          },
          chrome,
        ]}
      >
        <Icon name={icon} size={size} color={iconColor} />
      </Animated.View>
    </Pressable>
  );
}

