import Svg, { Circle, Path } from 'react-native-svg';

type Props = { size?: number };

/** Concentric target rings in shades of green with a white upward arrow — thank-you screen. */
export function TargetIcon({ size = 72 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <Circle cx={36} cy={36} r={34} fill="#a5ed6e" />
      <Circle cx={36} cy={36} r={23} fill="#58cc02" />
      <Circle cx={36} cy={36} r={12} fill="#2d7a00" />
      <Path
        d="M36 44V26M36 26l-7 7M36 26l7 7"
        stroke="#ffffff"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
