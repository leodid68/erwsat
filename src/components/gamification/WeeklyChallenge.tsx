'use client';

import { WeeklyChallenge as WeeklyChallengeType } from '@/types/gamification';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyChallengeProps {
  challenge: WeeklyChallengeType | null;
}

export function WeeklyChallenge({ challenge }: WeeklyChallengeProps) {
  if (!challenge) {
    return (
      <Card className="glass-cosmic">
        <CardContent className="py-6 text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Complétez un quiz pour débloquer le défi hebdomadaire
          </p>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = Math.min(100, (challenge.current / challenge.target) * 100);

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        challenge.completed
          ? 'glass-cosmic border-emerald-500/30'
          : 'glass-cosmic border-yellow-600/30'
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                challenge.completed
                  ? 'bg-emerald-500/20'
                  : 'bg-gradient-to-br from-yellow-500 to-amber-500'
              )}
            >
              {challenge.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Zap className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Défi de la semaine
              </p>
              <p className="font-medium text-foreground">{challenge.description}</p>
            </div>
          </div>
          {challenge.completed && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-500/20 px-2 py-1 rounded-full">
              Complété !
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className={cn(
              'font-mono',
              challenge.completed ? 'text-emerald-600' : 'text-foreground'
            )}>
              {challenge.current}/{challenge.target}
            </span>
          </div>
          <Progress
            value={progressPercent}
            className={cn(
              'h-2',
              challenge.completed ? '[&>div]:bg-emerald-500' : '[&>div]:bg-yellow-600'
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
