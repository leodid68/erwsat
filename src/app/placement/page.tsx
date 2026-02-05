'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap,
  Clock,
  Brain,
  Target,
  ChevronRight,
  ChevronLeft,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Zap,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SAT_PLACEMENT_TEST_01 } from '@/data/sat-placement-test';
import {
  PlacementQuestion,
  PlacementModule,
  calculateEstimatedScore,
} from '@/types/placement-test';
import { AnswerId } from '@/types/question';
import { ExamTimer } from '@/components/quiz/ExamTimer';

type TestPhase = 'intro' | 'module1' | 'transition' | 'module2' | 'results';

interface ModuleResult {
  score: number;
  total: number;
  timeSpent: number;
  answers: Record<string, AnswerId>;
}

export default function PlacementTestPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<TestPhase>('intro');
  const [currentModule, setCurrentModule] = useState<PlacementModule | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerId>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerId | null>(null);

  // Results
  const [module1Result, setModule1Result] = useState<ModuleResult | null>(null);
  const [module2Result, setModule2Result] = useState<ModuleResult | null>(null);

  const test = SAT_PLACEMENT_TEST_01;

  // Start Module 1
  const startModule1 = () => {
    setCurrentModule(test.modules[0]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFlaggedQuestions(new Set());
    setStartTime(Date.now());
    setPhase('module1');
  };

  // Start Module 2
  const startModule2 = () => {
    setCurrentModule(test.modules[1]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFlaggedQuestions(new Set());
    setStartTime(Date.now());
    setPhase('module2');
  };

  // Calculate module score
  const calculateModuleScore = useCallback((module: PlacementModule, moduleAnswers: Record<string, AnswerId>): number => {
    let correct = 0;
    module.questions.forEach(q => {
      if (moduleAnswers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    return correct;
  }, []);

  // Complete current module
  const completeModule = () => {
    if (!currentModule || !startTime) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const score = calculateModuleScore(currentModule, answers);

    const result: ModuleResult = {
      score,
      total: currentModule.questions.length,
      timeSpent,
      answers: { ...answers },
    };

    if (phase === 'module1') {
      setModule1Result(result);
      setPhase('transition');
    } else if (phase === 'module2') {
      setModule2Result(result);
      setPhase('results');
    }
  };

  // Handle answer selection
  const handleSelectAnswer = (answerId: AnswerId) => {
    if (!currentModule) return;
    const questionId = currentModule.questions[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    setSelectedAnswer(answerId);
  };

  // Navigation
  const goToQuestion = (index: number) => {
    if (!currentModule) return;
    if (index >= 0 && index < currentModule.questions.length) {
      setCurrentQuestionIndex(index);
      setSelectedAnswer(answers[currentModule.questions[index].id] || null);
      setShowExplanation(false);
    }
  };

  const goNext = () => goToQuestion(currentQuestionIndex + 1);
  const goPrev = () => goToQuestion(currentQuestionIndex - 1);

  // Toggle flag
  const toggleFlag = () => {
    if (!currentModule) return;
    const questionId = currentModule.questions[currentQuestionIndex].id;
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Time up handler
  const handleTimeUp = () => {
    completeModule();
  };

  // Current question
  const currentQuestion = currentModule?.questions[currentQuestionIndex];
  const answeredCount = currentModule ? Object.keys(answers).length : 0;
  const progressPercent = currentModule ? (answeredCount / currentModule.questions.length) * 100 : 0;

  // Final score calculation
  const estimatedScore = module1Result
    ? calculateEstimatedScore(
        module1Result.score,
        module1Result.total,
        module2Result?.score,
        module2Result?.total
      )
    : 0;

  // Intro Phase
  if (phase === 'intro') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Test de Placement SAT ERW</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ce test adaptatif de 54 questions évalue votre niveau en Reading & Writing
            et estime votre score SAT (200-800).
          </p>
        </div>

        {/* Test Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-cosmic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-500 font-bold">1</span>
                </div>
                Module 1 : Le Filtre
              </CardTitle>
              <CardDescription>Niveau Medium - 27 questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>32 minutes</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Test vos compétences fondamentales. Les questions sont accessibles
                mais exigent rigueur et attention.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline">Craft & Structure ~28%</Badge>
                <Badge variant="outline">Info & Ideas ~26%</Badge>
                <Badge variant="outline">Conventions ~26%</Badge>
                <Badge variant="outline">Expression ~20%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-cosmic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-500 font-bold">2</span>
                </div>
                Module 2 : Hard Mode
              </CardTitle>
              <CardDescription>Niveau Difficile - 27 questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>32 minutes</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Discrimine les élèves du top 10%. Textes plus denses, distracteurs
                vicieux ("True but Irrelevant", "Scope Error").
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="border-red-500/30 text-red-500">Syntaxe victorienne</Badge>
                <Badge variant="outline" className="border-red-500/30 text-red-500">Arguments abstraits</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sources */}
        <Card className="glass-cosmic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Corpus de textes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['Charles Dickens', 'Jane Austen', 'Nathaniel Hawthorne', 'The Federalist Papers', 'The Guardian Science'].map((source) => (
                <div key={source} className="text-center p-3 rounded-xl bg-muted">
                  <p className="text-sm font-medium text-foreground">{source}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center space-y-4">
          <Button
            size="lg"
            onClick={startModule1}
            className="btn-cosmic text-lg px-8 py-6"
          >
            Commencer le test
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Durée totale estimée : 64 minutes
          </p>
        </div>
      </div>
    );
  }

  // Transition Phase (between modules)
  if (phase === 'transition' && module1Result) {
    const percentage = Math.round((module1Result.score / module1Result.total) * 100);
    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="glass-cosmic">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Module 1 terminé !</CardTitle>
            <CardDescription>Préparez-vous pour le Module 2 (Hard Mode)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-foreground">{module1Result.score}/{module1Result.total}</p>
                <p className="text-xs text-muted-foreground">Questions correctes</p>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-foreground">{percentage}%</p>
                <p className="text-xs text-muted-foreground">Précision</p>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-foreground">{formatTime(module1Result.timeSpent)}</p>
                <p className="text-xs text-muted-foreground">Temps</p>
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-600">Module 2 : Difficulté accrue</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Les textes sont plus denses et les distracteurs plus subtils.
                    Lisez attentivement chaque passage et méfiez-vous des réponses
                    "vraies mais hors-sujet".
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={startModule2}
              className="w-full btn-cosmic"
              size="lg"
            >
              Commencer le Module 2
              <Zap className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Phase
  if (phase === 'results' && module1Result) {
    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const totalCorrect = module1Result.score + (module2Result?.score || 0);
    const totalQuestions = module1Result.total + (module2Result?.total || 0);
    const totalTime = module1Result.timeSpent + (module2Result?.timeSpent || 0);

    // Score tier
    let scoreTier: string;
    let tierColor: string;
    if (estimatedScore >= 750) {
      scoreTier = 'Excellent';
      tierColor = 'text-emerald-500';
    } else if (estimatedScore >= 650) {
      scoreTier = 'Très bon';
      tierColor = 'text-blue-500';
    } else if (estimatedScore >= 550) {
      scoreTier = 'Bon';
      tierColor = 'text-amber-500';
    } else if (estimatedScore >= 450) {
      scoreTier = 'Moyen';
      tierColor = 'text-orange-500';
    } else {
      scoreTier = 'À améliorer';
      tierColor = 'text-red-500';
    }

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header with Score */}
        <Card className="glass-cosmic overflow-hidden">
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <p className="text-muted-foreground mb-2">Score SAT estimé</p>
            <p className="text-6xl font-bold text-gradient">{estimatedScore}</p>
            <p className={cn('text-xl font-medium mt-2', tierColor)}>{scoreTier}</p>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCorrect}/{totalQuestions}</p>
                <p className="text-xs text-muted-foreground">Total correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{Math.round((totalCorrect / totalQuestions) * 100)}%</p>
                <p className="text-xs text-muted-foreground">Précision globale</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatTime(totalTime)}</p>
                <p className="text-xs text-muted-foreground">Temps total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-cosmic">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-500 text-sm font-bold">1</span>
                </div>
                Module 1 (Medium)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-medium">{module1Result.score}/{module1Result.total}</span>
                </div>
                <Progress value={(module1Result.score / module1Result.total) * 100} className="h-2" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Temps</span>
                  <span>{formatTime(module1Result.timeSpent)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {module2Result && (
            <Card className="glass-cosmic">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-500 text-sm font-bold">2</span>
                  </div>
                  Module 2 (Hard)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-medium">{module2Result.score}/{module2Result.total}</span>
                  </div>
                  <Progress value={(module2Result.score / module2Result.total) * 100} className="h-2" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Temps</span>
                    <span>{formatTime(module2Result.timeSpent)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push('/progress')}>
            <Target className="w-4 h-4 mr-2" />
            Voir mes progrès
          </Button>
          <Button onClick={() => {
            setPhase('intro');
            setModule1Result(null);
            setModule2Result(null);
          }} className="btn-cosmic">
            <RotateCcw className="w-4 h-4 mr-2" />
            Refaire le test
          </Button>
        </div>
      </div>
    );
  }

  // Quiz Phase (Module 1 or 2)
  if ((phase === 'module1' || phase === 'module2') && currentModule && currentQuestion) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={cn(
              phase === 'module1' ? 'border-blue-500/30 text-blue-500' : 'border-red-500/30 text-red-500'
            )}>
              Module {currentModule.module_id} - {currentModule.difficulty}
            </Badge>
            <Badge variant="outline">
              {currentQuestion.domain}
            </Badge>
            <Badge variant="secondary">
              {currentQuestion.skill}
            </Badge>
          </div>
          {startTime && (
            <ExamTimer
              startTime={startTime}
              timeLimit={currentModule.time_limit_minutes * 60}
              onTimeUp={handleTimeUp}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Card */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="glass-cosmic">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Question {currentQuestionIndex + 1} / {currentModule.questions.length}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground italic">
                    {currentQuestion.text_source}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Passage */}
                <div className="glass-passage p-4">
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {currentQuestion.passage}
                  </p>
                </div>

                {/* Question Stem */}
                <p className="font-medium text-foreground">
                  {currentQuestion.question_stem}
                </p>

                {/* Choices */}
                <div className="space-y-2">
                  {(['A', 'B', 'C', 'D'] as AnswerId[]).map((choiceId) => {
                    const isSelected = selectedAnswer === choiceId || answers[currentQuestion.id] === choiceId;
                    return (
                      <button
                        key={choiceId}
                        onClick={() => handleSelectAnswer(choiceId)}
                        className={cn(
                          'w-full p-4 rounded-xl text-left transition-all duration-200',
                          'border flex items-start gap-3',
                          isSelected
                            ? 'bg-primary/10 border-primary/40'
                            : 'bg-muted border-border hover:bg-muted hover:border-primary/20'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm',
                          isSelected
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                            : 'bg-background border border-border text-muted-foreground'
                        )}>
                          {choiceId}
                        </div>
                        <span className={cn(
                          'text-sm pt-1',
                          isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'
                        )}>
                          {currentQuestion.choices[choiceId]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Panel */}
          <div className="space-y-4">
            <Card className="glass-cosmic p-4">
              {/* Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">
                    <span className="text-primary">{answeredCount}</span>/{currentModule.questions.length}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-6 gap-1.5 mb-4">
                {currentModule.questions.map((q, index) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = index === currentQuestionIndex;
                  const isFlagged = flaggedQuestions.has(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(index)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-xs font-medium transition-all relative',
                        isCurrent
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                          : isAnswered
                          ? 'bg-success/20 text-success border border-success/30'
                          : 'bg-muted text-muted-foreground border border-border hover:border-primary/20'
                      )}
                    >
                      {index + 1}
                      {isFlagged && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Préc.
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={currentQuestionIndex === currentModule.questions.length - 1}
                  className="flex-1"
                >
                  Suiv.
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Flag */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFlag}
                className={cn(
                  'w-full mb-4',
                  flaggedQuestions.has(currentQuestion.id) && 'border-amber-500/50 text-amber-500 bg-amber-500/10'
                )}
              >
                <Flag className="w-4 h-4 mr-2" />
                {flaggedQuestions.has(currentQuestion.id) ? 'Marquée' : 'Marquer'}
              </Button>

              {/* Submit */}
              <Button
                onClick={completeModule}
                disabled={answeredCount < currentModule.questions.length}
                className="w-full btn-cosmic"
              >
                Terminer le Module {currentModule.module_id}
              </Button>

              {answeredCount < currentModule.questions.length && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {currentModule.questions.length - answeredCount} question(s) sans réponse
                </p>
              )}

              {flaggedQuestions.size > 0 && (
                <p className="text-xs text-amber-500 text-center mt-2">
                  <Flag className="w-3 h-3 inline mr-1" />
                  {flaggedQuestions.size} question(s) marquée(s)
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
