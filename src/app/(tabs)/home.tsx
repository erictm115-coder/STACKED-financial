import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors, spacing, typography } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function Home() {
  const { resetOnboarding } = useOnboarding();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Home — coming soon</Text>
          <Text style={styles.subtitle}>
            Onboarding complete. The real Stacked app will live here.
          </Text>
        </View>

        {/* DEV ONLY: clear the AsyncStorage flag to replay onboarding. */}
        <View style={styles.devBox}>
          <Text style={styles.devLabel}>DEV</Text>
          <PrimaryButton label="Reset onboarding" onPress={resetOnboarding} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  title: { ...typography.heading, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { ...typography.bodyLg, color: colors.textSecondary, textAlign: 'center' },
  devBox: { paddingBottom: spacing.xl, gap: spacing.sm },
  devLabel: { ...typography.caption, color: colors.textMuted, letterSpacing: 1 },
});
