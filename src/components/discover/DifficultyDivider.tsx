import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts, spacing } from '@/constants/theme';

interface Props {
  label: string;
}

export function DifficultyDivider({ label }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <View style={styles.labelBg}>
        <Text style={styles.text}>{label.toUpperCase()}</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginVertical: spacing.xs,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a2a2a',
  },
  labelBg: {
    paddingHorizontal: spacing.md,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: '#555555',
    letterSpacing: 1.5,
  },
});
