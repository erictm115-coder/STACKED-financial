import Svg, { Ellipse } from 'react-native-svg';

type Props = { size?: number; color?: string };

/**
 * Brand mark for the middle ("My Plans") tab — three stacked coins, echoing the
 * Stacked logo. Uses the active tint passed by the tab bar so it lights up green
 * when selected. Pure stroke art, no fill, per the design system.
 */
export function StackedCoinsIcon({ size = 24, color = '#ffffff' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Ellipse cx={12} cy={17} rx={7} ry={3} stroke={color} strokeWidth={2} />
      <Ellipse cx={12} cy={12} rx={7} ry={3} stroke={color} strokeWidth={2} />
      <Ellipse cx={12} cy={7} rx={7} ry={3} stroke={color} strokeWidth={2} />
    </Svg>
  );
}
