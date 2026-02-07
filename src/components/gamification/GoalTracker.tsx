'use client';

import { useState } from 'react';
import { UserGoal } from '@/types/gamification';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Target, Trash2, CheckCircle2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalTrackerProps {
  goals: UserGoal[];
  onAddGoal: (goal: Omit<UserGoal, 'id' | 'current' | 'completed'>) => void;
  onRemoveGoal: (goalId: string) => void;
}

export function GoalTracker({ goals, onAddGoal, onRemoveGoal }: GoalTrackerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    description: '',
    target: 10,
    type: 'quizzes' as 'quizzes' | 'score' | 'streak',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleAddGoal = () => {
    if (!newGoal.description.trim()) return;
    onAddGoal(newGoal);
    setShowAddDialog(false);
    setNewGoal({
      description: '',
      target: 10,
      type: 'quizzes',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  return (
    <div className="space-y-4">
      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          {activeGoals.map((goal) => {
            const progressPercent = Math.min(100, (goal.current / goal.target) * 100);
            const isOverdue = new Date(goal.targetDate) < new Date();

            return (
              <Card key={goal.id} className="glass-cosmic">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{goal.description}</p>
                        <p className={cn(
                          'text-xs flex items-center gap-1',
                          isOverdue ? 'text-red-400' : 'text-muted-foreground'
                        )}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(goal.targetDate)}
                          {isOverdue && ' (en retard)'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveGoal(goal.id)}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {goal.type === 'quizzes' && 'Quiz'}
                        {goal.type === 'score' && 'Score'}
                        {goal.type === 'streak' && 'Série'}
                      </span>
                      <span className="text-foreground">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Complétés</p>
          {completedGoals.slice(0, 3).map((goal) => (
            <div
              key={goal.id}
              className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">{goal.description}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveGoal(goal.id)}
                className="text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Goal Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowAddDialog(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter un objectif
      </Button>

      {/* Add Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel objectif</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Description</label>
              <Input
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Ex: Compléter 20 quiz ce mois"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as 'quizzes' | 'score' | 'streak' })}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                >
                  <option value="quizzes">Quiz complétés</option>
                  <option value="score">Score à atteindre</option>
                  <option value="streak">Jours d'affilée</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Objectif</label>
                <Input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                  min={1}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Date limite</label>
              <Input
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddGoal} disabled={!newGoal.description.trim()}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
