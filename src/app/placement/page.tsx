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
  Download,
  Loader2,
  Sparkles,
  FileText,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnswerId } from '@/types/question';
import { ExamTimer } from '@/components/quiz/ExamTimer';
import { calculateEstimatedScore } from '@/types/placement-test';

type TestPhase = 'intro' | 'generating' | 'module1' | 'transition' | 'module2' | 'results';
type TestMode = 'official' | 'real' | 'synthetic' | 'static';

interface GeneratedQuestion {
  id: string;
  passage: string;
  passageSource: string;
  questionStem: string;
  choices: { A: string; B: string; C: string; D: string };
  correctAnswer: AnswerId;
  explanation: string;
  domain: string;
  skill: string;
}

interface GeneratedModule {
  moduleId: 1 | 2;
  difficulty: 'Medium' | 'Hard';
  questions: GeneratedQuestion[];
}

interface StoredPassage {
  id: string;
  source: string;
  text: string;
  moduleId: number;
  questionId: string;
}

interface ModuleResult {
  score: number;
  total: number;
  timeSpent: number;
  answers: Record<string, AnswerId>;
}

export default function PlacementTestPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<TestPhase>('intro');
  const [testMode, setTestMode] = useState<TestMode>('official');
  const [currentModule, setCurrentModule] = useState<GeneratedModule | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerId>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerId | null>(null);

  // Generated test data
  const [generatedModules, setGeneratedModules] = useState<GeneratedModule[]>([]);
  const [allPassages, setAllPassages] = useState<StoredPassage[]>([]);
  const [sourcesUsed, setSourcesUsed] = useState<string[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [testName, setTestName] = useState<string>('');

  // Results
  const [module1Result, setModule1Result] = useState<ModuleResult | null>(null);
  const [module2Result, setModule2Result] = useState<ModuleResult | null>(null);

  // Generate test via API
  const generateTest = async (mode: 'official' | 'real' | 'synthetic') => {
    setPhase('generating');
    setGenerationError(null);
    setGenerationProgress(0);

    try {
      // Simulate progress during API call (faster for official since no generation needed)
      const progressSpeed = mode === 'official' ? 20 : 2;
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + progressSpeed, 90));
      }, mode === 'official' ? 100 : 1000);

      // Use different endpoint based on mode
      const endpoint = mode === 'official'
        ? '/api/placement/official'
        : mode === 'real'
        ? '/api/placement/generate-real'
        : '/api/placement/generate';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionsPerModule: 27,
          sources: mode === 'real' ? 'auto' : undefined,
        }),
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de génération');
      }

      setGeneratedModules(data.test.modules);
      setAllPassages(data.test.allPassages);
      setSourcesUsed(data.test.sources || []);
      setTestName(data.test.testName);
      setGenerationProgress(100);

      // Start Module 1
      setTimeout(() => {
        startModuleFromGenerated(data.test.modules[0]);
      }, 500);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Erreur inconnue');
      setPhase('intro');
    }
  };

  // Start module from generated data
  const startModuleFromGenerated = (module: GeneratedModule) => {
    setCurrentModule(module);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFlaggedQuestions(new Set());
    setStartTime(Date.now());
    setPhase(module.moduleId === 1 ? 'module1' : 'module2');
  };

  // Calculate module score
  const calculateModuleScore = useCallback((module: GeneratedModule, moduleAnswers: Record<string, AnswerId>): number => {
    let correct = 0;
    module.questions.forEach(q => {
      if (moduleAnswers[q.id] === q.correctAnswer) {
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

  // Start Module 2 from transition
  const startModule2 = () => {
    const module2 = generatedModules.find(m => m.moduleId === 2);
    if (module2) {
      startModuleFromGenerated(module2);
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

  // Export passages as TXT
  const exportPassages = async (format: 'txt' | 'json' = 'txt') => {
    try {
      const response = await fetch('/api/placement/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passages: allPassages,
          testName,
          format,
        }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${testName}_passages.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
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

  // Generating Phase
  if (phase === 'generating') {
    const getIcon = () => {
      if (testMode === 'official') return <Award className="w-10 h-10 text-white animate-pulse" />;
      if (testMode === 'real') return <BookOpen className="w-10 h-10 text-white animate-pulse" />;
      return <Sparkles className="w-10 h-10 text-white animate-pulse" />;
    };

    const getGradient = () => {
      if (testMode === 'official') return 'from-violet-500 to-purple-600';
      if (testMode === 'real') return 'from-emerald-500 to-green-500';
      return 'from-amber-500 to-orange-500';
    };

    const getTitle = () => {
      if (testMode === 'official') return 'Chargement des questions officielles...';
      if (testMode === 'real') return 'Extraction des textes réels...';
      return 'Génération du test en cours...';
    };

    const getDescription = () => {
      if (testMode === 'official') return 'Sélection aléatoire parmi 2193 questions SAT authentiques';
      if (testMode === 'real') return 'Claude extrait 54 passages de Dickens, Austen, Wikipedia, Guardian...';
      return 'Claude génère 54 textes uniques et questions personnalisées';
    };

    const getProgressText = () => {
      if (generationProgress >= 100) return 'Terminé ! Démarrage du test...';
      if (testMode === 'official') return `${Math.round(generationProgress)}% - Préparation du test...`;
      if (testMode === 'real') return `${Math.round(generationProgress)}% - Récupération et analyse des sources...`;
      return `${Math.round(generationProgress)}% - Création des passages et questions...`;
    };

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="glass-cosmic">
          <CardContent className="p-8 text-center space-y-6">
            <div className={cn('w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br flex items-center justify-center', getGradient())}>
              {getIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {getTitle()}
              </h2>
              <p className="text-muted-foreground">
                {getDescription()}
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={generationProgress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {getProgressText()}
              </p>
            </div>

            {generationError && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm">{generationError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPhase('intro')}
                  className="mt-2"
                >
                  Retour
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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

        {/* Test Mode Selection */}
        <Card className="glass-cosmic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Source des questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Official SAT - RECOMMENDED */}
              <button
                onClick={() => setTestMode('official')}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all',
                  testMode === 'official'
                    ? 'border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/20'
                    : 'border-border hover:border-violet-500/30'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    testMode === 'official'
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                      : 'bg-muted'
                  )}>
                    <Award className={cn('w-5 h-5', testMode === 'official' ? 'text-white' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <p className="font-medium">Questions SAT officielles</p>
                    <p className="text-xs text-violet-500">Recommandé • 2193 questions</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vraies questions du College Board avec passages,
                  réponses et explications officielles.
                </p>
              </button>

              {/* Real texts */}
              <button
                onClick={() => setTestMode('real')}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all',
                  testMode === 'real'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-border hover:border-emerald-500/30'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    testMode === 'real'
                      ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                      : 'bg-muted'
                  )}>
                    <BookOpen className={cn('w-5 h-5', testMode === 'real' ? 'text-white' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <p className="font-medium">Textes réels + IA</p>
                    <p className="text-xs text-muted-foreground">Génération ~3-5 min</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vrais extraits (Dickens, Wikipedia...) avec
                  questions générées par Claude.
                </p>
              </button>

              {/* Synthetic texts */}
              <button
                onClick={() => setTestMode('synthetic')}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all',
                  testMode === 'synthetic'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-border hover:border-amber-500/30'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    testMode === 'synthetic'
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                      : 'bg-muted'
                  )}>
                    <Sparkles className={cn('w-5 h-5', testMode === 'synthetic' ? 'text-white' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <p className="font-medium">100% IA</p>
                    <p className="text-xs text-muted-foreground">Génération ~2-3 min</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Textes et questions entièrement générés par Claude.
                  Style SAT mais contenu synthétique.
                </p>
              </button>

              {/* Static test */}
              <button
                onClick={() => setTestMode('static')}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all',
                  testMode === 'static'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-border hover:border-blue-500/30'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    testMode === 'static'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                      : 'bg-muted'
                  )}>
                    <FileText className={cn('w-5 h-5', testMode === 'static' ? 'text-white' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <p className="font-medium">Test pré-généré</p>
                    <p className="text-xs text-muted-foreground">Instantané</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  54 questions fixes prêtes à l'emploi.
                  Toujours le même test.
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

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
                Teste vos compétences fondamentales. Questions accessibles mais rigoureuses.
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
                Discrimine le top 10%. Textes denses, distracteurs vicieux.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="border-red-500/30 text-red-500">True but Irrelevant</Badge>
                <Badge variant="outline" className="border-red-500/30 text-red-500">Scope Error</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Button */}
        <div className="text-center space-y-4">
          <Button
            size="lg"
            onClick={
              testMode === 'static'
                ? () => router.push('/placement/static')
                : () => generateTest(testMode as 'official' | 'real' | 'synthetic')
            }
            className={cn(
              'text-lg px-8 py-6',
              testMode === 'official'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
                : testMode === 'real'
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                : 'btn-cosmic'
            )}
          >
            {testMode === 'official' ? (
              <>
                <Award className="w-5 h-5 mr-2" />
                Commencer (questions officielles)
              </>
            ) : testMode === 'real' ? (
              <>
                <BookOpen className="w-5 h-5 mr-2" />
                Extraire et commencer
              </>
            ) : testMode === 'synthetic' ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Générer et commencer
              </>
            ) : (
              <>
                Commencer le test
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            {testMode === 'official'
              ? 'Chargement instantané • Test: 64 minutes'
              : testMode === 'real'
              ? 'Extraction: ~3-5 minutes • Test: 64 minutes'
              : testMode === 'synthetic'
              ? 'Génération: ~2-3 minutes • Test: 64 minutes'
              : 'Durée totale: 64 minutes'}
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
                    Méfiez-vous des réponses "vraies mais hors-sujet".
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

        {/* Sources Used (real mode) */}
        {sourcesUsed.length > 0 && (
          <Card className="glass-cosmic">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Sources utilisées
              </CardTitle>
              <CardDescription>
                Textes réels extraits de ces œuvres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sourcesUsed.map((source, idx) => (
                  <Badge key={idx} variant="outline" className="border-emerald-500/30 text-emerald-600">
                    {source}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export & Actions */}
        {allPassages.length > 0 && (
          <Card className="glass-cosmic">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Exporter les passages
              </CardTitle>
              <CardDescription>
                {allPassages.length} {sourcesUsed.length > 0 ? 'extraits réels' : 'textes générés'} disponibles pour export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => exportPassages('txt')} className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Export TXT
                </Button>
                <Button variant="outline" onClick={() => exportPassages('json')} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
            setGeneratedModules([]);
            setAllPassages([]);
            setSourcesUsed([]);
          }} className="btn-cosmic">
            <RotateCcw className="w-4 h-4 mr-2" />
            Nouveau test
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
              Module {currentModule.moduleId} - {currentModule.difficulty}
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
              timeLimit={32 * 60}
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
                    {currentQuestion.passageSource}
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
                  {currentQuestion.questionStem}
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
                Terminer le Module {currentModule.moduleId}
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
