import { TextSegment } from '@/components/ui/HighlightedText';
import { colors } from '@/constants/theme';

export type Slide = {
  key: string;
  /** Headline rendered with inline accent highlights. */
  headline: TextSegment[];
  /** Body paragraphs, rendered with a gap between each. */
  body: string[];
};

/** The five narrative slides (slide 6 is the welcome screen, rendered separately). */
export const SLIDES: Slide[] = [
  {
    key: 's1',
    headline: [
      { text: 'Remember when you used to wake up every day with ' },
      { text: 'excitement?', color: colors.brandGreen },
    ],
    body: [
      'Has it been a while? Was the last time you felt truly free… before the bills, the debt, the paycheck to paycheck cycle crept in?',
    ],
  },
  {
    key: 's2',
    headline: [{ text: "It's not your fault.", color: colors.accentBlue }],
    body: [
      'The system was never designed to make you wealthy. Banks, advertisers, and algorithms were built to keep you spending — and keep you stuck.',
      'The incentives are stacked against your financial freedom.',
    ],
  },
  {
    key: 's3',
    headline: [
      {
        text: "You've been conditioned to seek instant gratification from purchases that leave you empty… slowly killing your natural ",
      },
      { text: 'drive, and ambition.', color: colors.brandGreen },
    ],
    body: ['But there is a way out…'],
  },
  {
    key: 's4',
    headline: [{ text: 'Your ' }, { text: 'financial potential.', color: colors.accentBlue }],
    body: [
      "It's as unique to you as your fingerprint.",
      'And it’s your key to breaking free from the system, taking back control, and building the life you actually want.',
    ],
  },
  {
    key: 's5',
    headline: [
      { text: 'Great news, ' },
      { text: "you're already on the right path.", color: colors.brandGreen },
    ],
    body: [
      "Because you're here.",
      'Using Stacked you can get clear on your financial goals, build real money habits, and finally have a plan that actually works for your life.',
    ],
  },
];
