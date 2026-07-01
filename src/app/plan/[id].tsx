import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, Play, BookOpen, Wrench, Square, CheckSquare } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalIcon } from '@/components/main/GoalIcon';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { goalMetaLabel } from '@/data/goals';
import { useAppStore } from '@/store/appStore';
import { usePlans } from '@/hooks/usePlans';

export default function PlanDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const getGoalById = useAppStore((s) => s.getGoalById);
  const goal = getGoalById(id);
  const { createPlan } = usePlans();
  const [isStarting, setIsStarting] = useState(false);

  // Track which step is expanded (null means none)
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  
  // Track checked action items (key format: 'stepNumber-actionIndex')
  const [checkedItems] = useState<Record<string, boolean>>({});

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

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  const handleStartPlan = async () => {
    if (isStarting) return;
    setIsStarting(true);
    const { planId, error } = await createPlan(id);
    setIsStarting(false);
    if (error || !planId) {
      Alert.alert('Something went wrong', "We couldn't start this plan. Please try again.");
      return;
    }
    router.replace(`/plans/${planId}` as any);
  };

  const toggleActionItem = (stepNumber: number, actionIndex: number) => {
    Alert.alert(
      'Start this plan first',
      "You need to start this plan before you can check off action items. We'll generate your custom 5-step timeline and track your progress. Ready to begin?",
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Start Plan', style: 'default', onPress: handleStartPlan },
      ]
    );
  };

  const openLink = async (url: string) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Don't know how to open URI: " + url);
      }
    } catch (err) {
      console.error('Failed to open link:', err);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play size={16} color={colors.brandGreen} fill={colors.brandGreen} />;
      case 'article':
        return <BookOpen size={16} color={colors.accentBlue} />;
      default:
        return <Wrench size={16} color={colors.brandGreen} />;
    }
  };

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

        {/* Step timeline (collapsible accordions) */}
        {goal.steps.length > 0 ? (
          <View style={styles.timeline}>
            {goal.steps.map((step) => {
              const isExpanded = expandedStep === step.stepNumber;
              return (
                <View key={step.stepNumber} style={styles.stepCard}>
                  {/* Accordion Header */}
                  <Pressable style={styles.stepHeader} onPress={() => toggleStep(step.stepNumber)}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                    </View>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    {isExpanded ? (
                      <ChevronUp size={20} color={colors.ash} />
                    ) : (
                      <ChevronDown size={20} color={colors.ash} />
                    )}
                  </Pressable>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <View style={styles.stepBody}>
                      {step.whyItMatters && (
                        <View style={styles.whyBlock}>
                          <Text style={styles.whyLabel}>Why it matters:</Text>
                          <Text style={styles.whyText}>{step.whyItMatters}</Text>
                        </View>
                      )}

                      {/* Action Items Checklist */}
                      {step.actionItems && step.actionItems.length > 0 && (
                        <View style={styles.sectionBlock}>
                          <Text style={styles.sectionTitle}>Action Items</Text>
                          <View style={styles.checklist}>
                            {step.actionItems.map((item, idx) => {
                              const isChecked = !!checkedItems[`${step.stepNumber}-${idx}`];
                              return (
                                <Pressable
                                  key={idx}
                                  style={styles.checkRow}
                                  onPress={() => toggleActionItem(step.stepNumber, idx)}
                                >
                                  {isChecked ? (
                                    <CheckSquare size={20} color={colors.brandGreen} />
                                  ) : (
                                    <Square size={20} color={colors.graphite} />
                                  )}
                                  <Text style={[styles.checkText, isChecked && styles.checkTextChecked]}>
                                    {item}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      )}

                      {/* Lessons & Resources — three states:
                          1) external content (has url)  → tappable resource row
                          2) in-app guide (no url)        → dashed guide card, no button
                          3) nothing at all                → calm informational note */}
                      {step.content && step.content.length > 0 ? (
                        <View style={styles.sectionBlock}>
                          <Text style={styles.sectionTitle}>Lessons & Resources</Text>
                          <View style={styles.contentList}>
                            {step.content.map((item, idx) => {
                              const isGuide = item.type === 'guide' || !item.url;

                              if (isGuide) {
                                return (
                                  <View key={idx} style={styles.guideCard}>
                                    <View style={styles.guideHeader}>
                                      <BookOpen size={16} color={colors.brandGreen} />
                                      <Text style={styles.guideLabel}>QUICK GUIDE</Text>
                                    </View>
                                    <Text style={styles.guideBody}>{item.brief || item.title}</Text>
                                  </View>
                                );
                              }

                              return (
                                <Pressable
                                  key={idx}
                                  style={styles.contentRow}
                                  onPress={() => item.url && openLink(item.url)}
                                >
                                  <View style={styles.contentIconWrap}>
                                    {getContentIcon(item.type)}
                                  </View>
                                  <View style={styles.contentTextWrap}>
                                    <Text style={styles.contentTitle} numberOfLines={2}>
                                      {item.title}
                                    </Text>
                                    <Text style={styles.contentMeta}>
                                      {item.type.toUpperCase()} • {item.estMinutes} MIN
                                    </Text>
                                  </View>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.noResourcesNote}>
                          No additional resources for this step yet — but you can still
                          complete the action items above.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
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
  stepCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  stepNumberBadge: {
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
  
  stepBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.graphite,
    paddingTop: spacing.md,
  },
  whyBlock: {
    backgroundColor: colors.background,
    borderRadius: radius.input,
    padding: spacing.md,
    gap: 4,
  },
  whyLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.ash, textTransform: 'uppercase' },
  whyText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  
  sectionBlock: { gap: spacing.xs },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.ash, textTransform: 'uppercase' },
  
  checklist: { gap: spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 2 },
  checkText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary, flex: 1 },
  checkTextChecked: { textDecorationLine: 'line-through', color: colors.ash },
  
  contentList: { gap: spacing.sm },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.input,
    padding: spacing.md,
  },
  contentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  contentTextWrap: { flex: 1, gap: 2 },
  contentTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary },
  contentMeta: { fontFamily: fonts.bold, fontSize: 11, color: colors.ash },

  placeholder: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.ash, lineHeight: 21 },

  // State 2 — in-app guide card (dashed border signals "not an external link")
  guideCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#3c3c3c',
    borderStyle: 'dashed',
    borderRadius: radius.input,
    padding: spacing.md,
    gap: spacing.xs,
  },
  guideHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guideLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#777777',
    letterSpacing: 0.5,
  },
  guideBody: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },

  // State 3 — calm informational note
  noResourcesNote: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#555555',
    lineHeight: 19,
  },

  notFound: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
