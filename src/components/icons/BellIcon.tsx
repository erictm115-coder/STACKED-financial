import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/constants/theme';

type Props = { size?: number; color?: string };

export function BellIcon({ size = 64, color = colors.accentBlue }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.5a5.5 5.5 0 0 0-5.5 5.5v3.2c0 .85-.36 1.66-1 2.23L4 15h16l-1.5-1.57c-.64-.57-1-1.38-1-2.23V8A5.5 5.5 0 0 0 12 2.5z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 18a2.5 2.5 0 0 0 5 0"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={18.5} cy={5.5} r={2.5} fill={colors.brandGreen} />
    </Svg>
  );
}
