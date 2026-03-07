import { User } from '../types';

export type FeatureName =
  | 'analyzer'
  | 'rewrite'
  | 'cover_letter'
  | 'keywords'
  | 'ats_check'
  | 'quantifier'
  | 'summary'
  | 'skills'
  | 'headshot'
  | 'interview_prep'
  | 'salary_negotiation'
  | 'linkedin_optimizer';

export type AccessReason =
  | 'ok'
  | 'not_authenticated'
  | 'free_tier'
  | 'upgrade_required'
  | 'limit_reached';

export interface FeatureAccess {
  canAccess: boolean;
  reason: AccessReason;
  requiredTier: 'free' | 'pro' | 'package';
}

const FEATURE_TIER_MAP: Record<FeatureName, 'free' | 'pro' | 'package'> = {
  analyzer:            'free',
  rewrite:             'free',
  keywords:            'free',
  ats_check:           'free',
  quantifier:          'free',
  summary:             'free',
  skills:              'free',
  cover_letter:        'pro',
  headshot:            'pro',
  interview_prep:      'pro',
  salary_negotiation:  'package',
  linkedin_optimizer:  'package',
};

const TIER_RANK: Record<'free' | 'pro' | 'package', number> = {
  free:    0,
  pro:     1,
  package: 2,
};

const isGuest = (user: User): boolean => user.id.startsWith('guest_');

export function useFeatureAccess(
  featureName: FeatureName,
  user: User | null
): FeatureAccess {
  const required = FEATURE_TIER_MAP[featureName];

  if (!user) {
    return { canAccess: false, reason: 'not_authenticated', requiredTier: required };
  }

  if (isGuest(user)) {
    if (required !== 'free') {
      return { canAccess: false, reason: 'not_authenticated', requiredTier: required };
    }
    if (user.credits <= 0) {
      return { canAccess: false, reason: 'limit_reached', requiredTier: required };
    }
    return { canAccess: true, reason: 'ok', requiredTier: required };
  }

  const userRank = TIER_RANK[user.tier];
  const requiredRank = TIER_RANK[required];

  if (userRank < requiredRank) {
    if (user.tier === 'free') {
      return { canAccess: false, reason: 'free_tier', requiredTier: required };
    }
    return { canAccess: false, reason: 'upgrade_required', requiredTier: required };
  }

  if (user.tier === 'free' && user.credits <= 0) {
    return { canAccess: false, reason: 'limit_reached', requiredTier: required };
  }

  return { canAccess: true, reason: 'ok', requiredTier: required };
  }
