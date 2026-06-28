import { Briefcase, CreditCard, PiggyBank, TrendingUp, Wallet } from 'lucide-react-native';

import { colors } from '@/constants/theme';

/** iconKey (from the goal catalogue) → lucide icon component. */
const ICONS = {
  debt: CreditCard,
  investing: TrendingUp,
  saving: PiggyBank,
  budgeting: Wallet,
  income: Briefcase,
} as const;

type Props = { iconKey: string; size?: number; color?: string };

export function GoalIcon({ iconKey, size = 22, color = colors.brandGreen }: Props) {
  const Icon = ICONS[iconKey as keyof typeof ICONS] ?? TrendingUp;
  return <Icon size={size} color={color} />;
}
