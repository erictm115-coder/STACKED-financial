import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, fonts, radius } from '@/constants/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  /** 'grid' is used for the 2-column word-pick layout: bigger, centered text. */
  variant?: 'list' | 'grid';
};

export function AnswerButton({ label, selected = false, onPress, variant = 'list' }: Props) {
  const scale = useSharedValue(1);

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isGrid = variant === 'grid';

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPress={handlePress}
        style={[
          styles.button,
          isGrid && styles.buttonGrid,
          selected && styles.selected,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Text
          style={[styles.label, isGrid && styles.labelGrid]}
          numberOfLines={isGrid ? 1 : 2}
        >
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
    justifyContent: 'center',
  },
  buttonGrid: {
    height: 64,
    alignItems: 'center',
  },
  selected: {
    borderColor: colors.brandGreen,
    backgroundColor: '#0a2200',
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  labelGrid: {
    fontSize: 18,
    textAlign: 'center',
  },
});
