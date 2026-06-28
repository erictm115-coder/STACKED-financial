import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, fonts, spacing } from '@/constants/theme';

export default function Premium() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Get Premium</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Placeholder */}
      <View style={styles.placeholder}>
        <Text style={styles.comingSoon}>Coming soon</Text>
        <Text style={styles.subtitle}>
          Unlock all goals, unlimited plans, and advanced analytics
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.graphite,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.extraBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 32,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  comingSoon: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.ash,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.ash,
    textAlign: 'center',
    lineHeight: 22,
  },
});
