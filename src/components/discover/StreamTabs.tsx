import React, { useEffect } from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { DollarSign, Rocket, Target, LucideIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { colors, fonts } from '@/constants/theme';

export type Stream = 'money_foundations' | 'income_builders' | 'wealthy_habits';

interface StreamTab {
  key: Stream;
  label: string;
  icon: LucideIcon;
  color: string;
}

const TABS: StreamTab[] = [
  { key: 'money_foundations', label: 'Money', icon: DollarSign, color: '#58cc02' },
  { key: 'income_builders', label: 'Income', icon: Rocket, color: '#1cb0f6' },
  { key: 'wealthy_habits', label: 'Habits', icon: Target, color: '#f4c430' },
];

interface Props {
  activeStream: Stream;
  onChangeStream: (stream: Stream) => void;
}

export function StreamTabs({ activeStream, onChangeStream }: Props) {
  const pulseScale = useSharedValue(1);

  // One-time gentle pulse animation on first load
  useEffect(() => {
    const checkFirstVisit = async () => {
      try {
        const visited = await AsyncStorage.getItem('discover_tabs_visited');
        if (!visited) {
          // Delay pulse slightly to run after mount transitions
          setTimeout(() => {
            pulseScale.value = withSequence(
              withTiming(1.03, { duration: 400, easing: Easing.inOut(Easing.ease) }),
              withTiming(1.0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
              withTiming(1.03, { duration: 400, easing: Easing.inOut(Easing.ease) }),
              withTiming(1.0, { duration: 400, easing: Easing.inOut(Easing.ease) })
            );
          }, 600);
          await AsyncStorage.setItem('discover_tabs_visited', 'true');
        }
      } catch (err) {
        console.error('AsyncStorage error in StreamTabs:', err);
      }
    };
    checkFirstVisit();
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleTabPress = (key: Stream) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeStream(key);
  };

  return (
    <Animated.View style={[styles.tabBar, animatedContainerStyle]}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeStream;
        const Icon = tab.icon;
        const activeColor = tab.color;

        return (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              isActive && {
                borderColor: activeColor,
                backgroundColor: `${activeColor}26`, // 26 = ~15% opacity hex
              },
            ]}
            onPress={() => handleTabPress(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Icon
              size={14}
              color={isActive ? activeColor : '#777777'}
            />
            <Text
              style={[
                styles.tabLabel,
                isActive && { color: activeColor },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 100,
    padding: 4,
    gap: 4,
    alignSelf: 'flex-start', // hug content, don't stretch full width
    marginHorizontal: 24,
    marginVertical: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,      // tighten this
    paddingHorizontal: 12,   // tighten this
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'transparent', // inactive has invisible border so layout doesn't shift on activate
  },
  tabLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#777777',
    lineHeight: 16, // explicit lineHeight prevents vertical misalignment with the icon
  },
});
