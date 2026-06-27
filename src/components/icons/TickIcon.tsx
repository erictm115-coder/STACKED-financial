import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/constants/theme';

type Props = { size?: number; color?: string };

/** Filled green circle with a white check — used in feature lists. */
export function TickIcon({ size = 20, color = colors.brandGreen }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={10} fill={color} />
      <Path
        d="M6 10.2l2.6 2.6L14 7"
        stroke={colors.background}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
