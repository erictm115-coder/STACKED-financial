import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalIcon } from '@/components/main/GoalIcon';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { getGoalById, goalMetaLabel } from '@/data/goals';

export default function PlanDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const goal = getGoalById(id);

  if (!goal) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.notFound}>That goal could not be found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <GoalIcon iconKey={goal.iconKey} size={28} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{goal.title}</Text>
            <Text style={styles.meta}>{goalMetaLabel(goal)}</Text>
          </View>
        </View>

        {/* Step timeline (collapsed) */}
        {goal.steps.length > 0 ? (
          <View style={styles.timeline}>
            {goal.steps.map((step) => (
              <View key={step.stepNumber} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.placeholder}>
            Steps for this plan are coming soon. The full step timeline, curated content, and
            action items land in the next build milestone.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  back: { width: 40, height: 40, justifyContent: 'center', marginTop: spacing.sm },

  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
  },
  headerText: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.extraBold, fontSize: 26, color: colors.textPrimary },
  meta: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.ash },

  timeline: { gap: spacing.md, marginTop: spacing.sm },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.brandGreen,
  },
  stepNumberText: { fontFamily: fonts.bold, fontSize: 14, color: colors.brandGreen },
  stepTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },

  placeholder: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.ash, lineHeight: 21 },
  notFound: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
