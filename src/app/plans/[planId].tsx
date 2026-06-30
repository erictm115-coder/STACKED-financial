import React, { useState, useEffect, useMemo } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Share,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Play,
  BookOpen,
  Wrench,
  Square,
  CheckSquare,
  Lock,
  Check,
  Award,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { GoalIcon } from '@/components/main/GoalIcon';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useStepProgress, type StepProgress } from '@/hooks/useStepProgress';

// Self-contained Custom Confetti Component
const CONFETTI_COLORS = ['#58cc02', '#a5ed6e', '#1cb0f6', '#ffffff'];

function ConfettiPiece({ index, containerWidth, containerHeight }: { index: number; containerWidth: number; containerHeight: number }) {
  const startX = Math.random() * containerWidth;
  const size = Math.random() * 8 + 6;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  
  const y = useSharedValue(-20);
  const xOffset = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const duration = Math.random() * 1500 + 1500;
    const delay = Math.random() * 800;

    y.value = withDelay(
      delay,
      withTiming(containerHeight + 20, {
        duration,
        easing: Easing.linear,
      })
    );

    xOffset.value = withDelay(
      delay,
      withTiming((Math.random() - 0.5) * 80, {
        duration,
        easing: Easing.inOut(Easing.ease),
      })
    );

    rotation.value = withDelay(
      delay,
      withTiming(Math.random() * 720, {
        duration,
        easing: Easing.linear,
      })
    );
  }, [containerHeight, containerWidth]);

  const animStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: y.value },
        { translateX: xOffset.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          top: 0,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: index % 2 === 0 ? size / 2 : 2,
        },
        animStyle,
      ]}
    />
  );
}

function ConfettiOverlay({ active }: { active: boolean }) {
  const { width, height } = useWindowDimensions();
  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 45 }).map((_, i) => (
        <ConfettiPiece key={i} index={i} containerWidth={width} containerHeight={height} />
      ))}
    </View>
  );
}

// Custom Rising Score Badge Component
interface BadgeData {
  id: string;
  text: string;
  delay: number;
}

function RisingBadge({ text, delay, onFinished }: { text: string; delay: number; onFinished: () => void }) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 150 }));
    y.value = withDelay(
      delay,
      withTiming(-50, { duration: 1000, easing: Easing.out(Easing.ease) }, (finished) => {
        if (finished) {
          runOnJS(onFinished)();
        }
      })
    );
    opacity.value = withDelay(
      delay + 600,
      withTiming(0, { duration: 300 })
    );
  }, [delay]);

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: y.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.floatingBadge, style]}>
      <Text style={styles.floatingBadgeText}>{text}</Text>
    </Animated.View>
  );
}

// In-progress pulse style for indicator border
function PulseBorder({ children, active }: { children: React.ReactNode; active: boolean }) {
  const borderOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (active) {
      borderOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      borderOpacity.value = 1;
    }
  }, [active]);

  const style = useAnimatedStyle(() => {
    return {
      borderLeftWidth: active ? 3 : 0,
      borderLeftColor: colors.brandGreen,
      opacity: borderOpacity.value,
    };
  });

  if (!active) return <View style={styles.cardWrapper}>{children}</View>;

  return (
    <Animated.View style={[styles.cardWrapper, style]}>
      {children}
    </Animated.View>
  );
}

