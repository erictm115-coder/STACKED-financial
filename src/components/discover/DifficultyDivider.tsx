import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

interface Props {
  label: string;
}

export function DifficultyDivider({ label }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  text: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
});
