import React, { useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';

type ButtonTone = 'primary' | 'secondary' | 'danger';

type PrimaryButtonProps = {
  label: string;
  icon?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: ButtonTone;
  style?: StyleProp<ViewStyle>;
};

const toneStyles = (tone: ButtonTone) => {
  if (tone === 'secondary') {
    return { backgroundColor: Colors.secondary, borderColor: 'rgba(16, 185, 129, 0.35)' };
  }
  if (tone === 'danger') {
    return { backgroundColor: Colors.error, borderColor: 'rgba(239, 68, 68, 0.35)' };
  }
  return { backgroundColor: Colors.primary, borderColor: 'rgba(99, 102, 241, 0.35)' };
};

export default function PrimaryButton({
  label,
  icon,
  onPress,
  disabled = false,
  loading = false,
  tone = 'primary',
  style,
}: PrimaryButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [hovered, setHovered] = useState(false);
  const { backgroundColor, borderColor } = toneStyles(tone);
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 26, bounciness: 0 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 5 }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
      style={[{ opacity: isDisabled ? 0.55 : 1, alignSelf: 'flex-start' }, style]}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          borderRadius: 12,
          borderWidth: 1,
          borderColor: hovered ? 'rgba(255,255,255,0.22)' : borderColor,
          backgroundColor,
          paddingHorizontal: 14,
          paddingVertical: 10,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
          ...(Platform.OS === 'web' ? { cursor: isDisabled ? 'not-allowed' : 'pointer' } : null),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : icon ? <Icon name={icon} size={16} color="#FFFFFF" /> : null}
          <Text
            style={{
              color: '#FFFFFF',
              fontWeight: '900',
              fontSize: 12,
              letterSpacing: 1,
              marginLeft: loading || icon ? 8 : 0,
            }}
          >
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}
