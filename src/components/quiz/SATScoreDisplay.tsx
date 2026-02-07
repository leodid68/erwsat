'use client';

import {
  estimateSATScore,
  getScoreColor,
  getScoreBadgeColor,
  getPerformanceLevelLabel,
  SATScoreEstimate,
} from '@/lib/sat-scoring';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, TrendingUp, Users, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SATScoreDisplayProps {
  correctAnswers: number;
  totalQuestions: number;
  difficultyBreakdown?: { easy: number; medium: number; hard: number };
  showDetails?: boolean;
}

export function SATScoreDisplay({
  correctAnswers,
  totalQuestions,
  difficultyBreakdown,
  showDetails = true,
}: SATScoreDisplayProps) {
  const estimate = estimateSATScore(correctAnswers, totalQuestions, difficultyBreakdown);

  return (
    <Card className="glass-cosmic border-primary/20 overflow-hidden">
      <CardContent className="p-0">
        {/* Main Score Display */}
        <div className="relative p-6 text-center">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-violet-700/10" />

          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Score SAT Estimé</span>
            </div>

            <div className={cn('text-6xl font-bold mb-2', getScoreColor(estimate.scaledScore))}>
              {estimate.scaledScore}
            </div>

            <div className="text-sm text-muted-foreground">
              sur 800 points
            </div>

            {/* Adjusted score if different */}
            {estimate.adjustedScore && estimate.adjustedScore !== estimate.scaledScore && (
              <div className="mt-2 text-xs text-muted-foreground">
                Score ajusté (difficulté): {estimate.adjustedScore}
              </div>
            )}
          </div>
        </div>

        {showDetails && (
          <>
            {/* Score Bar */}
            <div className="px-6 pb-4">
              <div className="relative h-3 bg-white/4 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-400 to-violet-600 rounded-full transition-all duration-500"
                  style={{ width: `${((estimate.scaledScore - 200) / 600) * 100}%` }}
                />
                {/* Score markers */}
                <div className="absolute inset-0 flex justify-between px-1">
                  {[400, 500, 600, 700].map((mark) => (
                    <div
                      key={mark}
                      className="w-px h-full bg-white/20"
                      style={{ marginLeft: `${((mark - 200) / 600) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>200</span>
                <span>500</span>
                <span>800</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 border-t border-border">
              <div className="p-4 text-center border-r border-border">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {estimate.rawScore}/{estimate.totalQuestions}
                </div>
                <div className="text-xs text-muted-foreground">Bonnes réponses</div>
              </div>

              <div className="p-4 text-center border-r border-border">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {estimate.percentile}%
                </div>
                <div className="text-xs text-muted-foreground">Percentile</div>
              </div>

              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className={cn('text-sm font-semibold', getScoreColor(estimate.scaledScore))}>
                  {getPerformanceLevelLabel(estimate.performanceLevel)}
                </div>
                <div className="text-xs text-muted-foreground">Niveau</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact version for use in lists/cards
 */
export function SATScoreCompact({
  correctAnswers,
  totalQuestions,
}: {
  correctAnswers: number;
  totalQuestions: number;
}) {
  const estimate = estimateSATScore(correctAnswers, totalQuestions);

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border',
      getScoreBadgeColor(estimate.scaledScore)
    )}>
      <GraduationCap className="w-4 h-4" />
      <span className="font-bold">{estimate.scaledScore}</span>
      <span className="text-xs opacity-70">SAT</span>
    </div>
  );
}
