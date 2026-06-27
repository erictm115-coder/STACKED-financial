import Svg, { Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';

type Props = { size?: number; color?: string };

/** The checked state of CheckButton's checkbox: filled green square with a white tick. */
export function CheckboxTick({ size = 20, color = colors.brandGreen }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect x={0} y={0} width={20} height={20} rx={4} fill={color} />
      <Path
        d="M5.5 10.2l2.6 2.6L14.5 7"
        stroke={colors.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
