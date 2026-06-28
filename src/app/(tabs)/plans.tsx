import { useRouter } from 'expo-router';
import { Layers } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors, fonts, spacing } from '@/constants/theme';

export default function Plans() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Your Plans</Text>
      <View style={styles.center}>
        <Layers size={48} color={colors.graphite} />
        <Text style={styles.emptyTitle}>No active plans yet</Text>
        <Text style={styles.emptyBody}>
          Find a money goal in Discover and swipe right to generate your first plan.
        </Text>
        <View style={styles.cta}>
          <PrimaryButton label="Browse goals" onPress={() => router.push('/discover')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  title: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary, marginTop: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.textPrimary },
  emptyBody: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.ash,
    textAlign: 'center',
    lineHeight: 21,
  },
  cta: { width: '100%', marginTop: spacing.md },
});
