'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  QuestionType,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_DOMAINS,
  Question,
} from '@/types/question';
import { Quiz } from '@/types/quiz';
import {
  Sparkles,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Upload,
  Trash2,
  Zap,
  Brain,
  GraduationCap,
  X,
  Cpu,
  Cloud,
  Check,
  BookOpen,
  Play,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// All question types organized by domain (official SAT order)
const ALL_QUESTION_TYPES: QuestionType[] = [
  // Information and Ideas
  'central-ideas',
  'inferences',
  'command-of-evidence',
  // Craft and Structure
  'words-in-context',
  'text-structure-purpose',
  'cross-text-connections',
  // Expression of Ideas
  'rhetorical-synthesis',
  'transitions',
  // Standard English Conventions
  'boundaries',
  'form-structure-sense',
];

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; icon: typeof Zap; color: string; bgSelected: string; borderSelected: string }[] = [
  { value: 'easy', label: 'Facile', icon: Zap, color: 'text-emerald-500', bgSelected: 'bg-emerald-50', borderSelected: 'border-emerald-400' },
  { value: 'medium', label: 'Moyen', icon: GraduationCap, color: 'text-amber-500', bgSelected: 'bg-amber-50', borderSelected: 'border-amber-400' },
  { value: 'hard', label: 'Difficile', icon: Brain, color: 'text-rose-500', bgSelected: 'bg-rose-50', borderSelected: 'border-rose-400' },
];

type ModelOption = 'sat-finetuned' | 'claude-sonnet';

const MODEL_OPTIONS: { value: ModelOption; label: string; description: string; icon: typeof Cpu }[] = [
  { value: 'sat-finetuned', label: 'Fine-tuned (Local)', description: 'Qwen3-8B optimisé SAT', icon: Cpu },
  { value: 'claude-sonnet', label: 'Claude Sonnet (API)', description: 'Anthropic - meilleure qualité', icon: Cloud },
];

