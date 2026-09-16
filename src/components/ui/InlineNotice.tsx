import React from 'react';
import { I18nManager, Platform, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import GlassView from './GlassView';

export type InlineNoticeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type InlineNoticeDensity = 'regular' | 'compact';

export type InlineNoticeProps = {
  isDark: boolean;
  variant?: InlineNoticeVariant;
  icon?: string;
  iconSize?: number;
  showIcon?: boolean;
  title?: string;
  message: string;
  titleNumberOfLines?: number;
  messageNumberOfLines?: number;
  actionLabel?: string;
  onAction?: () => void;
  dismissLabel?: string;
  onDismiss?: () => void;
  accentColor?: string;
  showAccent?: boolean;
  density?: InlineNoticeDensity;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

const withAlpha = (hex: string, alpha: number) => {
  const clamped = Math.max(0, Math.min(1, alpha));
  const a = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return `${hex}${a}`;
  return hex;
};

const variantColor = (variant: InlineNoticeVariant) => {
  if (variant === 'success') return Colors.success;
  if (variant === 'warning') return Colors.warning;
  if (variant === 'danger') return Colors.error;
  if (variant === 'info') return Colors.info;
  return Colors.primary;
};

const variantIcon = (variant: InlineNoticeVariant) => {
  if (variant === 'success') return 'check-circle-outline';
  if (variant === 'warning') return 'alert-outline';
  if (variant === 'danger') return 'alert-circle-outline';
  if (variant === 'info') return 'information-outline';
  return 'information-outline';
};

export default function InlineNotice({
  isDark,
  variant = 'neutral',
  icon,
  iconSize = 16,
  showIcon = true,
  title,
  message,
  titleNumberOfLines = 1,
  messageNumberOfLines = 2,
  actionLabel,
  onAction,
  dismissLabel = 'Dismiss',
  onDismiss,
  accentColor,
  showAccent = true,
  density = 'regular',
  testID,
  style,
}: InlineNoticeProps) {
  const tone = isDark ? 'dark' : 'light';
  const isRtl = I18nManager.isRTL;
  const foreground = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;
  const subtle = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;
  const neutralAccent = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;
  const accent = accentColor ?? (variant === 'neutral' ? neutralAccent : variantColor(variant));

  const metrics = density === 'compact'
    ? {
        radius: 14,
        paddingX: 10,
        paddingY: 8,
        accentWidth: 3,
        iconBox: 28,
        iconRadius: 12,
        gap: 8,
        titleSize: 11,
        messageSize: 11,
        actionSize: 11,
      }
    : {
        radius: 16,
        paddingX: 12,
        paddingY: 10,
        accentWidth: 4,
        iconBox: 32,
        iconRadius: 14,
        gap: 10,
        titleSize: 12,
        messageSize: 12,
        actionSize: 12,
      };

  const borderColor = variant === 'neutral'
    ? isDark
      ? 'rgba(148,163,184,0.16)'
      : 'rgba(15,23,42,0.10)'
    : withAlpha(accent, isDark ? 0.28 : 0.22);

  const resolvedIcon = icon ?? variantIcon(variant);

  return (
    <GlassView
      tone={tone}
      style={[
        styles.wrap,
        {
          borderColor,
          flexDirection: isRtl ? 'row-reverse' : 'row',
          borderRadius: metrics.radius,
        },
        style,
      ]}
    >
      {showAccent ? <View style={{ width: metrics.accentWidth, backgroundColor: withAlpha(accent, 0.9) }} /> : null}
      <View
        testID={testID}
        style={[
          styles.inner,
          {
            flexDirection: isRtl ? 'row-reverse' : 'row',
            paddingHorizontal: metrics.paddingX,
            paddingVertical: metrics.paddingY,
          },
        ]}
      >
        {showIcon ? (
          <View
            style={[
              styles.iconWrap,
              {
                width: metrics.iconBox,
                height: metrics.iconBox,
                borderRadius: metrics.iconRadius,
                marginEnd: metrics.gap,
                backgroundColor: withAlpha(accent, isDark ? 0.18 : 0.12),
                borderColor: withAlpha(accent, isDark ? 0.22 : 0.16),
              },
            ]}
          >
            <Icon name={resolvedIcon} size={iconSize} color={accent} />
          </View>
        ) : null}

        <View style={styles.content}>
          {title ? (
            <Text
              style={[
                styles.title,
                {
                  color: foreground,
                  textAlign: isRtl ? 'right' : 'left',
                  fontSize: metrics.titleSize,
                  marginBottom: density === 'compact' ? 1 : 2,
                },
              ]}
              numberOfLines={titleNumberOfLines}
            >
              {title}
            </Text>
          ) : null}
          <Text
            style={[
              styles.message,
              {
                color: title ? subtle : foreground,
                textAlign: isRtl ? 'right' : 'left',
                fontSize: metrics.messageSize,
              },
            ]}
            numberOfLines={messageNumberOfLines}
          >
            {message}
          </Text>
        </View>

        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => [
              styles.actionWrap,
              {
                opacity: pressed ? 0.85 : 1,
                backgroundColor: withAlpha(accent, isDark ? (pressed ? 0.20 : 0.12) : (pressed ? 0.16 : 0.08)),
                borderColor: withAlpha(accent, isDark ? (pressed ? 0.30 : 0.18) : (pressed ? 0.22 : 0.12)),
                marginStart: metrics.gap,
                paddingHorizontal: density === 'compact' ? 10 : 12,
                paddingVertical: density === 'compact' ? 6 : 7,
              },
              Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            hitSlop={6}
            android_ripple={Platform.OS === 'android' ? { color: withAlpha(accent, 0.18), borderless: false } : undefined}
          >
            <Text style={[styles.action, { color: accent, fontSize: metrics.actionSize }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}

        {onDismiss ? (
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.dismissWrap,
              {
                width: metrics.iconBox,
                height: metrics.iconBox,
                borderRadius: metrics.iconRadius,
                marginStart: metrics.gap,
                opacity: pressed ? 0.85 : 1,
                backgroundColor: withAlpha(accent, isDark ? (pressed ? 0.22 : 0.16) : (pressed ? 0.16 : 0.10)),
                borderColor: withAlpha(accent, isDark ? (pressed ? 0.32 : 0.22) : (pressed ? 0.24 : 0.16)),
              },
              Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={dismissLabel}
            hitSlop={8}
            testID={testID ? `${testID}-dismiss` : undefined}
            android_ripple={Platform.OS === 'android' ? { color: withAlpha(accent, 0.18), borderless: false } : undefined}
          >
            <Icon name="close" size={iconSize} color={accent} />
          </Pressable>
        ) : null}
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: { flex: 1, minWidth: 0 },
  title: { fontWeight: '900' },
  message: { fontWeight: '800' },
  actionWrap: { borderWidth: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  action: { fontWeight: '900', letterSpacing: 0.3 },
  dismissWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
