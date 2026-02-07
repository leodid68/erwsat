'use client';

import { useState, useMemo } from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { QUESTION_TYPE_LABELS, QuestionType } from '@/types/question';
import {
  BarChart3,
  Calendar,
  Filter,
  ChevronDown,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Download,
  SlidersHorizontal,
  PieChart,
  Activity,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { SKILL_RESOURCES, LearningResource } from '@/lib/learning-resources';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';

// Domain groupings
const DOMAINS = {
  'Information & Ideas': ['central-ideas', 'inferences', 'command-of-evidence'],
  'Craft & Structure': ['words-in-context', 'text-structure-purpose', 'cross-text-connections'],
  'Expression of Ideas': ['rhetorical-synthesis', 'transitions'],
  'Standard English Conventions': ['boundaries', 'form-structure-sense'],
} as const;

const DOMAIN_COLORS: Record<string, string> = {
  'Information & Ideas': '#1E40AF',
  'Craft & Structure': '#F59E0B',
  'Expression of Ideas': '#10B981',
  'Standard English Conventions': '#627d98',
};

export default function AnalyticsPage() {
  const { progress, quizzes } = useQuizStore();

  // Filter states
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [minAccuracy, setMinAccuracy] = useState<number>(0);
  const [maxAccuracy, setMaxAccuracy] = useState<number>(100);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter quiz history by date
  const filteredHistory = useMemo(() => {
    let history = progress.quizHistory;

    // Date filter
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      history = history.filter(h => new Date(h.completedAt) >= cutoff);
    }

    // Accuracy filter
    history = history.filter(h => {
      const accuracy = (h.score / h.totalQuestions) * 100;
      return accuracy >= minAccuracy && accuracy <= maxAccuracy;
    });

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      history = history.filter(h => {
        const quiz = quizzes.find(q => q.id === h.quizId);
        return quiz?.title.toLowerCase().includes(query) || h.quizId.toLowerCase().includes(query);
      });
    }

    return history;
  }, [progress.quizHistory, dateRange, minAccuracy, maxAccuracy, searchQuery, quizzes]);

  // Calculate domain stats
  const domainStats = useMemo(() => {
    const stats: Record<string, { correct: number; total: number; skills: Record<string, { correct: number; total: number }> }> = {};

    for (const [domain, skills] of Object.entries(DOMAINS)) {
      const domainData = { correct: 0, total: 0, skills: {} as Record<string, { correct: number; total: number }> };

      for (const skill of skills) {
        const skillData = progress.accuracyByType[skill as QuestionType];
        if (skillData) {
          domainData.correct += skillData.correct;
          domainData.total += skillData.total;
          domainData.skills[skill] = { ...skillData };
        }
      }

      stats[domain] = domainData;
    }

    return stats;
  }, [progress.accuracyByType]);

  // Time analysis
  const timeStats = useMemo(() => {
    if (filteredHistory.length === 0) return null;

    const times = filteredHistory.map(h => h.timeSpent);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const avgTimePerQuestion = filteredHistory.reduce((sum, h) => sum + h.timeSpent / h.totalQuestions, 0) / filteredHistory.length;

    return {
      totalTime: times.reduce((a, b) => a + b, 0),
      avgPerQuiz: avgTime,
      avgPerQuestion: avgTimePerQuestion,
      fastest: Math.min(...times),
      slowest: Math.max(...times),
    };
  }, [filteredHistory]);

  // Score distribution
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];

    filteredHistory.forEach(h => {
      const score = (h.score / h.totalQuestions) * 100;
      if (score <= 20) buckets[0].count++;
      else if (score <= 40) buckets[1].count++;
      else if (score <= 60) buckets[2].count++;
      else if (score <= 80) buckets[3].count++;
      else buckets[4].count++;
    });

    return buckets;
  }, [filteredHistory]);

  // Performance over time
  const performanceOverTime = useMemo(() => {
    return filteredHistory
      .slice()
      .reverse()
      .map((h, i) => ({
        index: i + 1,
        score: Math.round((h.score / h.totalQuestions) * 100),
        date: new Date(h.completedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      }));
  }, [filteredHistory]);

  // Pie chart data for domains
  const pieData = useMemo(() => {
    return Object.entries(domainStats)
      .filter(([_, data]) => data.total > 0)
      .map(([domain, data]) => ({
        name: domain,
        value: data.total,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }));
  }, [domainStats]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Export data as CSV
  const exportCSV = () => {
    const headers = ['Date', 'Quiz', 'Score', 'Total', 'Pourcentage', 'Temps (s)'];
    const rows = filteredHistory.map(h => {
      const quiz = quizzes.find(q => q.id === h.quizId);
      return [
        new Date(h.completedAt).toISOString().split('T')[0],
        quiz?.title || h.quizId,
        h.score,
        h.totalQuestions,
        Math.round((h.score / h.totalQuestions) * 100),
        h.timeSpent,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sat-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (progress.totalQuizzesTaken === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analyse détaillée</h1>
          <p className="text-muted-foreground mt-1">
            Explorez vos données en profondeur.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Pas encore de données</h3>
            <p className="text-muted-foreground">
              Complétez des quiz pour débloquer l'analyse détaillée.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analyse détaillée</h1>
          <p className="text-muted-foreground mt-1">
            Explorez vos données en profondeur avec filtres et visualisations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtres
            {(dateRange !== 'all' || minAccuracy > 0 || maxAccuracy < 100) && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {[dateRange !== 'all', minAccuracy > 0, maxAccuracy < 100].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="glass-cosmic">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              Filtres d'analyse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Période</label>
                <div className="flex flex-wrap gap-1">
                  {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-lg border transition-colors',
                        dateRange === range
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted border-border hover:border-primary/30'
                      )}
                    >
                      {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : range === '90d' ? '90 jours' : 'Tout'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min Accuracy */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Score min (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={minAccuracy}
                  onChange={(e) => setMinAccuracy(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Max Accuracy */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Score max (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={maxAccuracy}
                  onChange={(e) => setMaxAccuracy(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nom du quiz..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Active filters summary */}
            {(dateRange !== 'all' || minAccuracy > 0 || maxAccuracy < 100 || searchQuery) && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Filtres actifs:</span>
                <div className="flex flex-wrap gap-1">
                  {dateRange !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      {dateRange === '7d' ? '7 jours' : dateRange === '30d' ? '30 jours' : '90 jours'}
                    </Badge>
                  )}
                  {minAccuracy > 0 && (
                    <Badge variant="secondary" className="text-xs">Min: {minAccuracy}%</Badge>
                  )}
                  {maxAccuracy < 100 && (
                    <Badge variant="secondary" className="text-xs">Max: {maxAccuracy}%</Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="text-xs">"{searchQuery}"</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    setDateRange('all');
                    setMinAccuracy(0);
                    setMaxAccuracy(100);
                    setSearchQuery('');
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{filteredHistory.length}</p>
                <p className="text-xs text-muted-foreground">Quiz analysés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-700 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {filteredHistory.length > 0
                    ? Math.round(
                        filteredHistory.reduce((sum, h) => sum + (h.score / h.totalQuestions) * 100, 0) /
                          filteredHistory.length
                      )
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {timeStats ? formatTime(timeStats.avgPerQuiz) : '--'}
                </p>
                <p className="text-xs text-muted-foreground">Temps moyen/quiz</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {timeStats ? `${Math.round(timeStats.avgPerQuestion)}s` : '--'}
                </p>
                <p className="text-xs text-muted-foreground">Par question</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        {performanceOverTime.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Évolution du score
              </CardTitle>
              <CardDescription>{filteredHistory.length} quiz sur la période</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceOverTime}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Score']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-500" />
              Distribution des scores
            </CardTitle>
            <CardDescription>Répartition par tranches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scoreDistribution.map((bucket, i) => {
                const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
                const percentage = filteredHistory.length > 0
                  ? Math.round((bucket.count / filteredHistory.length) * 100)
                  : 0;
                return (
                  <div key={bucket.range} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{bucket.range}</span>
                      <span className="font-medium">{bucket.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: colors[i],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domain Breakdown - Accordion */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Analyse par domaine
          </CardTitle>
          <CardDescription>
            Cliquez sur un domaine pour voir le détail des compétences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={[]}>
            {Object.entries(DOMAINS).map(([domain, skills]) => {
              const stats = domainStats[domain];
              const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              const trend = accuracy >= 70 ? 'up' : accuracy >= 50 ? 'neutral' : 'down';

              return (
                <AccordionItem key={domain} value={domain}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: DOMAIN_COLORS[domain] }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{domain}</span>
                          {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                          {trend === 'neutral' && <Minus className="w-4 h-4 text-amber-500" />}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{stats.total} questions</span>
                          <span>{stats.correct} correctes</span>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <span
                          className={cn(
                            'text-xl font-bold',
                            accuracy >= 70 ? 'text-emerald-500' : accuracy >= 50 ? 'text-amber-500' : 'text-red-500'
                          )}
                        >
                          {stats.total > 0 ? `${accuracy}%` : '--'}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {skills.map((skill) => {
                        const skillData = stats.skills[skill];
                        const skillLabel = QUESTION_TYPE_LABELS[skill as QuestionType] || skill;
                        const skillAccuracy = skillData?.total > 0
                          ? Math.round((skillData.correct / skillData.total) * 100)
                          : 0;

                        const skillResources = SKILL_RESOURCES[skill];
                        const showResources = skillData?.total > 0 && skillAccuracy < 70 && skillResources;

                        const getResourceIcon = (type: LearningResource['type']) => {
                          switch (type) {
                            case 'video': return <Video className="w-3 h-3" />;
                            case 'practice': return <GraduationCap className="w-3 h-3" />;
                            case 'guide': return <BookOpen className="w-3 h-3" />;
                            default: return <FileText className="w-3 h-3" />;
                          }
                        };

                        return (
                          <div key={skill} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {skillAccuracy >= 70 ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : skillAccuracy >= 50 ? (
                                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                                ) : skillData?.total > 0 ? (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                                )}
                                <span className="text-sm font-medium">{skillLabel}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {skillData?.total > 0 ? (
                                  <span>
                                    {skillData.correct}/{skillData.total}{' '}
                                    <span
                                      className={cn(
                                        'font-medium',
                                        skillAccuracy >= 70
                                          ? 'text-emerald-500'
                                          : skillAccuracy >= 50
                                          ? 'text-amber-500'
                                          : 'text-red-500'
                                      )}
                                    >
                                      ({skillAccuracy}%)
                                    </span>
                                  </span>
                                ) : (
                                  'Non tenté'
                                )}
                              </div>
                            </div>
                            <Progress
                              value={skillAccuracy}
                              className={cn(
                                'h-2',
                                skillAccuracy >= 70
                                  ? '[&>div]:bg-emerald-500'
                                  : skillAccuracy >= 50
                                  ? '[&>div]:bg-amber-500'
                                  : '[&>div]:bg-red-500'
                              )}
                            />
                            {/* Learning resources for weak skills */}
                            {showResources && (
                              <div className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <p className="text-xs font-medium text-blue-400 mb-2 flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  Ressources pour progresser
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {skillResources.resources.slice(0, 4).map((resource, idx) => (
                                    <a
                                      key={idx}
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={cn(
                                        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                        'bg-background border hover:bg-muted',
                                        resource.language === 'fr'
                                          ? 'border-blue-500/30 text-blue-400 hover:border-blue-500/50'
                                          : 'border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50'
                                      )}
                                    >
                                      {getResourceIcon(resource.type)}
                                      <span className="max-w-[120px] truncate">{resource.title}</span>
                                      <Badge variant="outline" className="h-4 px-1 text-[10px] ml-1">
                                        {resource.language.toUpperCase()}
                                      </Badge>
                                      <ExternalLink className="w-3 h-3 opacity-50" />
                                    </a>
                                  ))}
                                </div>
                                {skillResources.resources.length > 4 && (
                                  <p className="text-[10px] text-muted-foreground mt-2">
                                    +{skillResources.resources.length - 4} autres ressources disponibles
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Time Analysis */}
      {timeStats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Analyse du temps
            </CardTitle>
            <CardDescription>Statistiques temporelles détaillées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-muted text-center">
                <p className="text-2xl font-bold text-foreground">{formatTime(timeStats.totalTime)}</p>
                <p className="text-xs text-muted-foreground">Temps total</p>
              </div>
              <div className="p-4 rounded-xl bg-muted text-center">
                <p className="text-2xl font-bold text-foreground">{formatTime(timeStats.avgPerQuiz)}</p>
                <p className="text-xs text-muted-foreground">Moyenne/quiz</p>
              </div>
              <div className="p-4 rounded-xl bg-muted text-center">
                <p className="text-2xl font-bold text-foreground">{Math.round(timeStats.avgPerQuestion)}s</p>
                <p className="text-xs text-muted-foreground">Moyenne/question</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-2xl font-bold text-emerald-500">{formatTime(timeStats.fastest)}</p>
                <p className="text-xs text-muted-foreground">Plus rapide</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-2xl font-bold text-red-500">{formatTime(timeStats.slowest)}</p>
                <p className="text-xs text-muted-foreground">Plus lent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz History Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Historique détaillé
          </CardTitle>
          <CardDescription>
            {filteredHistory.length} quiz{filteredHistory.length > 1 ? 's' : ''} sur la période sélectionnée
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun quiz ne correspond aux filtres sélectionnés
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredHistory.map((attempt) => {
                const quiz = quizzes.find((q) => q.id === attempt.quizId);
                const scorePercent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                const date = new Date(attempt.completedAt);

                return (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          scorePercent >= 70
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : scorePercent >= 50
                            ? 'bg-amber-500/20 text-amber-500'
                            : 'bg-red-500/20 text-red-500'
                        )}
                      >
                        {scorePercent >= 70 ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : scorePercent >= 50 ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {quiz?.title || attempt.quizId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Temps</p>
                        <p className="font-medium text-sm">{formatTime(attempt.timeSpent)}</p>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p
                          className={cn(
                            'text-lg font-bold',
                            scorePercent >= 70
                              ? 'text-emerald-500'
                              : scorePercent >= 50
                              ? 'text-amber-500'
                              : 'text-red-500'
                          )}
                        >
                          {scorePercent}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.score}/{attempt.totalQuestions}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
