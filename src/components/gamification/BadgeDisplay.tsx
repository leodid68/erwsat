'use client';

import { AVAILABLE_BADGES, UnlockedBadge } from '@/types/gamification';
import { Card, CardContent } from '@/components/ui/card';
import {
  Rocket,
  Target,
  Medal,
  Flame,
  Zap,
  Crown,
  Star,
  BadgeCheck,
  Award,
  GraduationCap,
  Shield,
  Swords,
  Trophy,
  Brain,
  Lightbulb,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  Rocket,
  Target,
  Medal,
  Flame,
  Zap,
  Crown,
  Star,
  BadgeCheck,
  Award,
  GraduationCap,
  Shield,
  Swords,
  Trophy,
  Brain,
  Lightbulb,
};

interface BadgeDisplayProps {
  unlockedBadges: UnlockedBadge[];
  showLocked?: boolean;
}

export function BadgeDisplay({ unlockedBadges, showLocked = true }: BadgeDisplayProps) {
  const unlockedIds = new Set(unlockedBadges.map((b) => b.badgeId));

  // Sort: unlocked first, then locked
  const sortedBadges = [...AVAILABLE_BADGES].sort((a, b) => {
    const aUnlocked = unlockedIds.has(a.id);
    const bUnlocked = unlockedIds.has(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  const visibleBadges = showLocked
    ? sortedBadges
    : sortedBadges.filter((b) => unlockedIds.has(b.id));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {visibleBadges.map((badge) => {
        const isUnlocked = unlockedIds.has(badge.id);
        const unlockedData = unlockedBadges.find((b) => b.badgeId === badge.id);
        const Icon = ICON_MAP[badge.icon] || Star;

        return (
          <Card
            key={badge.id}
            className={cn(
              'transition-all duration-300',
              isUnlocked
                ? 'glass-cosmic border-primary/30 hover:border-primary/50'
                : 'bg-muted border-border opacity-50'
            )}
          >
            <CardContent className="p-4 text-center">
              <div
                className={cn(
                  'w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2',
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg'
                    : 'bg-muted'
                )}
              >
                {isUnlocked ? (
                  <Icon className="w-6 h-6 text-white" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <p
                className={cn(
                  'font-medium text-sm mb-1',
                  isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {badge.name}
              </p>
              <p
                className={cn(
                  'text-xs',
                  isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/60'
                )}
              >
                {badge.description}
              </p>
              {isUnlocked && unlockedData && (
                <p className="text-xs text-primary mt-2">
                  {formatDate(unlockedData.unlockedAt)}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
