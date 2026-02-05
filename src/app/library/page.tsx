'use client';

import { useState, useMemo } from 'react';
import { useQuizStore } from '@/stores/quiz-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  Search,
  Trash2,
  BookOpen,
  Globe,
  Newspaper,
  FileText,
  Filter,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Check,
  X,
  BarChart3,
  Clock,
  RefreshCw,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SavedPassage, getLibraryStats, filterPassages, PassageFilterOptions } from '@/types/passage-library';
import { TEXT_GENRE_LABELS, TextGenre } from '@/types/question';

const PROVIDER_ICONS = {
  gutenberg: BookOpen,
  wikipedia: Globe,
  guardian: Newspaper,
  file: FileText,
};

const PROVIDER_LABELS = {
  gutenberg: 'Gutenberg',
  wikipedia: 'Wikipedia',
  guardian: 'The Guardian',
  file: 'Fichier',
};

export default function LibraryPage() {
  const { passageLibrary, removePassageFromLibrary, clearPassageLibrary } = useQuizStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<TextGenre | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showUnusedOnly, setShowUnusedOnly] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Calculate stats
  const stats = useMemo(() => getLibraryStats(passageLibrary), [passageLibrary]);

  // Filter passages
  const filteredPassages = useMemo(() => {
    const options: PassageFilterOptions = {
      searchQuery: searchQuery || undefined,
      genre: selectedGenre || undefined,
      provider: selectedProvider || undefined,
      unused: showUnusedOnly || undefined,
    };
    return filterPassages(passageLibrary, options);
  }, [passageLibrary, searchQuery, selectedGenre, selectedProvider, showUnusedOnly]);

  // Get unique genres and providers for filters
  const availableGenres = useMemo(() => {
    const genres = new Set<TextGenre>();
    passageLibrary.forEach((p) => genres.add(p.genre));
    return Array.from(genres);
  }, [passageLibrary]);

  const availableProviders = useMemo(() => {
    const providers = new Set<string>();
    passageLibrary.forEach((p) => providers.add(p.provider));
    return Array.from(providers);
  }, [passageLibrary]);

  const handleClearLibrary = () => {
    if (confirmClear) {
      clearPassageLibrary();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 5000);
    }
  };

  // Export passages to TXT file
  const handleExportTxt = () => {
    const passagesToExport = filteredPassages.length > 0 ? filteredPassages : passageLibrary;

    if (passagesToExport.length === 0) return;

    // Build TXT content
    const lines: string[] = [
      '═══════════════════════════════════════════════════════════════',
      '                    BIBLIOTHÈQUE SAT ERW',
      `                    ${passagesToExport.length} passages exportés`,
      `                    ${new Date().toLocaleDateString('fr-FR')}`,
      '═══════════════════════════════════════════════════════════════',
      '',
    ];

    passagesToExport.forEach((passage, index) => {
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push(`PASSAGE ${index + 1}/${passagesToExport.length}`);
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push('');
      lines.push(`Titre: ${passage.title}`);
      if (passage.author) {
        lines.push(`Auteur: ${passage.author}`);
      }
      lines.push(`Genre: ${TEXT_GENRE_LABELS[passage.genre] || passage.genre}`);
      lines.push(`Source: ${PROVIDER_LABELS[passage.provider as keyof typeof PROVIDER_LABELS] || passage.provider}`);
      lines.push(`Mots: ${passage.wordCount}`);
      lines.push(`Utilisé: ${passage.timesUsed} fois`);
      lines.push('');
      lines.push('TEXTE:');
      lines.push('');
      lines.push(passage.text);
      lines.push('');
      lines.push('');
    });

    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('                         FIN DU FICHIER');
    lines.push('═══════════════════════════════════════════════════════════════');

    // Create and download file
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sat-library-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (passageLibrary.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-400" />
            Bibliothèque de passages
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos textes sauvegardés pour générer des questions.
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Bibliothèque vide</h3>
            <p className="text-muted-foreground mb-6">
              Importez des textes et activez "Sauvegarder dans la bibliothèque" pour les réutiliser.
            </p>
            <Button asChild>
              <Link href="/upload?tab=library">
                <Sparkles className="w-4 h-4 mr-2" />
                Importer des textes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-400" />
            Bibliothèque de passages
          </h1>
          <p className="text-muted-foreground mt-1">
            {passageLibrary.length} textes sauvegardés
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/upload?tab=library">
              <Sparkles className="w-4 h-4 mr-1" />
              Importer
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTxt}
            title={filteredPassages.length !== passageLibrary.length
              ? `Exporter ${filteredPassages.length} passages filtrés`
              : `Exporter tous les ${passageLibrary.length} passages`}
          >
            <Download className="w-4 h-4 mr-1" />
            Exporter TXT
          </Button>
          <Button
            variant={confirmClear ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleClearLibrary}
          >
            {confirmClear ? (
              <>
                <AlertCircle className="w-4 h-4 mr-1" />
                Confirmer
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-1" />
                Vider
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalPassages}</p>
                <p className="text-xs text-muted-foreground">Passages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">~{stats.potentialQuestions}</p>
                <p className="text-xs text-muted-foreground">Questions potentielles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.unusedCount}</p>
                <p className="text-xs text-muted-foreground">Non utilisés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(stats.averageUsage * 10) / 10}
                </p>
                <p className="text-xs text-muted-foreground">Utilisation moy.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Genre Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Distribution par genre
          </CardTitle>
          <CardDescription>Répartition des textes dans votre bibliothèque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.byGenre)
              .sort(([, a], [, b]) => b - a)
              .map(([genre, count]) => {
                const percent = Math.round((count / stats.totalPassages) * 100);
                return (
                  <div key={genre} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">
                        {TEXT_GENRE_LABELS[genre as TextGenre] || genre}
                      </span>
                      <span className="text-slate-500">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4 text-violet-500" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Rechercher un texte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {/* Genre filters */}
            {availableGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  selectedGenre === genre
                    ? 'bg-violet-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                )}
              >
                {TEXT_GENRE_LABELS[genre] || genre}
              </button>
            ))}

            {/* Divider */}
            {availableGenres.length > 0 && availableProviders.length > 0 && (
              <div className="w-px h-6 bg-white/10" />
            )}

            {/* Provider filters */}
            {availableProviders.map((provider) => {
              const Icon = PROVIDER_ICONS[provider as keyof typeof PROVIDER_ICONS] || FileText;
              return (
                <button
                  key={provider}
                  onClick={() =>
                    setSelectedProvider(selectedProvider === provider ? null : provider)
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                    selectedProvider === provider
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {PROVIDER_LABELS[provider as keyof typeof PROVIDER_LABELS] || provider}
                </button>
              );
            })}

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Unused only toggle */}
            <button
              onClick={() => setShowUnusedOnly(!showUnusedOnly)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                showUnusedOnly
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              <Clock className="w-3 h-3" />
              Non utilisés
            </button>

            {/* Clear filters */}
            {(searchQuery || selectedGenre || selectedProvider || showUnusedOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre(null);
                  setSelectedProvider(null);
                  setShowUnusedOnly(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Effacer
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Passages List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Passages ({filteredPassages.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredPassages.map((passage) => {
                const Icon =
                  PROVIDER_ICONS[passage.provider as keyof typeof PROVIDER_ICONS] || FileText;
                return (
                  <div
                    key={passage.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-slate-500" />
                          <Badge
                            variant="outline"
                            className="text-xs border-white/20 text-slate-400"
                          >
                            {TEXT_GENRE_LABELS[passage.genre] || passage.genre}
                          </Badge>
                          {passage.timesUsed === 0 && (
                            <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-slate-200 text-sm line-clamp-1">
                          {passage.title}
                        </p>
                        {passage.author && (
                          <p className="text-xs text-slate-500">{passage.author}</p>
                        )}
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {passage.text}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>{passage.wordCount} mots</span>
                          <span>Utilisé {passage.timesUsed}x</span>
                          {passage.questionsGenerated.length > 0 && (
                            <span>{passage.questionsGenerated.length} questions</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePassageFromLibrary(passage.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {filteredPassages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500">Aucun passage ne correspond aux filtres</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link href="/generate">
            <Sparkles className="w-4 h-4 mr-2" />
            Générer des questions
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/upload?tab=library">
            Importer plus de textes
          </Link>
        </Button>
      </div>
    </div>
  );
}