export default function GeneratePage() {
  const router = useRouter();
  const { documents, addQuiz, updatePassageSelection, removeDocument } = useQuizStore();

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'central-ideas',
    'words-in-context',
    'boundaries',
  ]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>(['medium']);
  const [model, setModel] = useState<ModelOption>('sat-finetuned');
  const [quizTitle, setQuizTitle] = useState('Quiz SAT');
  const [questionsPerPassage, setQuestionsPerPassage] = useState(1);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [anthropicConfigured, setAnthropicConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (documents.length > 0 && !selectedDocId) {
      setSelectedDocId(documents[0].id);
    }
  }, [documents, selectedDocId]);

  useEffect(() => {
    fetch('/api/anthropic/status')
      .then(res => res.json())
      .then(data => setAnthropicConfigured(data.configured))
      .catch(() => setAnthropicConfigured(false));
  }, []);

  const selectedDocument = documents.find((d) => d.id === selectedDocId);
  const selectedPassages = selectedDocument?.passages.filter((p) => p.selected) || [];

  const toggleQuestionType = (type: QuestionType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleDifficulty = (diff: Difficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const togglePassageSelection = (passageId: string) => {
    if (selectedDocId) {
      const passage = selectedDocument?.passages.find((p) => p.id === passageId);
      if (passage) {
        updatePassageSelection(selectedDocId, passageId, !passage.selected);
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedDocument || selectedPassages.length === 0 || selectedTypes.length === 0 || selectedDifficulties.length === 0) {
      setError('Veuillez sélectionner au moins un passage, un type de question et une difficulté.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setWarning(null);
    setProgress(10);
    setGeneratedQuestions([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passages: selectedPassages,
          questionTypes: selectedTypes,
          questionsPerPassage,
          difficulty: selectedDifficulties,
          model,
        }),
      });

      setProgress(70);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération des questions');
      }

      setProgress(100);
      setGeneratedQuestions(data.questions);

      if (data.stats?.errors > 0) {
        const expected = selectedPassages.length * questionsPerPassage;
        const generated = data.questions.length;
        setWarning(`${generated}/${expected} questions générées. ${data.stats.errors} erreur(s) ignorée(s).`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuiz = () => {
    if (generatedQuestions.length === 0) return;

    const quiz: Quiz = {
      id: crypto.randomUUID(),
      title: quizTitle,
      description: `Généré depuis ${selectedDocument?.filename}`,
      questions: generatedQuestions,
      sourceDocument: selectedDocument?.filename,
      createdAt: new Date(),
    };

    addQuiz(quiz);
    router.push(`/quiz/${quiz.id}`);
  };

  const handleExportTxt = () => {
    if (generatedQuestions.length === 0) return;

    const lines: string[] = [
      `SAT Questions Export - ${new Date().toISOString().split('T')[0]}`,
      `Source: ${selectedDocument?.filename || 'Unknown'}`,
      `Total: ${generatedQuestions.length} questions`,
      '='.repeat(80),
      '',
    ];

    generatedQuestions.forEach((q, index) => {
      lines.push(`QUESTION ${index + 1}`);
      lines.push(`Type: ${QUESTION_TYPE_LABELS[q.type]}`);
      lines.push(`Difficulty: ${q.difficulty}`);
      lines.push('');
      lines.push('PASSAGE:');
      lines.push(q.passage);
      lines.push('');
      lines.push('QUESTION:');
      lines.push(q.questionText);
      lines.push('');
      lines.push('CHOICES:');
      q.choices.forEach((choice) => {
        const marker = choice.id === q.correctAnswer ? ' ✓' : '';
        lines.push(`  ${choice.id}) ${choice.text}${marker}`);
      });
      lines.push('');
      lines.push(`CORRECT ANSWER: ${q.correctAnswer}`);
      lines.push('');
      lines.push('EXPLANATION:');
      lines.push(q.explanation);

      // Add distractor analysis if available
      if (q.distractorAnalysis) {
        lines.push('');
        lines.push('DISTRACTOR ANALYSIS:');
        lines.push(`  A: ${q.distractorAnalysis.A}`);
        lines.push(`  B: ${q.distractorAnalysis.B}`);
        lines.push(`  C: ${q.distractorAnalysis.C}`);
      }

      lines.push('');
      lines.push('-'.repeat(80));
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sat-questions-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (documents.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Générer un quiz</h1>
          <p className="text-muted-foreground mt-1">
            Créez des questions SAT à partir de vos documents.
          </p>
        </div>

        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Aucun document</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Importez un document pour générer des questions d'entraînement SAT.
            </p>
            <Button asChild>
              <Link href="/upload">
                <Upload className="w-4 h-4 mr-2" />
                Importer un document
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estimatedQuestions = selectedPassages.length * questionsPerPassage;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Générer un quiz</h1>
          <p className="text-muted-foreground mt-1">
            Configurez et générez des questions d'entraînement SAT.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/upload">
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Link>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents & Passages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Documents */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Documents
                </CardTitle>
                <CardDescription>
                  {documents.length} disponible{documents.length > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[180px]">
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                          selectedDocId === doc.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                          selectedDocId === doc.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{doc.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.passages.length} passages
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDocument(doc.id);
                            if (selectedDocId === doc.id) {
                              setSelectedDocId(documents.find(d => d.id !== doc.id)?.id || null);
                            }
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Passages */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-success" />
                  Passages
                </CardTitle>
                <CardDescription>
                  {selectedPassages.length}/{selectedDocument?.passages.length || 0} sélectionné{selectedPassages.length > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDocument ? (
                  <ScrollArea className="h-[180px]">
                    <div className="space-y-2">
                      {selectedDocument.passages.map((passage, index) => (
                        <button
                          key={passage.id}
                          onClick={() => togglePassageSelection(passage.id)}
                          className={cn(
                            'w-full p-3 rounded-lg border text-left transition-all',
                            passage.selected
                              ? 'border-success bg-success/5'
                              : 'border-border hover:border-success/50 hover:bg-muted/50'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn(
                              'w-5 h-5 rounded flex items-center justify-center text-xs font-medium shrink-0',
                              passage.selected ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
                            )}>
                              {passage.selected ? <Check className="w-3 h-3" /> : index + 1}
                            </div>
                            <span className="font-medium text-sm text-foreground">Passage {index + 1}</span>
                            <Badge variant="outline" className="text-[10px] ml-auto">{passage.wordCount} mots</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 pl-7">
                            {passage.text}
                          </p>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                    Sélectionnez un document
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Question Types by Domain */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Types de questions</CardTitle>
              <CardDescription>{selectedTypes.length}/10 sélectionné{selectedTypes.length > 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(QUESTION_TYPE_DOMAINS).map(([domainKey, domain]) => (
                <div key={domainKey}>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{domain.label}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {domain.types.map((type) => {
                      const isSelected = selectedTypes.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => toggleQuestionType(type)}
                          className={cn(
                            'p-2.5 rounded-lg border text-left transition-all flex items-center gap-2',
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <div className={cn(
                            'w-6 h-6 rounded flex items-center justify-center shrink-0',
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          )}>
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : <span className="text-[9px] font-bold">{QUESTION_TYPE_LABELS[type].slice(0, 2).toUpperCase()}</span>}
                          </div>
                          <span className="text-xs font-medium text-foreground truncate">{QUESTION_TYPE_LABELS[type]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Difficulty & Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Difficulties */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Difficultés</CardTitle>
                <CardDescription>Multi-sélection possible</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedDifficulties.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleDifficulty(option.value)}
                        className={cn(
                          'p-3 rounded-lg border text-center transition-all',
                          isSelected
                            ? `${option.borderSelected} ${option.bgSelected}`
                            : 'border-border hover:border-border-hover'
                        )}
                      >
                        <Icon className={cn('w-5 h-5 mx-auto mb-1', isSelected ? option.color : 'text-muted-foreground')} />
                        <p className={cn('text-xs font-medium', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                          {option.label}
                        </p>
                        {isSelected && (
                          <Check className={cn('w-3 h-3 mx-auto mt-1', option.color)} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Model */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Modèle IA</CardTitle>
                <CardDescription>Moteur de génération</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {MODEL_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = model === option.value;
                    const isDisabled = option.value === 'claude-sonnet' && anthropicConfigured === false;
                    return (
                      <button
                        key={option.value}
                        onClick={() => !isDisabled && setModel(option.value)}
                        disabled={isDisabled}
                        className={cn(
                          'w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50',
                          isDisabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{option.label}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {isDisabled ? 'API non configurée' : option.description}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Row */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Paramètres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-title" className="text-sm">Titre du quiz</Label>
                  <Input
                    id="quiz-title"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Mon quiz SAT"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questions-per-passage" className="text-sm">Questions par passage</Label>
                  <Input
                    id="questions-per-passage"
                    type="number"
                    min={1}
                    max={5}
                    value={questionsPerPassage}
                    onChange={(e) => setQuestionsPerPassage(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Generate */}
        <div className="space-y-4">
          {/* Generate Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Générer
              </CardTitle>
              <CardDescription>
                {estimatedQuestions} question{estimatedQuestions > 1 ? 's' : ''} estimée{estimatedQuestions > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passages</span>
                  <span className="font-medium">{selectedPassages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Types</span>
                  <span className="font-medium">{selectedTypes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficultés</span>
                  <span className="font-medium">{selectedDifficulties.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Q/passage</span>
                  <span className="font-medium">{questionsPerPassage}</span>
                </div>
                <div className="pt-1.5 mt-1.5 border-t border-border flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-primary">{estimatedQuestions}</span>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {warning && !error && (
                <Alert className="border-amber-500/50 bg-amber-50">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-sm text-amber-800">{warning}</AlertDescription>
                </Alert>
              )}

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-muted-foreground">Génération...</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || selectedPassages.length === 0 || selectedTypes.length === 0 || selectedDifficulties.length === 0}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer
                  </>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                {model === 'claude-sonnet' ? 'Claude Sonnet API' : 'Qwen3-8B fine-tuné'}
              </p>
            </CardContent>
          </Card>

          {/* Generated Questions */}
          {generatedQuestions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Prêt
                </CardTitle>
                <CardDescription>
                  {generatedQuestions.length} questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScrollArea className="h-[250px]">
                  <div className="space-y-2 pr-2">
                    {generatedQuestions.map((q, index) => (
                      <div key={q.id} className="p-2.5 rounded-lg border border-border bg-card">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {QUESTION_TYPE_LABELS[q.type]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] px-1.5 py-0',
                              q.difficulty === 'easy' && 'border-emerald-400 text-emerald-600',
                              q.difficulty === 'medium' && 'border-amber-400 text-amber-600',
                              q.difficulty === 'hard' && 'border-rose-400 text-rose-600'
                            )}
                          >
                            {q.difficulty === 'easy' ? 'Facile' : q.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground line-clamp-2">
                          <span className="font-medium">{index + 1}.</span> {q.questionText}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Button onClick={handleSaveQuiz} className="flex-1" size="sm">
                    <Play className="w-4 h-4 mr-1.5" />
                    Commencer
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={handleExportTxt}
                    title="Export TXT"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setGeneratedQuestions([])}
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
