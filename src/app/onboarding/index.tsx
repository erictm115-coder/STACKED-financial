import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { SLIDES } from '@/components/onboarding/slides';
import { WelcomeSlide } from '@/components/onboarding/WelcomeSlide';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { colors } from '@/constants/theme';

const TOTAL = SLIDES.length + 1; // 5 narrative slides + welcome

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goNext = () => {
    const next = Math.min(activeIndex + 1, TOTAL - 1);
    if (next !== activeIndex) {
      setActiveIndex(next); // optimistic — keeps dots + entrance in sync with the tap
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, i) => (
          <OnboardingSlide
            key={slide.key}
            slide={slide}
            index={i}
            activeIndex={activeIndex}
            onAdvance={goNext}
          />
        ))}
        <WelcomeSlide index={SLIDES.length} activeIndex={activeIndex} />
      </ScrollView>

      <View pointerEvents="none" style={[styles.dots, { top: insets.top + 12 }]}>
        <ProgressDots count={TOTAL} activeIndex={activeIndex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  dots: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 10 },
});
