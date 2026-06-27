import Svg, { Circle, Line, Path } from 'react-native-svg';

type Props = { size?: number; color?: string };

/** Circle with an upward bar chart — red for the current score, green for potential. */
export function OverallIcon({ size = 16, color = '#ff4b4b' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx={8} cy={8} r={7} stroke={color} strokeWidth={1.3} />
      <Path d="M5.5 9.5v1.5M8 7v4M10.5 5v6" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

/** Lightbulb outline — Money Mindset. */
export function MoneyMindsetIcon({ size = 16, color = '#1cb0f6' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 1.5a4.5 4.5 0 0 0-2.5 8.25c.3.2.5.55.5.92V11h4v-.33c0-.37.2-.72.5-.92A4.5 4.5 0 0 0 8 1.5z"
        stroke={color}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <Path d="M6.5 13h3M7 14.5h2" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}

/** Eye / lens outline — Clarity. */
export function ClarityIcon({ size = 16, color = '#a5ed6e' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"
        stroke={color}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <Circle cx={8} cy={8} r={2} stroke={color} strokeWidth={1.2} />
    </Svg>
  );
}

/** Lightning bolt — Discipline. */
export function DisciplineIcon({ size = 16, color = '#f4c430' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M9 1.5L3.5 9h3.3L6 14.5L12.5 7H9.2L9 1.5z" fill={color} />
    </Svg>
  );
}

/** Crosshair / target — Focus. */
export function FocusIcon({ size = 16, color = '#58cc02' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx={8} cy={8} r={6} stroke={color} strokeWidth={1.2} />
      <Circle cx={8} cy={8} r={2} stroke={color} strokeWidth={1.2} />
      <Line x1={8} y1={0.5} x2={8} y2={3} stroke={color} strokeWidth={1.2} />
      <Line x1={8} y1={13} x2={8} y2={15.5} stroke={color} strokeWidth={1.2} />
      <Line x1={0.5} y1={8} x2={3} y2={8} stroke={color} strokeWidth={1.2} />
      <Line x1={13} y1={8} x2={15.5} y2={8} stroke={color} strokeWidth={1.2} />
    </Svg>
  );
}

/** Upward trending line with arrowhead — Investment Readiness. */
export function InvestmentIcon({ size = 16, color = '#1cb0f6' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M1.5 12L6 7.5l3 3 5.5-5.5"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M10.5 5h4v4" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
