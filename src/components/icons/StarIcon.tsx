import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const STAR_PATH =
  'M7 0.5l1.8 4.05 4.45.4-3.36 2.93 1.02 4.37L7 9.98l-3.91 2.27 1.02-4.37L0.75 4.95l4.45-.4L7 0.5z';

type StarProps = { size?: number; filled?: boolean };

export function StarIcon({ size = 14, filled = true }: StarProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d={STAR_PATH} fill={filled ? '#f4c430' : 'none'} stroke="#e6b000" strokeWidth={0.6} />
    </Svg>
  );
}

/** Row of 5 filled stars — replaces the "⭐⭐⭐⭐⭐" emoji text on the loading screen. */
export function StarRow({ size = 14, count = 5 }: { size?: number; count?: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} size={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
});
