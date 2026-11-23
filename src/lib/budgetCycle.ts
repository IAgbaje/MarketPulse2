import type { BudgetConfig, BudgetFrequency } from '../types';

export interface BudgetFrequencyOption {
  value: BudgetFrequency;
  label: string;
  shortLabel: string;
  periodName: 'month' | 'quarter';
  periodHeading: string;
  periodNoun: string;
  defaultDays: number;
  runsPerPeriod: number;
  helperText: string;
}

export const BUDGET_FREQUENCY_OPTIONS: readonly BudgetFrequencyOption[] = [
  {
    value: 'Weekly',
    label: 'Every Week',
    shortLabel: 'Weekly',
    periodName: 'month',
    periodHeading: "This Month's Food Money",
    periodNoun: 'month',
    defaultDays: 30,
    runsPerPeriod: 4,
    helperText: 'Splits your monthly food budget into 4 weekly market runs.',
  },
  {
    value: 'Fortnightly',
    label: 'Every 2 Weeks',
    shortLabel: '2 Weeks',
    periodName: 'month',
    periodHeading: "This Month's Food Money",
    periodNoun: 'month',
    defaultDays: 30,
    runsPerPeriod: 2,
    helperText: 'Splits your monthly food budget into 2 bigger market runs every 14 days.',
  },
  {
    value: 'Monthly',
    label: 'Once a Month',
    shortLabel: 'Monthly',
    periodName: 'month',
    periodHeading: "This Month's Food Money",
    periodNoun: 'month',
    defaultDays: 30,
    runsPerPeriod: 1,
    helperText: 'Tracks one full monthly bulk shop across 30 days.',
  },
  {
    value: 'Quarterly',
    label: 'Every Quarter',
    shortLabel: 'Quarterly',
    periodName: 'quarter',
    periodHeading: "This Quarter's Food Money",
    periodNoun: 'quarter',
    defaultDays: 90,
    runsPerPeriod: 1,
    helperText: 'Tracks a 3-month (90-day) bulk food plan for bags of rice, oil, beans & dry staples.',
  },
] as const;

const VALID_FREQUENCIES = new Set<BudgetFrequency>([
  'Weekly',
  'Fortnightly',
  'Monthly',
  'Quarterly',
]);

export function normalizeBudgetFrequency(value: unknown): BudgetFrequency {
  if (typeof value === 'string' && VALID_FREQUENCIES.has(value as BudgetFrequency)) {
    return value as BudgetFrequency;
  }
  return 'Monthly';
}

export function getBudgetFrequencyMeta(frequency: BudgetFrequency | string | undefined): BudgetFrequencyOption {
  const safe = normalizeBudgetFrequency(frequency);
  return (
    BUDGET_FREQUENCY_OPTIONS.find((opt) => opt.value === safe) || BUDGET_FREQUENCY_OPTIONS[2]
  );
}

export interface BudgetCycleMetrics {
  meta: BudgetFrequencyOption;
  isQuarterly: boolean;
  target: number;
  spent: number;
  remaining: number;
  currentDay: number;
  totalDays: number;
  daysLeft: number;
  spentPct: number;
  elapsedPct: number;
  isOverPace: boolean;
  expectedSpendByToday: number;
  overPaceAmount: number;
  monthlyEquivalent: number;
  perRunAllowance: number;
  dailySafeSpend: number;
}

export function computeBudgetCycleMetrics(budget: BudgetConfig): BudgetCycleMetrics {
  const meta = getBudgetFrequencyMeta(budget.frequency);
  const isQuarterly = meta.value === 'Quarterly';
  const totalDays = isQuarterly
    ? Math.max(89, Math.min(92, budget.totalDays >= 85 ? budget.totalDays : meta.defaultDays))
    : Math.max(28, Math.min(31, budget.totalDays <= 31 && budget.totalDays >= 28 ? budget.totalDays : meta.defaultDays));
  const currentDay = Math.max(1, Math.min(totalDays, Math.round(budget.currentDay || 1)));
  const target = Math.max(0, Number(budget.monthlyTarget) || 0);
  const spent = Math.max(0, Number(budget.spentSoFar) || 0);
  const remaining = Math.max(0, target - spent);
  const daysLeft = Math.max(1, totalDays - currentDay);

  const spentPct = target > 0 ? Math.min(100, Math.round((spent / target) * 100)) : 0;
  const elapsedPct = Math.min(100, Math.round((currentDay / totalDays) * 100));
  const expectedSpendByToday = Math.round(target * (currentDay / totalDays));
  const overPaceAmount = Math.max(0, spent - expectedSpendByToday);
  const isOverPace = spent > expectedSpendByToday;

  const monthlyEquivalent = isQuarterly ? Math.round(target / 3) : target;
  const perRunAllowance = Math.round(target / meta.runsPerPeriod);
  const dailySafeSpend = Math.round(remaining / daysLeft);

  return {
    meta,
    isQuarterly,
    target,
    spent,
    remaining,
    currentDay,
    totalDays,
    daysLeft,
    spentPct,
    elapsedPct,
    isOverPace,
    expectedSpendByToday,
    overPaceAmount,
    monthlyEquivalent,
    perRunAllowance,
    dailySafeSpend,
  };
}
