import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, fonts, radius } from '@/constants/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  /** 'grid' is used for the 2-column word-pick layout: bigger, centered text. */
  variant?: 'list' | 'grid';
  style?: any;
};

export function AnswerButton({ label, selected = false, onPress, variant = 'list', style }: Props) {
  const scale = useSharedValue(1);
  const pressY = useSharedValue(0);
  const pressProgress = useSharedValue(0);
  const selectedProgress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selectedProgress.value = withTiming(selected ? 1 : 0, { duration: 150 });
  }, [selected, selectedProgress]);

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

  const containerStyle = useAnimatedStyle(() => {
    // Default is grey. While the finger is down (and not yet selected) the
    // border flashes green. Once selected, fill + border go green for good.
    const restingBorder = interpolateColor(
      pressProgress.value,
      [0, 1],
      [colors.graphite, colors.brandGreen],
    );

    return {
      transform: [{ scale: scale.value }, { translateY: pressY.value }],
      backgroundColor: interpolateColor(
        selectedProgress.value,
        [0, 1],
        [colors.surface, colors.brandGreen],
      ),
      borderColor: interpolateColor(
        selectedProgress.value,
        [0, 1],
        [restingBorder, colors.brandGreenBorder],
      ),
    };
  });

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(selectedProgress.value, [0, 1], [colors.textPrimary, colors.background]),
  }));

  const isGrid = variant === 'grid';

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[isGrid ? styles.pressableGrid : styles.pressable, style]}
    >
      <Animated.View
        style={[
          styles.button,
          isGrid && styles.buttonGrid,
          selected && styles.selectedBorder,
          containerStyle,
        ]}
      >
        <Animated.Text
          style={[styles.label, isGrid && styles.labelGrid, selected && styles.labelSelected, textStyle]}
          numberOfLines={isGrid ? 1 : 2}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    minHeight: 48,
  },
  pressableGrid: {
    width: '100%',
    height: 64,
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: radius.input,
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  buttonGrid: {
    alignItems: 'center',
  },
  // 3D "pressed-in" lip on the selected state, matching the button system's depth language.
  selectedBorder: {
    borderBottomWidth: 3,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  labelSelected: {
    fontFamily: fonts.bold,
  },
  labelGrid: {
    fontSize: 18,
    textAlign: 'center',
  },
});
