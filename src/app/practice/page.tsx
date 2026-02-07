'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeakAreaSelector } from '@/components/practice/WeakAreaSelector';
import { QuestionType, QUESTION_TYPE_LABELS, AnswerId, Question } from '@/types/question';
import { mapSkillToQuestionType } from '@/lib/official-sat-questions';
import {
  Target,
  Dumbbell,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Filter,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  Zap,
  Check,
  Minus,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type PracticeMode = 'official' | 'custom';
type PracticePhase = 'config' | 'loading' | 'quiz' | 'results';

interface OfficialQuestion {
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

// SAT ERW Domain Structure with Skills
const SAT_DOMAINS = [
  {
    id: 'Information and Ideas',
    label: 'Information and Ideas',
    color: 'emerald',
    icon: '📖',
    skills: [
      { id: 'Central Ideas and Details', label: 'Central Ideas and Details' },
      { id: 'Inferences', label: 'Inferences' },
      { id: 'Command of Evidence', label: 'Command of Evidence' },
    ],
  },
  {
    id: 'Craft and Structure',
    label: 'Craft and Structure',
    color: 'blue',
    icon: '🔧',
    skills: [
      { id: 'Words in Context', label: 'Words in Context' },
      { id: 'Text Structure and Purpose', label: 'Text Structure and Purpose' },
      { id: 'Cross-Text Connections', label: 'Cross-Text Connections' },
    ],
  },
  {
    id: 'Expression of Ideas',
    label: 'Expression of Ideas',
    color: 'purple',
    icon: '✍️',
    skills: [
      { id: 'Rhetorical Synthesis', label: 'Rhetorical Synthesis' },
      { id: 'Transitions', label: 'Transitions' },
    ],
  },
  {
    id: 'Standard English Conventions',
    label: 'Standard English Conventions',
    color: 'amber',
    icon: '📝',
    skills: [
      { id: 'Boundaries', label: 'Boundaries' },
      { id: 'Form, Structure, and Sense', label: 'Form, Structure, and Sense' },
    ],
  },
];

const DIFFICULTIES = [
  { id: 'mixed', label: 'Mixte' },
  { id: 'easy', label: 'Facile' },
  { id: 'medium', label: 'Moyen' },
  { id: 'hard', label: 'Difficile' },
];

export default function PracticePage() {
  const router = useRouter();
  const { progress, quizzes, addQuiz, startQuiz } = useQuizStore();

  // Mode selection
  const [mode, setMode] = useState<PracticeMode>('official');
  const [phase, setPhase] = useState<PracticePhase>('config');

  // Custom mode state
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([]);
  const [questionCount, setQuestionCount] = useState(10);

  // Official mode state
  const [officialDomains, setOfficialDomains] = useState<string[]>([]);
  const [officialSkills, setOfficialSkills] = useState<string[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [officialDifficulty, setOfficialDifficulty] = useState('mixed');
  const [officialStats, setOfficialStats] = useState<{ totalQuestions: number } | null>(null);

  // Quiz state (official mode)
  const [officialQuestions, setOfficialQuestions] = useState<OfficialQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerId>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Get updateProgress from store
  const updateProgress = useQuizStore((state) => state.updateProgress);

  // Load official stats on mount
  useEffect(() => {
    fetch('/api/practice/official')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOfficialStats({ totalQuestions: data.totalQuestions });
        }
      })
      .catch(console.error);
  }, []);

  // Custom mode - collect questions from quizzes
  const allQuestions = useMemo(() => {
    const questions: Question[] = [];
    quizzes.forEach((quiz) => {
      quiz.questions.forEach((q) => {
        if (!questions.find((existing) => existing.id === q.id)) {
          questions.push(q);
        }
      });
    });
    return questions;
  }, [quizzes]);

  const filteredQuestions = useMemo(() => {
    if (selectedTypes.length === 0) return [];
    return allQuestions.filter((q) => selectedTypes.includes(q.type));
  }, [allQuestions, selectedTypes]);

  const weakTypes = useMemo(() => {
    return Object.entries(progress.accuracyByType)
      .filter(([type, stats]) => {
        if (stats.total === 0) return false;
        const accuracy = (stats.correct / stats.total) * 100;
        return accuracy < 70 && QUESTION_TYPE_LABELS[type as QuestionType];
      })
      .map(([type]) => type as QuestionType);
  }, [progress.accuracyByType]);

  const handleToggleType = (type: QuestionType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const toggleExpandDomain = (domainId: string) => {
    setExpandedDomains(prev =>
      prev.includes(domainId)
        ? prev.filter(d => d !== domainId)
        : [...prev, domainId]
    );
  };

  const toggleOfficialDomain = (domainId: string) => {
    const domain = SAT_DOMAINS.find(d => d.id === domainId);
    if (!domain) return;

    const domainSkillIds = domain.skills.map(s => s.id);
    const allSkillsSelected = domainSkillIds.every(s => officialSkills.includes(s));

    if (allSkillsSelected) {
      // Deselect all skills in this domain
      setOfficialSkills(prev => prev.filter(s => !domainSkillIds.includes(s)));
      setOfficialDomains(prev => prev.filter(d => d !== domainId));
    } else {
      // Select all skills in this domain
      setOfficialSkills(prev => [...new Set([...prev, ...domainSkillIds])]);
      setOfficialDomains(prev => [...new Set([...prev, domainId])]);
    }
  };

  const toggleOfficialSkill = (skillId: string, domainId: string) => {
    const domain = SAT_DOMAINS.find(d => d.id === domainId);
    if (!domain) return;

    const domainSkillIds = domain.skills.map(s => s.id);

    setOfficialSkills(prev => {
      const newSkills = prev.includes(skillId)
        ? prev.filter(s => s !== skillId)
        : [...prev, skillId];

      // Update domain selection based on skills
      const selectedSkillsInDomain = newSkills.filter(s => domainSkillIds.includes(s));
      if (selectedSkillsInDomain.length === 0) {
        setOfficialDomains(d => d.filter(dom => dom !== domainId));
      } else {
        setOfficialDomains(d => [...new Set([...d, domainId])]);
      }

      return newSkills;
    });
  };

  // Start custom practice
  const handleStartCustomPractice = () => {
    if (filteredQuestions.length === 0) return;

    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    const practiceQuiz = {
      id: `practice-${Date.now()}`,
      title: `Entraînement: ${selectedTypes.map((t) => QUESTION_TYPE_LABELS[t]).join(', ')}`,
      description: `${selected.length} questions ciblées`,
      questions: selected,
      createdAt: new Date(),
    };

    addQuiz(practiceQuiz);
    startQuiz(practiceQuiz.id);
    router.push(`/quiz/${practiceQuiz.id}`);
  };

  // Start official practice
  const handleStartOfficialPractice = async () => {
    setPhase('loading');
    setError(null);

    try {
      const response = await fetch('/api/practice/official', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: questionCount,
          domains: officialDomains.length > 0 ? officialDomains : undefined,
          skills: officialSkills.length > 0 ? officialSkills : undefined,
          difficulty: officialDifficulty === 'mixed' ? undefined : officialDifficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement');
      }

      setOfficialQuestions(data.questions);
      setCurrentIndex(0);
      setAnswers({});
      setShowExplanation(false);
      setSelectedAnswer(null);
      setStartTime(Date.now());
      setPhase('quiz');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setPhase('config');
    }
  };

  const handleSelectAnswer = (answerId: AnswerId) => {
    if (showExplanation) return;
    setSelectedAnswer(answerId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswer) return;
    const question = officialQuestions[currentIndex];
    setAnswers(prev => ({ ...prev, [question.id]: selectedAnswer }));
    setShowExplanation(true);
  };

  // Save progress for official questions
  const saveOfficialProgress = () => {
    if (!startTime || officialQuestions.length === 0) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Convert official questions to Question format for progress tracking
    const questions: Question[] = officialQuestions.map(q => ({
      id: q.id,
      type: mapSkillToQuestionType(q.skill) as QuestionType,
      passage: q.passage,
      passageSource: q.passageSource,
      questionText: q.questionStem,
      choices: [
        { id: 'A' as AnswerId, text: q.choices.A },
        { id: 'B' as AnswerId, text: q.choices.B },
        { id: 'C' as AnswerId, text: q.choices.C },
        { id: 'D' as AnswerId, text: q.choices.D },
      ],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: 'medium' as const,
      createdAt: new Date(),
    }));

    // Create quiz attempt
    const questionResults = officialQuestions.map(q => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] || null,
      isCorrect: answers[q.id] === q.correctAnswer,
      timeSpent: Math.floor(timeSpent / officialQuestions.length),
    }));

    const attempt = {
      id: `practice_official_${Date.now()}`,
      quizId: `official_practice_${Date.now()}`,
      answers,
      score: officialQuestions.filter(q => answers[q.id] === q.correctAnswer).length,
      totalQuestions: officialQuestions.length,
      timeSpent,
      completedAt: new Date(),
      questionResults,
    };

    // Update progress in store
    updateProgress(attempt, questions);
  };

  const handleNext = () => {
    if (currentIndex < officialQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
      setSelectedAnswer(null);
    } else {
      // Save progress before showing results
      saveOfficialProgress();
      setPhase('results');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      const prevQuestion = officialQuestions[currentIndex - 1];
      setShowExplanation(!!answers[prevQuestion.id]);
      setSelectedAnswer(answers[prevQuestion.id] || null);
    }
  };

  const resetPractice = () => {
    setPhase('config');
    setOfficialQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setShowExplanation(false);
    setSelectedAnswer(null);
    setStartTime(null);
  };

  const hasCustomQuestions = allQuestions.length > 0;
  const correctCount = officialQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
  const totalAnswered = Object.keys(answers).length;
  const currentQuestion = officialQuestions[currentIndex];

  // Loading Phase
  if (phase === 'loading') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="glass-cosmic">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Chargement des questions...
              </h2>
              <p className="text-muted-foreground">
                Sélection de {questionCount} questions officielles SAT
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Phase (Official)
  if (phase === 'quiz' && currentQuestion) {
    const isCorrect = answers[currentQuestion.id] === currentQuestion.correctAnswer;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-blue-800/30 text-blue-800">
              Question {currentIndex + 1} / {officialQuestions.length}
            </Badge>
            <Badge variant="outline">
              {currentQuestion.domain}
            </Badge>
            <Badge variant="secondary">
              {currentQuestion.skill}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Score: <span className="text-foreground font-medium">{correctCount}/{totalAnswered}</span>
          </div>
        </div>

        <Progress value={(currentIndex / officialQuestions.length) * 100} className="h-2" />

        <Card className="glass-cosmic">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{currentQuestion.skill}</CardTitle>
              <span className="text-xs text-muted-foreground italic">
                {currentQuestion.passageSource}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="glass-passage p-4">
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {currentQuestion.passage}
              </p>
            </div>

            <p className="font-medium text-foreground">{currentQuestion.questionStem}</p>

            <div className="space-y-2">
              {(['A', 'B', 'C', 'D'] as AnswerId[]).map((choiceId) => {
                const isSelected = selectedAnswer === choiceId;
                const isThisCorrect = choiceId === currentQuestion.correctAnswer;
                const wasSelected = answers[currentQuestion.id] === choiceId;

                let choiceStyle = 'bg-muted border-border hover:bg-muted hover:border-primary/20';
                if (showExplanation) {
                  if (isThisCorrect) {
                    choiceStyle = 'bg-success/10 border-success/40';
                  } else if (wasSelected && !isThisCorrect) {
                    choiceStyle = 'bg-destructive/10 border-destructive/40';
                  }
                } else if (isSelected) {
                  choiceStyle = 'bg-primary/10 border-primary/40';
                }

                return (
                  <button
                    key={choiceId}
                    onClick={() => handleSelectAnswer(choiceId)}
                    disabled={showExplanation}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all duration-200',
                      'border flex items-start gap-3',
                      choiceStyle,
                      showExplanation && 'cursor-default'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm',
                      showExplanation && isThisCorrect
                        ? 'bg-success text-white'
                        : showExplanation && wasSelected && !isThisCorrect
                        ? 'bg-destructive text-white'
                        : isSelected
                        ? 'bg-gradient-to-br from-yellow-500 to-amber-500 text-white'
                        : 'bg-background border border-border text-muted-foreground'
                    )}>
                      {showExplanation && isThisCorrect ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : showExplanation && wasSelected && !isThisCorrect ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        choiceId
                      )}
                    </div>
                    <span className={cn(
                      'text-sm pt-1',
                      isSelected || (showExplanation && (isThisCorrect || wasSelected))
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    )}>
                      {currentQuestion.choices[choiceId]}
                    </span>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className={cn(
                'p-4 rounded-xl border',
                isCorrect ? 'bg-success/10 border-success/20' : 'bg-amber-500/10 border-amber-500/20'
              )}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={cn('font-medium mb-2', isCorrect ? 'text-success' : 'text-amber-600')}>
                      {isCorrect ? 'Correct !' : `Incorrect - La réponse était ${currentQuestion.correctAnswer}`}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>

              {!showExplanation ? (
                <Button onClick={handleConfirmAnswer} disabled={!selectedAnswer} className="flex-1 btn-cosmic">
                  Valider
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex-1 btn-cosmic">
                  {currentIndex < officialQuestions.length - 1 ? (
                    <>Suivant<ChevronRight className="w-4 h-4 ml-2" /></>
                  ) : (
                    'Voir les résultats'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Phase
  if (phase === 'results') {
    const percentage = Math.round((correctCount / officialQuestions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="glass-cosmic overflow-hidden">
          <div className="bg-gradient-to-br from-blue-800/20 to-blue-900/20 p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center shadow-lg mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <p className="text-muted-foreground mb-2">Résultat</p>
            <p className="text-5xl font-bold text-gradient mb-2">{correctCount}/{officialQuestions.length}</p>
            <p className={cn(
              'text-xl font-medium',
              percentage >= 80 ? 'text-emerald-500' : percentage >= 60 ? 'text-amber-500' : 'text-red-500'
            )}>
              {percentage}% de réussite
            </p>
          </div>
          <CardContent className="p-6 space-y-4">
            <p className="text-center text-muted-foreground">
              {percentage >= 80 ? 'Excellent travail !' : percentage >= 60 ? 'Bon travail !' : 'Continuez à pratiquer !'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetPractice} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Nouvel entraînement
              </Button>
              <Button onClick={() => router.push('/placement')} className="flex-1 btn-cosmic">
                Test de placement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Config Phase
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center shadow-lg">
          <Dumbbell className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gradient">Entraînement SAT</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Pratiquez avec {officialStats?.totalQuestions?.toLocaleString() || '2000+'} questions officielles
          ou vos propres quiz générés.
        </p>
      </div>

      {/* Mode Selection */}
      <Card className="glass-cosmic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Source des questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('official')}
              className={cn(
                'p-4 rounded-xl border text-left transition-all',
                mode === 'official'
                  ? 'border-blue-800 bg-blue-800/10 ring-2 ring-blue-800/20'
                  : 'border-border hover:border-blue-800/30'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  mode === 'official' ? 'bg-gradient-to-br from-blue-800 to-blue-900' : 'bg-muted'
                )}>
                  <Award className={cn('w-5 h-5', mode === 'official' ? 'text-white' : 'text-muted-foreground')} />
                </div>
                <div>
                  <p className="font-medium">Questions officielles SAT</p>
                  <p className="text-xs text-blue-800">Recommandé • {officialStats?.totalQuestions?.toLocaleString() || '2000+'} questions</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Vraies questions du College Board avec explications détaillées.
              </p>
            </button>

            <button
              onClick={() => setMode('custom')}
              className={cn(
                'p-4 rounded-xl border text-left transition-all',
                mode === 'custom'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-border hover:border-yellow-600/30'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  mode === 'custom' ? 'bg-gradient-to-br from-yellow-500 to-amber-500' : 'bg-muted'
                )}>
                  <Sparkles className={cn('w-5 h-5', mode === 'custom' ? 'text-white' : 'text-muted-foreground')} />
                </div>
                <div>
                  <p className="font-medium">Mes questions générées</p>
                  <p className="text-xs text-muted-foreground">{allQuestions.length} questions disponibles</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Questions de vos quiz générés par Claude.
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Official Mode Config */}
      {mode === 'official' && (
        <>
          <Card className="glass-cosmic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Sections et compétences SAT
              </CardTitle>
              <CardDescription>
                Sélectionnez des sections entières ou des compétences spécifiques. Laissez vide pour tout inclure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SAT_DOMAINS.map(domain => {
                const domainSkillIds = domain.skills.map(s => s.id);
                const selectedSkillsCount = domainSkillIds.filter(s => officialSkills.includes(s)).length;
                const allSelected = selectedSkillsCount === domainSkillIds.length;
                const someSelected = selectedSkillsCount > 0 && !allSelected;
                const isExpanded = expandedDomains.includes(domain.id);

                const colorClasses = {
                  emerald: {
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/30',
                    text: 'text-emerald-500',
                    hover: 'hover:border-emerald-500/50',
                  },
                  blue: {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30',
                    text: 'text-blue-500',
                    hover: 'hover:border-blue-500/50',
                  },
                  purple: {
                    bg: 'bg-blue-800/10',
                    border: 'border-blue-800/30',
                    text: 'text-blue-800',
                    hover: 'hover:border-blue-800/50',
                  },
                  amber: {
                    bg: 'bg-yellow-600/10',
                    border: 'border-yellow-600/30',
                    text: 'text-yellow-600',
                    hover: 'hover:border-yellow-600/50',
                  },
                }[domain.color] || { bg: 'bg-muted', border: 'border-border', text: 'text-foreground', hover: '' };

                return (
                  <div key={domain.id} className="rounded-xl border border-border overflow-hidden">
                    {/* Domain Header */}
                    <div className={cn(
                      'flex items-center gap-3 p-4 transition-all cursor-pointer',
                      (allSelected || someSelected) ? colorClasses.bg : 'bg-muted/30',
                      (allSelected || someSelected) ? colorClasses.border : '',
                      colorClasses.hover
                    )}>
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOfficialDomain(domain.id);
                        }}
                        className={cn(
                          'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
                          allSelected
                            ? `${colorClasses.border} ${colorClasses.bg} ${colorClasses.text}`
                            : someSelected
                            ? `${colorClasses.border} ${colorClasses.bg}`
                            : 'border-muted-foreground/30 hover:border-muted-foreground/50'
                        )}
                      >
                        {allSelected && <Check className="w-4 h-4" />}
                        {someSelected && <Minus className="w-4 h-4" />}
                      </button>

                      {/* Domain Info */}
                      <div
                        className="flex-1 flex items-center gap-3"
                        onClick={() => toggleExpandDomain(domain.id)}
                      >
                        <span className="text-xl">{domain.icon}</span>
                        <div className="flex-1">
                          <p className={cn(
                            'font-semibold',
                            (allSelected || someSelected) ? colorClasses.text : 'text-foreground'
                          )}>
                            {domain.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {domain.skills.length} compétences
                            {selectedSkillsCount > 0 && ` • ${selectedSkillsCount} sélectionnée${selectedSkillsCount > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpandDomain(domain.id)}
                        className="p-1 rounded-lg hover:bg-muted transition-colors"
                      >
                        <ChevronDown className={cn(
                          'w-5 h-5 text-muted-foreground transition-transform',
                          isExpanded && 'rotate-180'
                        )} />
                      </button>
                    </div>

                    {/* Skills List (Expandable) */}
                    {isExpanded && (
                      <div className="border-t border-border bg-background/50 p-3 space-y-2">
                        {domain.skills.map(skill => {
                          const isSelected = officialSkills.includes(skill.id);
                          return (
                            <button
                              key={skill.id}
                              onClick={() => toggleOfficialSkill(skill.id, domain.id)}
                              className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                                isSelected
                                  ? `${colorClasses.bg} ${colorClasses.border}`
                                  : 'border-transparent hover:bg-muted/50'
                              )}
                            >
                              <div className={cn(
                                'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0',
                                isSelected
                                  ? `${colorClasses.border} ${colorClasses.text}`
                                  : 'border-muted-foreground/30'
                              )}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <span className={cn(
                                'text-sm',
                                isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'
                              )}>
                                {skill.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Selection Summary */}
              {officialSkills.length > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-sm text-primary">
                    {officialSkills.length} compétence{officialSkills.length > 1 ? 's' : ''} sélectionnée{officialSkills.length > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => {
                      setOfficialSkills([]);
                      setOfficialDomains([]);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Tout désélectionner
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-cosmic">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Difficulté
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setOfficialDifficulty(d.id)}
                      className={cn(
                        'p-3 rounded-xl border text-center transition-all',
                        officialDifficulty === d.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                      )}
                    >
                      <p className="font-medium text-sm">{d.label}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-cosmic">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Nombre de questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {[5, 10, 15, 20, 27].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={cn(
                        'flex-1 p-3 rounded-xl border text-center transition-all',
                        questionCount === n ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                      )}
                    >
                      <p className="font-bold text-lg">{n}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button
              size="lg"
              onClick={handleStartOfficialPractice}
              className="bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-lg px-8 py-6"
            >
              <Award className="w-5 h-5 mr-2" />
              Commencer ({questionCount} questions)
            </Button>
          </div>
        </>
      )}

      {/* Custom Mode Config */}
      {mode === 'custom' && (
        <>
          {!hasCustomQuestions ? (
            <Card className="glass-cosmic">
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold text-foreground mb-2">Aucune question disponible</h3>
                <p className="text-muted-foreground mb-6">
                  Générez d'abord un quiz pour accéder à l'entraînement personnalisé.
                </p>
                <Button asChild>
                  <Link href="/generate">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer un quiz
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="glass-cosmic">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-400" />
                    Sélectionner les catégories
                  </CardTitle>
                  <CardDescription>
                    Les catégories faibles sont mises en évidence.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WeakAreaSelector
                    accuracyByType={progress.accuracyByType}
                    selectedTypes={selectedTypes}
                    onToggleType={handleToggleType}
                  />
                </CardContent>
              </Card>

              <Card className="glass-cosmic">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-500" />
                    Nombre de questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[5, 10, 15, 20].map((count) => (
                      <Button
                        key={count}
                        variant={questionCount === count ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuestionCount(count)}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                  {filteredQuestions.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-3">
                      {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} disponibles
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" asChild>
                  <Link href="/progress">Voir les progrès</Link>
                </Button>
                <Button
                  onClick={handleStartCustomPractice}
                  disabled={selectedTypes.length === 0 || filteredQuestions.length === 0}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                >
                  Commencer ({Math.min(questionCount, filteredQuestions.length)} questions)
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
