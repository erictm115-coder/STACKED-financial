import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, fonts } from '@/constants/theme';

export default function LoadingScreen() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.06, { duration: 900 }), -1, true);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Image
          source={require('@/assets/images/appicon.png')}
          style={styles.icon}
          contentFit="contain"
        />
      </Animated.View>
      <Text style={styles.label}>Stacked</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { width: 64, height: 64, borderRadius: 14 },
  label: { fontFamily: fonts.bold, fontSize: 16, color: colors.brandGreen, marginTop: 16 },
});
