import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Flame, Target, Trophy, Clock } from 'lucide-react-native';
import * as ExpoNotifications from 'expo-notifications';
import { colors, fonts, spacing } from '@/constants/theme';

// Register handler to display push notifications in the foreground
ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Notifications() {
  const router = useRouter();
  
  // State for toggles
  const [streakReminders, setStreakReminders] = useState(true);
  const [progressNudges, setProgressNudges] = useState(true);
  const [competitionAlerts, setCompetitionAlerts] = useState(false);
  const [selectedTime, setSelectedTime] = useState('09:00 AM');

  const times = ['08:00 AM', '09:00 AM', '12:00 PM', '06:00 PM', '08:00 PM'];

  const triggerTestNotification = async () => {
    const { status } = await ExpoNotifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await ExpoNotifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        alert('Notification permissions are required to test notifications.');
        return;
      }
    }
    await ExpoNotifications.scheduleNotificationAsync({
      content: {
        title: "Your money doesn't sleep! 🔥",
        body: "Your streak might! Tap to log your money actions for today and keep it alive.",
        data: { screen: 'profile' },
      },
      trigger: null,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Intro Section */}
        <View style={styles.introCard}>
          <View style={styles.iconContainer}>
            <Bell size={28} color={colors.brandGreen} />
          </View>
          <Text style={styles.sectionTitle}>Daily Habit Reminders</Text>
          <Text style={styles.description}>
            Consistent stackers build wealth 4x faster. Choose how and when you want to stay accountable.
          </Text>
        </View>

        {/* Reminders List */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>HABIT NOTIFICATIONS</Text>

          {/* Option 1: Streaks */}
          <View style={styles.optionRow}>
            <View style={styles.optionIconContainer}>
              <Flame size={20} color="#ff9600" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Streak Protection</Text>
              <Text style={styles.optionDesc}>
                "Your money doesn't sleep, but your streak might! 🔥" Reminders to log daily.
              </Text>
            </View>
            <Switch
              value={streakReminders}
              onValueChange={setStreakReminders}
              trackColor={{ false: colors.graphite, true: colors.brandGreen }}
              thumbColor={colors.textPrimary}
            />
          </View>

          {/* Option 2: Progress */}
          <View style={styles.optionRow}>
            <View style={styles.optionIconContainer}>
              <Target size={20} color="#2b6cb0" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Milestone Celebrations</Text>
              <Text style={styles.optionDesc}>
                Dopamine hits when you hit 50% or complete your current investment plans.
              </Text>
            </View>
            <Switch
              value={progressNudges}
              onValueChange={setProgressNudges}
              trackColor={{ false: colors.graphite, true: colors.brandGreen }}
              thumbColor={colors.textPrimary}
            />
          </View>

          {/* Option 3: Competition */}
          <View style={styles.optionRow}>
            <View style={styles.optionIconContainer}>
              <Trophy size={20} color="#d69e2e" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Social & Leagues</Text>
              <Text style={styles.optionDesc}>
                Alerts when you promote leagues or fall behind in the weekly competition.
              </Text>
            </View>
            <Switch
              value={competitionAlerts}
              onValueChange={setCompetitionAlerts}
              trackColor={{ false: colors.graphite, true: colors.brandGreen }}
              thumbColor={colors.textPrimary}
            />
          </View>
        </View>

        {/* Daily Schedule Card */}
        {streakReminders && (
          <View style={styles.section}>
            <View style={styles.scheduleHeader}>
              <Clock size={18} color={colors.ash} />
              <Text style={styles.sectionHeader}> REMINDER TIME</Text>
            </View>
            <View style={styles.timeSelector}>
              {times.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <Pressable
                    key={time}
                    onPress={() => setSelectedTime(time)}
                    style={[
                      styles.timeChip,
                      isSelected && styles.timeChipSelected
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        isSelected && styles.timeTextSelected
                      ]}
                    >
                      {time}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Dev Tool: Send Test Notification */}
        <View style={styles.devSection}>
          <Text style={styles.sectionHeader}>DEVELOPER UTILITIES</Text>
          <Pressable onPress={triggerTestNotification} style={styles.devButton}>
            <Text style={styles.devButtonText}>Send Test Notification</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  content: {
    padding: spacing.lg,
  },
  introCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.graphite,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(88, 204, 2, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.ash,
    textAlign: 'center',
    lineHeight: 18,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.ash,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.graphite,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  optionTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  optionDesc: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.ash,
    lineHeight: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
  },
  timeChipSelected: {
    backgroundColor: colors.brandGreen,
    borderColor: colors.brandGreen,
  },
  timeText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  timeTextSelected: {
    color: colors.background,
  },
  devSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.graphite,
    marginBottom: spacing.xxl,
  },
  devButton: {
    backgroundColor: 'rgba(88, 204, 2, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.brandGreen,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devButtonText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.brandGreen,
  },
});
