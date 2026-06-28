import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing } from '@/constants/theme';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  stream: string;
}

export function SectionHeader({ icon, title, subtitle, stream }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Pressable onPress={() => router.push(`/discover/stream/${stream}` as any)} hitSlop={8}>
          <Text style={styles.seeAll}>See all →</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  seeAll: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.brandGreen,
  },
  subtitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.ash,
    paddingLeft: 28, // align with text next to icon
  },
});
