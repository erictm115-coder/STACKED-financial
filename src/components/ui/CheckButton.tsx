import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, fonts, radius } from '@/constants/theme';

type Props = {
  label: string;
  checked: boolean;
  onPress: () => void;
  /** Pulse true momentarily (then back to false) to shake this button — used when the max selection is exceeded. */
  shake?: boolean;
};

export function CheckButton({ label, checked, onPress, shake = false }: Props) {
  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 80 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(0.97, { duration: 0 }),
      withTiming(1.02, { duration: 90 }),
      withTiming(1, { duration: 90 }),
    );
    onPress();
  };

  useEffect(() => {
    if (shake) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [shake, shakeX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shakeX.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPress={handlePress}
        style={[styles.button, checked && styles.selected]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.tick}>✓</Text>}
        </View>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 54,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.graphite,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selected: {
    borderColor: colors.brandGreen,
    backgroundColor: '#0a2200',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.graphite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.brandGreen,
    backgroundColor: colors.brandGreen,
  },
  tick: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  label: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
