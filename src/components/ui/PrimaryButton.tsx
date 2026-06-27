import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

const BORDER = 4;
const HEIGHT = 56;

/**
 * Green primary CTA with a tactile 3D press.
 * Depth comes from a solid bottom border (no box-shadow). On press the border
 * collapses and the face translates down so it visually presses into the surface.
 */
export function PrimaryButton({ label, onPress, disabled = false }: Props) {
  const handlePressIn = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      disabled={disabled}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {({ pressed }) => (
        <View
          style={[styles.button, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
        >
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Reserve the press-travel so layout never shifts.
  wrapper: {
    width: '100%',
    height: HEIGHT + BORDER,
    justifyContent: 'flex-start',
  },
  button: {
    width: '100%',
    height: HEIGHT,
    borderRadius: radius.button,
    backgroundColor: colors.brandGreen,
    borderBottomWidth: BORDER,
    borderBottomColor: colors.brandGreenBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    borderBottomWidth: 0,
    transform: [{ translateY: BORDER }],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.body,
    color: colors.accentMidnight,
  },
});
