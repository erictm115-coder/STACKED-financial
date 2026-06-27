import { StyleProp, Text, TextStyle } from 'react-native';

import { colors } from '@/constants/theme';

export type TextSegment = {
  text: string;
  /** Optional accent color for this phrase. Omit to use baseColor. */
  color?: string;
};

type Props = {
  segments: TextSegment[];
  /** Base text style (font family, size, spacing) applied to the whole line. */
  style?: StyleProp<TextStyle>;
  /** Color for non-highlighted segments. */
  baseColor?: string;
};

/**
 * Renders a line of text where individual phrases can carry an accent color,
 * sitting naturally inline within the surrounding copy. Nested <Text> inherits
 * the font family / size from the parent style.
 */
export function HighlightedText({ segments, style, baseColor = colors.textPrimary }: Props) {
  return (
    <Text style={style}>
      {segments.map((seg, i) => (
        <Text key={i} style={{ color: seg.color ?? baseColor }}>
          {seg.text}
        </Text>
      ))}
    </Text>
  );
}
