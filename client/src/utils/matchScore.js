import { CheckCircle2, Award, AlertTriangle, XCircle } from 'lucide-react';

/**
 * Single Canonical Source of Truth for Match Labels & Score Thresholds.
 * 
 * Threshold Bands:
 *  80% - 100% : Perfect Match (Emerald Green)
 *  60% - 79.99%: Strong Match (Light Green / Indigo)
 *  40% - 59.99%: Moderate Match (Amber / Orange)
 *  0%  - 39.99%: Weak Match (Rose / Red)
 */
export function getMatchLabel(score) {
  const numericScore = Number(score) || 0;

  if (numericScore >= 80) {
    return {
      label: 'Perfect Match',
      verdictText: 'PERFECT MATCH FOR THIS JOB',
      subtext: 'This candidate is an exceptional fit with high skill overlap and strong technical alignment.',
      color: '#10b981', // Tailwind emerald-500
      textColor: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      icon: CheckCircle2,
    };
  } else if (numericScore >= 60) {
    return {
      label: 'Strong Match',
      verdictText: 'STRONG CANDIDATE FIT',
      subtext: 'The candidate meets key foundational requirements for the role with solid skills alignment.',
      color: '#059669', // Tailwind emerald-600
      textColor: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      icon: Award,
    };
  } else if (numericScore >= 40) {
    return {
      label: 'Moderate Match',
      verdictText: 'MODERATE / PARTIAL MATCH',
      subtext: 'Candidate possesses relevant experience but is missing several core job requirements.',
      color: '#f59e0b', // Tailwind amber-500
      textColor: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      icon: AlertTriangle,
    };
  } else {
    return {
      label: 'Weak Match',
      verdictText: 'WEAK MATCH FOR THIS JOB',
      subtext: 'Low textual and skill overlap with the target job description. Lacks key required competencies.',
      color: '#f43f5e', // Tailwind rose-500
      textColor: 'text-rose-700 dark:text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      icon: XCircle,
    };
  }
}
