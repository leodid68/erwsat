'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/stores/quiz-store';
import { useSettingsStore, AI_PROVIDERS, AIProvider } from '@/stores/settings-store';
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
  Settings,
  ChevronDown,
  Minus,
  Key,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; icon: typeof Zap; color: string; bgSelected: string; borderSelected: string; glowColor: string }[] = [
  { value: 'easy', label: 'Facile', icon: Zap, color: 'text-emerald-400', bgSelected: 'bg-emerald-500/15', borderSelected: 'border-emerald-500/50', glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' },
  { value: 'medium', label: 'Moyen', icon: GraduationCap, color: 'text-amber-500', bgSelected: 'bg-amber-500/100/15', borderSelected: 'border-amber-500/50', glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
  { value: 'hard', label: 'Difficile', icon: Brain, color: 'text-rose-400', bgSelected: 'bg-rose-500/15', borderSelected: 'border-rose-500/50', glowColor: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]' },
];

type ModelOption = 'local' | 'api';

// Map provider to model identifier for API
const getModelIdentifier = (provider: AIProvider, model: string): string => {
  if (provider === 'anthropic') return 'claude-sonnet';
  return model;
};

export default function GeneratePage() {
  const router = useRouter();
  const { documents, addQuiz, updatePassageSelection, removeDocument } = useQuizStore();

  // Get API key and provider from settings store
  const {
    selectedProvider,
    selectedModel,
    apiKeys,
    setSelectedProvider,
    setSelectedModel,
    isProviderConfigured,
    getActiveProvider,
    getActiveApiKey,
  } = useSettingsStore();

  const activeProvider = getActiveProvider();
  const hasApiKey = isProviderConfigured(selectedProvider);

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'central-ideas',
    'words-in-context',
    'boundaries',
  ]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>(['medium']);
  const [useLocalModel, setUseLocalModel] = useState(false);
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Quiz SAT');
  const [questionsPerPassage, setQuestionsPerPassage] = useState(1);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (documents.length > 0 && !selectedDocId) {
      setSelectedDocId(documents[0].id);
    }
  }, [documents, selectedDocId]);

  const selectedDocument = documents.find((d) => d.id === selectedDocId);
  const selectedPassages = selectedDocument?.passages.filter((p) => p.selected) || [];

  const toggleQuestionType = (type: QuestionType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Toggle all types in a domain
  const toggleDomain = (domainKey: string) => {
    const domain = QUESTION_TYPE_DOMAINS[domainKey as keyof typeof QUESTION_TYPE_DOMAINS];
    if (!domain) return;

    const domainTypes = domain.types;
    const allSelected = domainTypes.every((type) => selectedTypes.includes(type));

    if (allSelected) {
      // Deselect all types in this domain
      setSelectedTypes((prev) => prev.filter((t) => !domainTypes.includes(t)));
    } else {
      // Select all types in this domain
      setSelectedTypes((prev) => [...new Set([...prev, ...domainTypes])]);
    }
  };

  // Check if all types in a domain are selected
  const isDomainFullySelected = (domainKey: string) => {
    const domain = QUESTION_TYPE_DOMAINS[domainKey as keyof typeof QUESTION_TYPE_DOMAINS];
    if (!domain) return false;
    return domain.types.every((type) => selectedTypes.includes(type));
  };

  // Check if some (but not all) types in a domain are selected
  const isDomainPartiallySelected = (domainKey: string) => {
    const domain = QUESTION_TYPE_DOMAINS[domainKey as keyof typeof QUESTION_TYPE_DOMAINS];
    if (!domain) return false;
    const selectedCount = domain.types.filter((type) => selectedTypes.includes(type)).length;
    return selectedCount > 0 && selectedCount < domain.types.length;
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
      // Build headers with API key for selected provider
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const apiKey = getActiveApiKey();

      if (!useLocalModel && apiKey) {
        // Add provider-specific header
        switch (selectedProvider) {
          case 'anthropic':
            headers['X-Anthropic-Key'] = apiKey;
            break;
          case 'openai':
            headers['X-OpenAI-Key'] = apiKey;
            break;
          case 'mistral':
            headers['X-Mistral-Key'] = apiKey;
            break;
          case 'deepseek':
            headers['X-DeepSeek-Key'] = apiKey;
            break;
          case 'groq':
            headers['X-Groq-Key'] = apiKey;
            break;
          case 'grok':
            headers['X-Grok-Key'] = apiKey;
            break;
          case 'qwen':
            headers['X-Qwen-Key'] = apiKey;
            break;
        }
        headers['X-AI-Provider'] = selectedProvider;
        headers['X-AI-Model'] = selectedModel;
      }

      // Determine model to use
      const modelToUse = useLocalModel ? 'sat-finetuned' : getModelIdentifier(selectedProvider, selectedModel);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          passages: selectedPassages,
          questionTypes: selectedTypes,
          questionsPerPassage,
          difficulty: selectedDifficulties,
          model: modelToUse,
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
        toast.warning(`${generated}/${expected} questions générées`);
      } else {
        toast.success(`${data.questions.length} questions générées`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la génération';
      setError(message);
      toast.error(message);
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
    toast.success('Quiz créé — bonne chance !');
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
              <CardContent className="overflow-visible">
                <ScrollArea className="h-[180px] overflow-visible">
                  <div className="space-y-3 p-1">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={cn(
                          'cell-3d p-3 rounded-xl border cursor-pointer transition-all',
                          selectedDocId === doc.id
                            ? 'border-primary/40 bg-primary/10 shadow-sm'
                            : 'border-border bg-background hover:border-primary/20 hover:bg-muted'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                            selectedDocId === doc.id
                              ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                              : 'bg-muted border border-border text-muted-foreground'
                          )}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className={cn('font-medium text-sm break-words leading-tight', selectedDocId === doc.id ? 'text-primary' : 'text-foreground')}>{doc.filename}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {doc.passages.length} passages
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
              <CardContent className="overflow-visible">
                {selectedDocument ? (
                  <ScrollArea className="h-[180px] overflow-visible">
                    <div className="space-y-3 p-1">
                      {selectedDocument.passages.map((passage, index) => (
                        <button
                          key={passage.id}
                          onClick={() => togglePassageSelection(passage.id)}
                          className={cn(
                            'cell-3d w-full p-3 rounded-xl border text-left transition-all',
                            passage.selected
                              ? 'border-success/40 bg-success/10 shadow-sm'
                              : 'border-border bg-background hover:border-primary/20 hover:bg-muted'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn(
                              'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium shrink-0 transition-all duration-300',
                              passage.selected
                                ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white'
                                : 'bg-muted border border-border text-muted-foreground'
                            )}>
                              {passage.selected ? <Check className="w-3.5 h-3.5" /> : index + 1}
                            </div>
                            <span className={cn('font-medium text-sm', passage.selected ? 'text-success' : 'text-foreground')}>Passage {index + 1}</span>
                            <Badge variant="outline" className="text-[10px] ml-auto">{passage.wordCount} mots</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 pl-8">
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
            <CardContent className="space-y-4 overflow-visible">
              {Object.entries(QUESTION_TYPE_DOMAINS).map(([domainKey, domain]) => {
                const isFullySelected = isDomainFullySelected(domainKey);
                const isPartiallySelected = isDomainPartiallySelected(domainKey);

                return (
                  <div key={domainKey} className="overflow-visible">
                    {/* Domain Header with Checkbox */}
                    <button
                      onClick={() => toggleDomain(domainKey)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-lg mb-3 transition-all',
                        isFullySelected
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : isPartiallySelected
                          ? 'bg-muted/50 hover:bg-muted'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                        isFullySelected
                          ? 'bg-primary border-primary text-white'
                          : isPartiallySelected
                          ? 'border-primary bg-primary/20'
                          : 'border-muted-foreground/30'
                      )}>
                        {isFullySelected && <Check className="w-3 h-3" />}
                        {isPartiallySelected && <Minus className="w-3 h-3 text-primary" />}
                      </div>
                      <span className={cn(
                        'text-sm font-semibold',
                        (isFullySelected || isPartiallySelected) ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {domain.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {domain.types.filter(t => selectedTypes.includes(t)).length}/{domain.types.length}
                      </span>
                    </button>

                    {/* Types Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-1 -m-1">
                      {domain.types.map((type) => {
                        const isSelected = selectedTypes.includes(type);
                        return (
                          <button
                            key={type}
                            onClick={() => toggleQuestionType(type)}
                            className={cn(
                              'cell-3d p-3 rounded-xl border text-left transition-all flex items-center gap-3',
                              isSelected
                                ? 'border-primary/40 bg-primary/10 shadow-sm'
                                : 'border-border bg-background hover:border-primary/20 hover:bg-muted'
                            )}
                          >
                            <div className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300',
                              isSelected
                                ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                                : 'bg-muted border border-border text-muted-foreground'
                            )}>
                              {isSelected ? <Check className="w-4 h-4" /> : <span className="text-[9px] font-bold">{QUESTION_TYPE_LABELS[type].slice(0, 2).toUpperCase()}</span>}
                            </div>
                            <span className={cn('text-sm font-medium truncate', isSelected ? 'text-primary' : 'text-muted-foreground')}>{QUESTION_TYPE_LABELS[type]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
              <CardContent className="overflow-visible">
                <div className="grid grid-cols-3 gap-3 p-1 -m-1">
                  {DIFFICULTY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedDifficulties.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleDifficulty(option.value)}
                        className={cn(
                          'cell-3d p-4 rounded-xl border text-center transition-all duration-300',
                          isSelected
                            ? `${option.borderSelected} ${option.bgSelected}`
                            : 'border-border bg-background hover:border-primary/20 hover:bg-muted'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center transition-all duration-300',
                          isSelected
                            ? `bg-gradient-to-br ${option.value === 'easy' ? 'from-emerald-500 to-green-500' : option.value === 'medium' ? 'from-amber-400 to-amber-500' : 'from-violet-400 to-violet-600'}`
                            : 'bg-muted border border-border'
                        )}>
                          <Icon className={cn('w-5 h-5', isSelected ? 'text-white' : 'text-muted-foreground')} />
                        </div>
                        <p className={cn('text-sm font-medium', isSelected ? option.color : 'text-muted-foreground')}>
                          {option.label}
                        </p>
                        {isSelected && (
                          <Check className={cn('w-4 h-4 mx-auto mt-2', option.color)} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Model / Provider */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Modèle IA</CardTitle>
                <CardDescription>Fournisseur de génération</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-visible">
                {/* Local vs API Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseLocalModel(true)}
                    className={cn(
                      'flex-1 p-2.5 rounded-lg border text-sm font-medium transition-all',
                      useLocalModel
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30 text-muted-foreground'
                    )}
                  >
                    <Cpu className="w-4 h-4 inline mr-2" />
                    Local
                  </button>
                  <button
                    onClick={() => setUseLocalModel(false)}
                    className={cn(
                      'flex-1 p-2.5 rounded-lg border text-sm font-medium transition-all',
                      !useLocalModel
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30 text-muted-foreground'
                    )}
                  >
                    <Cloud className="w-4 h-4 inline mr-2" />
                    API Cloud
                  </button>
                </div>

                {useLocalModel ? (
                  /* Local Model Info */
                  <div className="p-3 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Qwen3-8B Fine-tuné</p>
                        <p className="text-xs text-muted-foreground">Modèle local optimisé SAT</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Provider Dropdown */
                  <div className="relative">
                    <button
                      onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-3 rounded-xl border bg-background transition-all',
                        isProviderDropdownOpen && 'border-primary ring-2 ring-primary/20',
                        !hasApiKey && 'border-amber-500/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          hasApiKey
                            ? 'bg-gradient-to-br from-violet-500 to-violet-700 text-white'
                            : 'bg-amber-500/100/20 text-amber-500'
                        )}>
                          {hasApiKey ? <Cloud className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm">{activeProvider.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {hasApiKey ? selectedModel : 'Clé API requise'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        'w-5 h-5 text-muted-foreground transition-transform',
                        isProviderDropdownOpen && 'rotate-180'
                      )} />
                    </button>

                    {/* Provider Dropdown */}
                    {isProviderDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 py-2 rounded-xl border bg-background shadow-lg max-h-[300px] overflow-y-auto">
                        {AI_PROVIDERS.map((provider) => {
                          const providerConfigured = isProviderConfigured(provider.id);
                          const isActive = selectedProvider === provider.id;
                          return (
                            <button
                              key={provider.id}
                              onClick={() => {
                                setSelectedProvider(provider.id);
                                setIsProviderDropdownOpen(false);
                              }}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors',
                                isActive && 'bg-primary/10'
                              )}
                            >
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                                providerConfigured
                                  ? 'bg-emerald-500/20 text-emerald-500'
                                  : 'bg-muted text-muted-foreground'
                              )}>
                                {providerConfigured ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm">{provider.name}</p>
                                <p className="text-xs text-muted-foreground">{provider.inputPrice} / {provider.outputPrice}</p>
                              </div>
                              {!providerConfigured && (
                                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">
                                  Non configuré
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                        <div className="border-t border-border mt-2 pt-2 px-3">
                          <Link
                            href="/settings"
                            className="flex items-center gap-2 text-xs text-primary hover:underline"
                            onClick={() => setIsProviderDropdownOpen(false)}
                          >
                            <Settings className="w-3 h-3" />
                            Gérer les clés API
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* API Key Warning */}
                    {!hasApiKey && (
                      <Link
                        href="/settings"
                        className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-amber-500/100/10 border border-amber-500/20 text-xs text-amber-500 hover:bg-amber-500/100/15 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Configurez votre clé API {activeProvider.name} dans les paramètres</span>
                      </Link>
                    )}
                  </div>
                )}
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
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <AlertDescription className="text-sm text-amber-500">{warning}</AlertDescription>
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
                disabled={isGenerating || selectedPassages.length === 0 || selectedTypes.length === 0 || selectedDifficulties.length === 0 || (!useLocalModel && !hasApiKey)}
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
                {useLocalModel ? 'Qwen3-8B fine-tuné' : `${activeProvider.name} - ${selectedModel}`}
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
                              q.difficulty === 'easy' && 'border-emerald-400 text-emerald-400',
                              q.difficulty === 'medium' && 'border-amber-400 text-amber-500',
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