export default function PlanDetail() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { user } = useAuth();

  const [planData, setPlanData] = useState<any>(null);
  const [dbSteps, setDbSteps] = useState<any[]>([]);
  const [dbContent, setDbContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Expanded card state
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  // Celebration states
  const [activeBadges, setActiveBadges] = useState<BadgeData[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionSheet, setShowCompletionSheet] = useState(false);
  
  // Track delta of dimensions for completion sheet summary
  const [scoresDelta, setScoresDelta] = useState<Record<string, number>>({});

  // Inline error toast (Bug 1 — surface failures instead of silent crash)
  const [toastText, setToastText] = useState<string | null>(null);
  const toastTranslateY = useSharedValue(-120);
  const toastOpacity = useSharedValue(0);

  const showErrorToast = (message: string) => {
    setToastText(message);
    toastTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    toastOpacity.value = withTiming(1, { duration: 300 });
    setTimeout(() => {
      toastTranslateY.value = withTiming(-120, { duration: 250 });
      toastOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) runOnJS(setToastText)(null);
      });
    }, 2600);
  };

  const toastStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: toastTranslateY.value }],
    opacity: toastOpacity.value,
  }));

  // 1. Fetch user plan and catalogue joins from Supabase
  const fetchPlanDetails = async () => {
    if (!planId) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_plans')
        .select(`
          id, status, created_at, goal_id,
          goals (
            id, title, stream, icon_key, slug,
            goal_steps (
              id, step_number, title, why_it_matters, action_items, score_impact
            )
          )
        `)
        .eq('id', planId)
        .single();

      if (error) throw error;
      setPlanData(data);

      const steps = (data?.goals as any)?.goal_steps || [];
      const stepIds = steps.map((s: any) => s.id);
      
      if (stepIds.length > 0) {
        // Fetch matching step content
        const { data: contentData, error: contentErr } = await supabase
          .from('step_content')
          .select('*')
          .in('step_id', stepIds);

        if (contentErr) throw contentErr;
        setDbSteps(steps.sort((a: any, b: any) => a.step_number - b.step_number));
        setDbContent(contentData || []);
      }
    } catch (err) {
      console.error('Error loading plan details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanDetails();
  }, [planId]);

  // Construct steps and content maps for hook
  const stepIds = useMemo(() => dbSteps.map((s) => s.id), [dbSteps]);

  const stepsMap = useMemo(() => {
    const map: Record<string, { action_items: string[]; score_impact: any }> = {};
    dbSteps.forEach((s) => {
      map[s.id] = {
        action_items: s.action_items || [],
        score_impact: s.score_impact || {},
      };
    });
    return map;
  }, [dbSteps]);

  const {
    progressMap,
    toggleActionItem,
    completePlan,
    isStepBusy,
  } = useStepProgress(planId, stepIds, stepsMap);

  // Auto expand current active step on load
  useEffect(() => {
    if (dbSteps.length === 0) return;

    // Find the first step that is not completed
    const active = dbSteps.find((s) => {
      const prog = progressMap[s.id];
      return !prog || !prog.completed;
    });

    if (active) {
      setExpandedStepId(active.id);
    } else {
      setExpandedStepId(dbSteps[0].id);
    }
  }, [dbSteps, progressMap]);

  // Check sequence locking
  const isStepLocked = (stepNumber: number) => {
    if (stepNumber === 1) return false;
    // Step N is locked if Step N-1 is not completed
    const prevStep = dbSteps.find((s) => s.step_number === stepNumber - 1);
    if (!prevStep) return true;
    const prevProg = progressMap[prevStep.id];
    return !prevProg || !prevProg.completed;
  };

  const handleToggleItem = async (stepId: string, itemIdx: number) => {
    if (isStepBusy(stepId)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleActionItem(
      stepId,
      itemIdx,
      (scoreImpact) => {
      // Step just completed! Trigger celebration animation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const newBadges: BadgeData[] = Object.entries(scoreImpact).map(([dim, val], idx) => ({
        id: `${Date.now()}-${dim}-${idx}`,
        text: `+${val} ${dim.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`,
        delay: idx * 150,
      }));
      
      setActiveBadges((prev) => [...prev, ...newBadges]);
      
      // Update scores delta for completion card
      setScoresDelta((prev) => {
        const next = { ...prev };
        Object.entries(scoreImpact).forEach(([dim, val]) => {
          next[dim] = (next[dim] || 0) + val;
        });
        return next;
      });
      },
      (msg) => showErrorToast(msg)
    );
  };

  // Check plan completion status
  useEffect(() => {
    if (dbSteps.length === 0 || isLoading) return;
    const allCompleted = dbSteps.every((s) => {
      const prog = progressMap[s.id];
      return prog && prog.completed;
    });

    if (allCompleted && planData && planData.status !== 'completed') {
      // Complete plan in database
      completePlan().then(() => {
        // Update local status so we don't trigger this again and UI reflects completed state
        setPlanData((prev: any) => prev ? { ...prev, status: 'completed' } : null);
        
        // Trigger fullscreen celebration!
        setShowConfetti(true);
        setTimeout(() => {
          setShowCompletionSheet(true);
        }, 1000);
      });
    }
  }, [progressMap, dbSteps, planData, isLoading]);

  const openLink = async (url: string) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sharePlan = async () => {
    try {
      await Share.share({
        message: `I just completed the "${planData?.goals?.title}" plan on Stacked! Let's get Stacked 💪`,
      });
    } catch (err) {
      console.error(err);
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

  if (isLoading || !planData) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading plan timeline...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const goal = planData.goals;
  
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Dynamic confetti overlay */}
      <ConfettiOverlay active={showConfetti} />

      {/* Error toast */}
      {toastText && (
        <Animated.View style={[styles.toast, toastStyle]} pointerEvents="none">
          <Text style={styles.toastText}>{toastText}</Text>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={10}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <GoalIcon iconKey={goal.icon_key} size={28} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{goal.title}</Text>
            <Text style={styles.streamLabel}>
              {goal.stream === 'money_foundations'
                ? 'Money Foundations'
                : goal.stream === 'income_builders'
                ? 'Income Builders'
                : 'Wealthy Habits'}
            </Text>
          </View>
        </View>

        {/* Steps Timeline Stack */}
        <View style={styles.timeline}>
          {dbSteps.map((step, idx) => {
            const isLocked = isStepLocked(step.step_number);
            const prog = progressMap[step.id];
            const isCompleted = !!prog?.completed;
            const isExpanded = expandedStepId === step.id;
            const checkedItems = prog?.checked_items || [];

            // Next step check
            const isActiveStep = !isLocked && !isCompleted;
            const stepContent = dbContent.filter((c) => c.step_id === step.id);
            const stepBusy = isStepBusy(step.id);

            return (
              <View key={step.id} style={styles.timelineSegment}>
                {/* Connector line underneath the step badge */}
                {idx < dbSteps.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted ? styles.connectorCompleted : styles.connectorPending,
                    ]}
                  />
                )}

                <PulseBorder active={isActiveStep}>
                  <View style={[styles.stepCard, isCompleted && styles.stepCardCompleted]}>
                    
                    {/* Header trigger */}
                    <Pressable
                      style={styles.stepHeader}
                      disabled={isLocked}
                      onPress={() => setExpandedStepId(isExpanded ? null : step.id)}
                    >
                      {/* Checkbox circle indicator */}
                      <View style={styles.checkboxAlign}>
                        {isCompleted ? (
                          <View style={styles.completedBadge}>
                            <Check size={14} color="#ffffff" strokeWidth={3} />
                          </View>
                        ) : isLocked ? (
                          <View style={styles.lockedBadge}>
                            <Lock size={12} color="#555555" />
                          </View>
                        ) : (
                          <View style={styles.activeBadge} />
                        )}
                      </View>

                      <Text
                        style={[
                          styles.stepTitle,
                          isCompleted && styles.stepTitleCompleted,
                          isLocked && styles.stepTitleLocked,
                        ]}
                      >
                        {step.title}
                      </Text>

                      {!isLocked && (
                        isExpanded ? (
                          <ChevronUp size={20} color={colors.ash} />
                        ) : (
                          <ChevronDown size={20} color={colors.ash} />
                        )
                      )}
                    </Pressable>

                    {/* Accordion body */}
                    {isExpanded && !isLocked && (
                      <View style={styles.stepBody}>
                        
                        {/* Why it matters description */}
                        {step.why_it_matters && (
                          <View style={styles.whyBlock}>
                            <Text style={styles.whyLabel}>Why it matters:</Text>
                            <Text style={styles.whyText}>{step.why_it_matters}</Text>
                          </View>
                        )}

                        {/* Action items checklist */}
                        {step.action_items && step.action_items.length > 0 && (
                          <View style={styles.sectionBlock}>
                            <Text style={styles.sectionTitle}>Your Actions</Text>
                            <View style={styles.checklist}>
                              {step.action_items.map((item: string, itemIdx: number) => {
                                const isItemChecked = checkedItems.includes(itemIdx);
                                return (
                                  <Pressable
                                    key={itemIdx}
                                    style={[styles.checkRow, stepBusy && styles.checkRowBusy]}
                                    disabled={stepBusy}
                                    onPress={() => handleToggleItem(step.id, itemIdx)}
                                  >
                                    <View style={styles.checkCell}>
                                      {isItemChecked ? (
                                        <View style={styles.checkedSquare}>
                                          <Check size={14} color="#ffffff" strokeWidth={3} />
                                        </View>
                                      ) : (
                                        <View style={styles.uncheckedSquare} />
                                      )}
                                    </View>
                                    <Text
                                      style={[
                                        styles.checkText,
                                        isItemChecked && styles.checkTextChecked,
                                      ]}
                                    >
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
                            2) in-app guide (no url)       → dashed guide card, no button
                            3) nothing at all              → calm informational note */}
                        {stepContent.length > 0 ? (
                          <View style={styles.sectionBlock}>
                            <Text style={styles.sectionTitle}>Lessons & Resources</Text>
                            <View style={styles.contentList}>
                              {stepContent.map((item) => {
                                const isGuide = item.content_type === 'guide' || !item.url;

                                // State 2 — in-app guide
                                if (isGuide) {
                                  return (
                                    <View key={item.id} style={styles.guideCard}>
                                      <View style={styles.guideHeader}>
                                        <BookOpen size={16} color={colors.brandGreen} />
                                        <Text style={styles.guideLabel}>QUICK GUIDE</Text>
                                      </View>
                                      <Text style={styles.guideBody}>
                                        {item.brief || item.title}
                                      </Text>
                                    </View>
                                  );
                                }

                                // State 1 — external resource
                                return (
                                  <Pressable
                                    key={item.id}
                                    style={styles.contentRow}
                                    onPress={() => openLink(item.url)}
                                  >
                                    <View style={styles.contentIconWrap}>
                                      {getContentIcon(item.content_type)}
                                    </View>
                                    <View style={styles.contentTextWrap}>
                                      <Text style={styles.contentTitle} numberOfLines={2}>
                                        {item.title}
                                      </Text>
                                      <Text style={styles.contentMeta}>
                                        {item.content_type?.toUpperCase()} • {item.est_minutes} MIN
                                      </Text>
                                    </View>
                                  </Pressable>
                                );
                              })}
                            </View>
                          </View>
                        ) : (
                          // State 3 — guard: should not happen once fallback guides exist
                          <Text style={styles.noResourcesNote}>
                            No additional resources for this step yet — but you can still
                            complete the action items above.
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </PulseBorder>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating score badges rendering container */}
      <View style={styles.badgeContainer} pointerEvents="none">
        {activeBadges.map((badge) => (
          <RisingBadge
            key={badge.id}
            text={badge.text}
            delay={badge.delay}
            onFinished={() => {
              setActiveBadges((prev) => prev.filter((b) => b.id !== badge.id));
            }}
          />
        ))}
      </View>

      {/* Plan Completion Summary Modal Bottom Sheet */}
      {showCompletionSheet && (
        <Modal transparent visible={showCompletionSheet} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalBackdropFill} />
            <View style={styles.completionSheet}>
              <Award size={48} color={colors.brandGreen} style={styles.awardIcon} />
              <Text style={styles.completionTitle}>Plan Complete!</Text>
              <Text style={styles.completionBody}>You just got more Stacked.</Text>
              
              <View style={styles.goalCompleteSummary}>
                <GoalIcon iconKey={goal.icon_key} size={20} color={colors.brandGreen} />
                <Text style={styles.goalCompleteTitle}>{goal.title}</Text>
              </View>

              {/* Score deltas list */}
              {Object.keys(scoresDelta).length > 0 && (
                <View style={styles.deltaBox}>
                  <Text style={styles.deltaBoxTitle}>STACK SCORE CHANGES</Text>
                  {Object.entries(scoresDelta).map(([dim, val]) => (
                    <View key={dim} style={styles.deltaRow}>
                      <Text style={styles.deltaDim}>
                        {dim.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Text>
                      <Text style={styles.deltaVal}>▲ {val}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.completionButtons}>
                <Pressable
                  style={styles.btnSecondaryFull}
                  onPress={sharePlan}
                >
                  <Text style={styles.btnSecondaryFullText}>Share your win</Text>
                </Pressable>
                
                <Pressable
                  style={styles.btnPrimaryFull}
                  onPress={() => {
                    setShowCompletionSheet(false);
                    router.push('/discover');
                  }}
                >
                  <Text style={styles.btnPrimaryFullText}>Discover More Goals</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  back: { width: 40, height: 40, justifyContent: 'center', marginTop: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.ash },

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
  title: { fontFamily: fonts.extraBold, fontSize: 24, color: colors.textPrimary },
  streamLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.ash },

  timeline: { gap: spacing.md, marginTop: spacing.sm },
  timelineSegment: {
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    left: 32, // align with center of badge
    top: 50,
    width: 2,
    height: 60,
    zIndex: -1,
  },
  connectorPending: {
    backgroundColor: colors.graphite,
  },
  connectorCompleted: {
    backgroundColor: colors.brandGreen,
  },

  cardWrapper: {
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.card,
  },
  stepCardCompleted: {
    backgroundColor: '#071500', // very subtle green tint
    borderColor: '#193f00',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  checkboxAlign: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.brandGreen,
    backgroundColor: '#ffffff',
  },
  lockedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#3c3c3c',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brandGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },
  stepTitleCompleted: { color: colors.ash },
  stepTitleLocked: { color: '#555555' },

  stepBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    paddingTop: spacing.md,
  },
  whyBlock: {
    backgroundColor: colors.background,
    borderRadius: radius.input,
    padding: spacing.md,
    gap: 4,
  },
  whyLabel: { fontFamily: fonts.bold, fontSize: 11, color: colors.ash, textTransform: 'uppercase' },
  whyText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },

  sectionBlock: { gap: spacing.sm },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 11, color: colors.ash, textTransform: 'uppercase', letterSpacing: 0.5 },

  checklist: { gap: spacing.xs },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  checkCell: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3c3c3c',
    backgroundColor: 'transparent',
  },
  checkedSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.brandGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textPrimary, flex: 1 },
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

  checkRowBusy: { opacity: 0.4 },

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

  // Error toast
  toast: {
    position: 'absolute',
    top: 50,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: '#3a0a0a',
    borderWidth: 1,
    borderColor: '#ff4b4b',
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    zIndex: 9999,
  },
  toastText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },

  // Rising badges overlay container
  badgeContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  floatingBadge: {
    backgroundColor: '#0a2200',
    borderWidth: 1,
    borderColor: colors.brandGreen,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    position: 'absolute',
    alignSelf: 'center',
  },
  floatingBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.brandGreen,
  },

  // Completion modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    opacity: 0.85,
  },
  completionSheet: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.graphite,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 40,
    alignItems: 'center',
    gap: spacing.md,
  },
  awardIcon: {
    marginBottom: spacing.xs,
  },
  completionTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    color: colors.textPrimary,
  },
  completionBody: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ash,
  },
  goalCompleteSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    width: '100%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.graphite,
  },
  goalCompleteTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  deltaBox: {
    width: '100%',
    backgroundColor: '#0e1f06',
    borderWidth: 1,
    borderColor: '#193f00',
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.xs,
  },
  deltaBoxTitle: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.brandGreen,
    letterSpacing: 1,
    marginBottom: 4,
  },
  deltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deltaDim: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  deltaVal: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.brandGreen,
  },
  completionButtons: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  btnPrimaryFull: {
    height: 56,
    backgroundColor: colors.brandGreen,
    borderBottomWidth: 3,
    borderBottomColor: colors.brandGreenBorder,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  btnPrimaryFullText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#ffffff',
  },
  btnSecondaryFull: {
    height: 56,
    borderWidth: 2,
    borderColor: '#3c3c3c',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: '100%',
  },
  btnSecondaryFullText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
