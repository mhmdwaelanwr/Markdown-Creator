import React, { useEffect, useMemo } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import GlassView from './GlassView';
import ActionIconButton from './ActionIconButton';

type AppDialogProps = {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  title: string;
  subtitle?: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: React.ReactNode;
  scroll?: boolean;
  dismissOnBackdropPress?: boolean;
  maxWidth?: number;
  maxHeight?: number | string;
  children: React.ReactNode;
};

export default function AppDialog({
  visible,
  onClose,
  isDark,
  title,
  subtitle,
  icon,
  style,
  contentStyle,
  footer,
  scroll = true,
  dismissOnBackdropPress = true,
  maxWidth = 920,
  maxHeight = '88%',
  children,
}: AppDialogProps) {
  const tone = isDark ? 'dark' : 'light';
  const foreground = isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight;
  const subtle = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;

  const overlayBackground = useMemo(
    () => (isDark ? 'rgba(2,6,23,0.66)' : 'rgba(15,23,42,0.34)'),
    [isDark],
  );

  const sizeStyle = useMemo(() => ({ maxWidth, maxHeight } as any), [maxHeight, maxWidth]);

  useEffect(() => {
    if (!visible) return;
    if (Platform.OS !== 'web') return;

    const handler = (event: KeyboardEvent) => {
      const key = String(event.key || '').toLowerCase();
      if (key === 'escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, visible]);

  const cardChrome: ViewStyle = {
    borderRadius: 24,
    borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.overlay, { backgroundColor: overlayBackground }]}
        onPress={dismissOnBackdropPress ? onClose : undefined}
      >
        <Pressable
          style={styles.wrap}
          onPress={(event) => {
            event.stopPropagation();
          }}
        >
          <GlassView tone={tone} style={[styles.card, cardChrome, sizeStyle, style]}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {icon ? (
                  <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.10)' }]}>
                    <Icon name={icon} size={18} color={Colors.primary} />
                  </View>
                ) : null}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.title, { color: foreground }]} numberOfLines={1}>
                    {title}
                  </Text>
                  {subtitle ? (
                    <Text style={[styles.subtitle, { color: subtle }]} numberOfLines={2}>
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
              </View>
              <ActionIconButton icon="close" onPress={onClose} isDark={isDark} accessibilityLabel="Close" />
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(148,163,184,0.14)' : 'rgba(15,23,42,0.10)' }]} />

            {scroll ? (
              <ScrollView style={styles.body} contentContainerStyle={[styles.bodyContent, contentStyle]}>
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.bodyContent, styles.bodyNoScroll, contentStyle]}>{children}</View>
            )}

            {footer ? (
              <>
                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(148,163,184,0.14)' : 'rgba(15,23,42,0.10)' }]} />
                <View style={styles.footer}>{footer}</View>
              </>
            ) : null}
          </GlassView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrap: {
    width: '100%',
    maxWidth: 1120,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.9,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  bodyNoScroll: {
    paddingBottom: 20,
  },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
