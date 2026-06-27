import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CheckboxTick } from '@/components/icons/CheckboxTick';
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
  const pressY = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const pressProgress = useSharedValue(0);
  const checkedProgress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    checkedProgress.value = withTiming(checked ? 1 : 0, { duration: 150 });
  }, [checked, checkedProgress]);

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 120 });
    pressY.value = withTiming(2, { duration: 120 });
    pressProgress.value = withTiming(1, { duration: 120 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 120 });
    pressY.value = withTiming(0, { duration: 120 });
    pressProgress.value = withTiming(0, { duration: 120 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const animatedStyle = useAnimatedStyle(() => {
    const restingBorder = interpolateColor(
      pressProgress.value,
      [0, 1],
      [colors.graphite, colors.brandGreen],
    );

    return {
      transform: [{ scale: scale.value }, { translateY: pressY.value }, { translateX: shakeX.value }],
      backgroundColor: interpolateColor(checkedProgress.value, [0, 1], [colors.surface, '#0a2200']),
      borderColor: interpolateColor(checkedProgress.value, [0, 1], [restingBorder, colors.brandGreen]),
    };
  });

  const checkboxStyle = useAnimatedStyle(() => {
    const restingBorder = interpolateColor(
      pressProgress.value,
      [0, 1],
      [colors.graphite, colors.brandGreen],
    );
    return { borderColor: restingBorder };
  });

  return (
    <Animated.View style={[styles.button, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.pressable}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        {checked ? (
          <CheckboxTick size={20} />
        ) : (
          <Animated.View style={[styles.checkbox, checkboxStyle]} />
        )}
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
    minHeight: 48,
    borderRadius: radius.input,
    borderWidth: 2,
  },
  pressable: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  label: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
