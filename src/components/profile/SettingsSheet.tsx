import React, { useEffect } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {
  HelpCircle,
  Gem,
  Bell,
  LifeBuoy,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { colors, fonts, radius, spacing } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'how-it-works',
    icon: <HelpCircle size={22} color={colors.accentBlue} />,
    label: 'How does this app work?',
    sublabel: 'Your guide to building wealth with Stacked',
    route: '/settings/how-it-works',
  },
  {
    id: 'premium',
    icon: <Gem size={22} color="#f4c430" />,
    label: 'Get Premium',
    sublabel: 'Unlock all goals and advanced features',
    route: '/settings/premium',
  },
  {
    id: 'notifications',
    icon: <Bell size={22} color={colors.brandGreen} />,
    label: 'Notifications',
    sublabel: 'Manage your daily habit reminders',
    route: '/settings/notifications',
  },
  {
    id: 'support',
    icon: <LifeBuoy size={22} color={colors.ash} />,
    label: 'Support',
    sublabel: 'Get help or send us feedback',
    route: '/settings/support',
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsSheet({ visible, onClose }: Props) {
  const router = useRouter();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.ease) });
      backdropOpacity.value = withTiming(0.7, { duration: 320 });
    }
  }, [visible]);

  const dismiss = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 260 }, () => {
      runOnJS(onClose)();
    });
    backdropOpacity.value = withTiming(0, { duration: 260 });
  };

  const handleItem = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dismiss();
    setTimeout(() => {
      router.push(route as any);
    }, 280);
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={dismiss}>
      <View style={styles.container}>
        {/* Tappable dimmed backdrop */}
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        {/* Sheet */}
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* Drag pill */}
          <View style={styles.pillWrap}>
            <View style={styles.pill} />
          </View>

          {/* Sheet title */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* Menu items */}
          <View style={styles.menu}>
            {MENU_ITEMS.map((item, idx) => (
              <Pressable
                key={item.id}
                style={[
                  styles.menuItem,
                  idx < MENU_ITEMS.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => handleItem(item.route)}
              >
                <View style={styles.menuIconWrap}>{item.icon}</View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSublabel}>{item.sublabel}</Text>
                </View>
                <ChevronRight size={18} color={colors.graphite} />
              </Pressable>
            ))}
          </View>

          {/* Bottom safe spacing */}
          <View style={styles.bottomPad} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderBottomWidth: 0,
  },
  pillWrap: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.graphite,
  },
  titleRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  menu: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.background,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.graphite,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 64,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  menuSublabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.ash,
  },
  bottomPad: {
    height: 40,
  },
});
