import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { GoalIcon } from '@/components/main/GoalIcon';
import { type Goal } from '@/data/goals';

interface Props {
  goals: Goal[];
  onOpenGoal: (goalId: string) => void;
}

export function RecommendedStrip({ goals, onOpenGoal }: Props) {
  if (goals.length === 0) return null;

  const getStreamLabel = (stream: string) => {
    switch (stream) {
      case 'money_foundations':
        return 'Foundations';
      case 'income_builders':
        return 'Income';
      case 'wealthy_habits':
        return 'Habits';
      default:
        return stream;
    }
  };

  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case 'beginner':
        return { bg: '#0a2200', text: colors.brandGreen, border: colors.brandGreen };
      case 'intermediate':
        return { bg: '#0a1a3a', text: colors.accentBlue, border: colors.accentBlue };
      default:
        return { bg: '#2a0a0a', text: '#ff4b4b', border: '#ff4b4b' };
    }
  };

  const renderCard = ({ item }: { item: Goal }) => {
    const diffStyles = getDifficultyStyles(item.difficulty);
    return (
      <Pressable style={styles.card} onPress={() => onOpenGoal(item.id)}>
        <View style={styles.topRow}>
          <GoalIcon iconKey={item.iconKey} size={16} color={diffStyles.text} />
          <Text style={styles.streamTag}>{getStreamLabel(item.category || '')}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.bottomRow}>
          {item.estDuration && <Text style={styles.duration}>{item.estDuration}</Text>}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={16} color={colors.brandGreen} />
        <Text style={styles.headerTitle}>Recommended for you</Text>
      </View>
      <FlatList
        data={goals}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={292} // card width (280) + gap (12)
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.xs,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  listContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  card: {
    width: 280,
    height: 148,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.brandGreenOutline,
    borderRadius: radius.card,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streamTag: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.ash,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 21,
    marginVertical: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  duration: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.ash,
  },
});
