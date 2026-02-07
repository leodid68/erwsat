'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileDropzone } from '@/components/upload/FileDropzone';
import { PassageSelector } from '@/components/upload/PassageSelector';
import { GutenbergImport } from '@/components/upload/GutenbergImport';
import { WikipediaImport } from '@/components/upload/WikipediaImport';
import { GuardianImport } from '@/components/upload/GuardianImport';
import { LibraryImport } from '@/components/upload/LibraryImport';
import { ChunkSelector } from '@/components/upload/ChunkSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuizStore } from '@/stores/quiz-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Passage, ExtractedDocument } from '@/types/quiz';
import { GutenbergBook, GuardianArticle, TextChunk } from '@/lib/text-sources';
import { TextCategory } from '@/lib/text-library';
import { CATEGORY_TO_GENRE } from '@/types/passage-library';
import { detectGenre } from '@/lib/question-selection';
import { FileText, Check, Upload, Sparkles, BookOpen, Globe, Newspaper, Library, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'file' | 'gutenberg' | 'wikipedia' | 'guardian' | 'library';
type Step = 'upload' | 'select';

// Wrapper component for suspense boundary
function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addDocument = useQuizStore((state) => state.addDocument);
  const addPassagesToLibrary = useQuizStore((state) => state.addPassagesToLibrary);
  const anthropicApiKey = useSettingsStore((state) => state.anthropicApiKey);

  const [tab, setTab] = useState<Tab>('file');
  const [step, setStep] = useState<Step>('upload');

  // Handle ?tab= query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['file', 'gutenberg', 'wikipedia', 'guardian', 'library'].includes(tabParam)) {
      setTab(tabParam as Tab);
    }
  }, [searchParams]);

  // File upload state
  const [documentData, setDocumentData] = useState<{
    documentId: string;
    filename: string;
    extractedText: string;
    passages: Passage[];
  } | null>(null);

  // Gutenberg state
  const [gutenbergData, setGutenbergData] = useState<{
    book: GutenbergBook;
    chunks: TextChunk[];
  } | null>(null);

  // Wikipedia state
  const [wikipediaData, setWikipediaData] = useState<{
    title: string;
    chunks: TextChunk[];
  } | null>(null);

  // Guardian state
  const [guardianData, setGuardianData] = useState<{
    article: GuardianArticle;
    chunks: TextChunk[];
  } | null>(null);

  // Library state
  const [libraryData, setLibraryData] = useState<{
    items: Array<{
      id: string;
      title: string;
      author?: string;
      category: TextCategory;
      provider: 'gutenberg' | 'wikipedia' | 'guardian';
      providerId: string | number;
      saveToLibrary?: boolean;
    }>;
    chunks: TextChunk[];
    saveToLibrary: boolean;
  } | null>(null);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [useSmartSelection, setUseSmartSelection] = useState(true); // AI-powered by default

  // File handlers
  const handleFileProcessed = (data: {
    documentId: string;
    filename: string;
    extractedText: string;
    passages: Passage[];
  }) => {
    setDocumentData(data);
    setStep('select');
  };

  const handlePassagesChange = (passages: Passage[]) => {
    if (documentData) {
      setDocumentData({ ...documentData, passages });
    }
  };

  const handleFileContinue = () => {
    if (documentData) {
      const doc: ExtractedDocument = {
        id: documentData.documentId,
        filename: documentData.filename,
        extractedText: documentData.extractedText,
        passages: documentData.passages,
        uploadedAt: new Date(),
      };
      addDocument(doc);
      router.push('/generate');
    }
  };

  // Gutenberg handlers
  const handleGutenbergFetched = (data: { book: GutenbergBook; chunks: TextChunk[] }) => {
    setGutenbergData(data);
    setStep('select');
  };

  const handleGutenbergBack = () => {
    setGutenbergData(null);
    setStep('upload');
  };

  const handleGutenbergContinue = (selectedChunks: TextChunk[]) => {
    if (gutenbergData) {
      const passages: Passage[] = selectedChunks.map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        wordCount: chunk.wordCount,
        selected: true,
      }));

      const combinedText = selectedChunks.map((c) => c.text).join('\n\n');
      const authorStr = gutenbergData.book.authors.length > 0
        ? ` - ${gutenbergData.book.authors[0]}`
        : '';

      const doc: ExtractedDocument = {
        id: crypto.randomUUID(),
        filename: `${gutenbergData.book.title}${authorStr}`,
        extractedText: combinedText,
        passages,
        uploadedAt: new Date(),
      };

      addDocument(doc);
      router.push('/generate');
    }
  };

  // Wikipedia handlers
  const handleWikipediaFetched = (data: { title: string; chunks: TextChunk[] }) => {
    setWikipediaData(data);
    setStep('select');
  };

  const handleWikipediaBack = () => {
    setWikipediaData(null);
    setStep('upload');
  };

  const handleWikipediaContinue = (selectedChunks: TextChunk[]) => {
    if (wikipediaData) {
      const passages: Passage[] = selectedChunks.map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        wordCount: chunk.wordCount,
        selected: true,
      }));

      const combinedText = selectedChunks.map((c) => c.text).join('\n\n');

      const doc: ExtractedDocument = {
        id: crypto.randomUUID(),
        filename: `Wikipedia: ${wikipediaData.title}`,
        extractedText: combinedText,
        passages,
        uploadedAt: new Date(),
      };

      addDocument(doc);
      router.push('/generate');
    }
  };

  // Guardian handlers
  const handleGuardianFetched = (data: { article: GuardianArticle; chunks: TextChunk[] }) => {
    setGuardianData(data);
    setStep('select');
  };

  const handleGuardianBack = () => {
    setGuardianData(null);
    setStep('upload');
  };

  const handleGuardianContinue = (selectedChunks: TextChunk[]) => {
    if (guardianData) {
      const passages: Passage[] = selectedChunks.map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        wordCount: chunk.wordCount,
        selected: true,
      }));

      const combinedText = selectedChunks.map((c) => c.text).join('\n\n');

      const doc: ExtractedDocument = {
        id: crypto.randomUUID(),
        filename: `Guardian: ${guardianData.article.title}`,
        extractedText: combinedText,
        passages,
        uploadedAt: new Date(),
      };

      addDocument(doc);
      router.push('/generate');
    }
  };

  // Library handlers
  const handleLibraryItemsSelected = async (items: Array<{
    id: string;
    title: string;
    author?: string;
    category: TextCategory;
    provider: 'gutenberg' | 'wikipedia' | 'guardian';
    providerId: string | number;
    saveToLibrary?: boolean;
  }>) => {
    setIsLoadingLibrary(true);
    // Check if any item has saveToLibrary flag
    const shouldSaveToLibrary = items.some(item => item.saveToLibrary);

    try {
      const allChunks: TextChunk[] = [];
      const endpoint = useSmartSelection ? '/api/library/fetch-smart' : '/api/library/fetch';

      for (const item of items) {
        // Build headers with optional API key for smart selection
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (useSmartSelection && anthropicApiKey) {
          headers['X-Anthropic-Key'] = anthropicApiKey;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            provider: item.provider,
            providerId: item.providerId,
            maxPassages: useSmartSelection ? 5 : undefined,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.chunks) {
            // Add source info to each chunk
            const chunksWithSource = data.chunks.map((chunk: TextChunk & { reason?: string }) => ({
              ...chunk,
              id: `${item.id}-${chunk.id}`,
              source: item.title,
              // Add metadata for saving to library
              itemTitle: item.title,
              itemAuthor: item.author,
              itemCategory: item.category,
              itemProvider: item.provider,
              itemProviderId: item.providerId, // For re-fetching later
            }));
            allChunks.push(...chunksWithSource);
          }
        }
      }

      setLibraryData({ items, chunks: allChunks, saveToLibrary: shouldSaveToLibrary });
      setStep('select');
    } catch (err) {
      console.error('Failed to fetch library items:', err);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const handleLibraryBack = () => {
    setLibraryData(null);
    setStep('upload');
  };

  const handleLibraryContinue = (selectedChunks: TextChunk[]) => {
    if (libraryData) {
      const passages: Passage[] = selectedChunks.map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        wordCount: chunk.wordCount,
        selected: true,
      }));

      const combinedText = selectedChunks.map((c) => c.text).join('\n\n');
      const titleStr = libraryData.items.length === 1
        ? libraryData.items[0].title
        : `${libraryData.items.length} textes`;

      const doc: ExtractedDocument = {
        id: crypto.randomUUID(),
        filename: `Bibliothèque: ${titleStr}`,
        extractedText: combinedText,
        passages,
        uploadedAt: new Date(),
      };

      // Save full text to library if enabled
      if (libraryData.saveToLibrary && selectedChunks.length > 0) {
        // Type for chunks with metadata
        type ChunkWithMeta = TextChunk & {
          itemTitle?: string;
          itemAuthor?: string;
          itemCategory?: TextCategory;
          itemProvider?: string;
          itemProviderId?: string | number;
        };

        const passagesToSave = selectedChunks.map((chunk) => {
          const chunkMeta = chunk as ChunkWithMeta;
          const category = chunkMeta.itemCategory || 'literature';
          return {
            title: chunkMeta.itemTitle || chunk.name || 'Passage',
            author: chunkMeta.itemAuthor,
            source: chunkMeta.itemTitle || 'Bibliothèque',
            provider: (chunkMeta.itemProvider || 'file') as 'gutenberg' | 'wikipedia' | 'guardian' | 'file',
            providerId: chunkMeta.itemProviderId, // For re-fetching later
            category: category,
            genre: CATEGORY_TO_GENRE[category] || detectGenre(chunk.text),
            text: chunk.text, // Full text!
            wordCount: chunk.wordCount,
            tags: [category, chunkMeta.itemProvider || 'file'],
          };
        });

        addPassagesToLibrary(passagesToSave);
      }

      addDocument(doc);
      router.push('/generate');
    }
  };

  // Tab change resets state
  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setStep('upload');
    setDocumentData(null);
    setGutenbergData(null);
    setWikipediaData(null);
    setGuardianData(null);
    setLibraryData(null);
  };

  const isSelectStep = step === 'select';

  const getStepLabel = () => {
    if (tab === 'file') return step === 'upload' ? 'Importer fichier' : 'Sélectionner passages';
    if (tab === 'gutenberg') return step === 'upload' ? 'Chercher livre' : 'Sélectionner parties';
    return step === 'upload' ? 'Chercher article' : 'Sélectionner parties';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute -left-20 -top-10 w-32 h-32 orb orb-cyan opacity-40" />
        <div className="relative">
          <h1 className="text-3xl font-bold">
            <span className="text-gradient">Importer un document</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Ajoutez du contenu pour générer des questions d'entraînement SAT.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-xl bg-white/500 border border-border backdrop-blur-sm w-fit">
        <button
          onClick={() => handleTabChange('file')}
          disabled={isSelectStep}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            tab === 'file'
              ? 'bg-gradient-to-r from-primary/20 to-blue-800/20 border border-primary/30 text-primary shadow-[0_0_15px_rgba(30,64,175,0.2)]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            isSelectStep && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Upload className="w-4 h-4" />
          Fichier
        </button>
        <button
          onClick={() => handleTabChange('gutenberg')}
          disabled={isSelectStep}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            tab === 'gutenberg'
              ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            isSelectStep && 'opacity-50 cursor-not-allowed'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Gutenberg
        </button>
        <button
          onClick={() => handleTabChange('wikipedia')}
          disabled={isSelectStep}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            tab === 'wikipedia'
              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            isSelectStep && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Globe className="w-4 h-4" />
          Wikipedia
        </button>
        <button
          onClick={() => handleTabChange('guardian')}
          disabled={isSelectStep}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            tab === 'guardian'
              ? 'bg-gradient-to-r from-amber-400/20 to-amber-500/20 border border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            isSelectStep && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Newspaper className="w-4 h-4" />
          Guardian
        </button>
        <button
          onClick={() => handleTabChange('library')}
          disabled={isSelectStep}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            tab === 'library'
              ? 'bg-gradient-to-r from-primary/20 to-blue-800/20 border border-primary/30 text-primary shadow-[0_0_15px_rgba(30,64,175,0.2)]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            isSelectStep && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Library className="w-4 h-4" />
          Bibliothèque
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300',
            step === 'upload'
              ? 'bg-gradient-to-br from-primary to-blue-400 text-white shadow-glow-sm'
              : 'bg-success/20 text-success border border-success/30'
          )}>
            {step === 'select' ? <Check className="w-5 h-5" /> : (
              tab === 'file' ? <Upload className="w-5 h-5" /> :
              tab === 'gutenberg' ? <BookOpen className="w-5 h-5" /> :
              tab === 'wikipedia' ? <Globe className="w-5 h-5" /> :
              tab === 'guardian' ? <Newspaper className="w-5 h-5" /> :
              <Library className="w-5 h-5" />
            )}
          </div>
          <span className={cn(
            'text-sm font-medium transition-colors',
            step === 'upload' ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {tab === 'file' ? 'Importer fichier' : tab === 'gutenberg' ? 'Chercher livre' : tab === 'wikipedia' ? 'Chercher article' : tab === 'guardian' ? 'Chercher actualité' : 'Bibliothèque'}
          </span>
        </div>

        <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent max-w-[80px]" />

        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300',
            step === 'select'
              ? 'bg-gradient-to-br from-primary to-blue-400 text-white shadow-glow-sm'
              : 'bg-white/500 text-muted-foreground border border-border'
          )}>
            <Sparkles className="w-5 h-5" />
          </div>
          <span className={cn(
            'text-sm font-medium transition-colors',
            step === 'select' ? 'text-foreground' : 'text-muted-foreground'
          )}>
            Sélectionner
          </span>
        </div>
      </div>

      {/* Content: File Tab */}
      {tab === 'file' && (
        <>
          {step === 'upload' && (
            <Card className="relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 orb orb-blue opacity-30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl icon-glow-cyan flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  Choisissez votre fichier
                </CardTitle>
                <CardDescription className="text-base">
                  Importez un fichier PDF ou texte.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <FileDropzone onFileProcessed={handleFileProcessed} />
              </CardContent>
            </Card>
          )}

          {step === 'select' && documentData && (
            <Card className="relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 orb orb-violet opacity-30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl icon-glow-violet flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  Sélectionner les passages
                </CardTitle>
                <CardDescription className="text-base">
                  Choisissez les passages à utiliser.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="mb-6 p-4 rounded-xl glass border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{documentData.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {documentData.passages.length} passages extraits
                      </p>
                    </div>
                  </div>
                </div>
                <PassageSelector
                  passages={documentData.passages}
                  onPassagesChange={handlePassagesChange}
                  onContinue={handleFileContinue}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Content: Gutenberg Tab */}
      {tab === 'gutenberg' && (
        <>
          {step === 'upload' && (
            <Card className="relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 orb orb-emerald opacity-30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  Project Gutenberg
                </CardTitle>
                <CardDescription className="text-base">
                  Cherchez des romans classiques : Austen, Dickens, Brontë...
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <GutenbergImport onBookFetched={handleGutenbergFetched} />
              </CardContent>
            </Card>
          )}

          {step === 'select' && gutenbergData && (
            <Card className="relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 orb orb-violet opacity-30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl icon-glow-violet flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  Sélectionner
                </CardTitle>
                <CardDescription className="text-base">
                  Choisissez les parties pour les questions.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ChunkSelector
                  title={gutenbergData.book.title}
                  subtitle={gutenbergData.book.authors.join(', ')}
                  chunks={gutenbergData.chunks}
                  onContinue={handleGutenbergContinue}
                  onBack={handleGutenbergBack}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Content: Wikipedia Tab */}
      {tab === 'wikipedia' && (
        <>
          {step === 'upload' && (
            <Card className="relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 orb orb-blue opacity-30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  Wikipedia
                </CardTitle>
                <CardDescription className="text-base">
                  Cherchez l'histoire, les sciences, les biographies...
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <WikipediaImport onArticleFetched={handleWikipediaFetched} />
              </CardContent>
            </Card>
          )}

          {step === 'select' && wikipediaData && (
            <Card className="relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 orb orb-violet opacity-30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl icon-glow-violet flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  Sélectionner
                </CardTitle>
                <CardDescription className="text-base">
                  Choisissez les parties pour les questions.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ChunkSelector
                  title={wikipediaData.title}
                  subtitle="Article Wikipédia"
                  chunks={wikipediaData.chunks}
                  onContinue={handleWikipediaContinue}
                  onBack={handleWikipediaBack}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Content: Guardian Tab */}
      {tab === 'guardian' && (
        <>
          {step === 'upload' && (
            <Card className="relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 orb orb-amber opacity-30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <Newspaper className="w-5 h-5 text-white" />
                  </div>
                  The Guardian
                </CardTitle>
                <CardDescription className="text-base">
                  Cherchez des actualités : politique, culture, science...
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <GuardianImport onArticleFetched={handleGuardianFetched} />
              </CardContent>
            </Card>
          )}

          {step === 'select' && guardianData && (
            <Card className="relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 orb orb-violet opacity-30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl icon-glow-violet flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  Sélectionner
                </CardTitle>
                <CardDescription className="text-base">
                  Choisissez les parties pour les questions.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ChunkSelector
                  title={guardianData.article.title}
                  subtitle={`The Guardian • ${guardianData.article.section}`}
                  chunks={guardianData.chunks}
                  onContinue={handleGuardianContinue}
                  onBack={handleGuardianBack}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Content: Library Tab */}
      {tab === 'library' && (
        <>
          {step === 'upload' && (
            <Card className="relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 orb orb-violet opacity-30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-800/25">
                    <Library className="w-5 h-5 text-white" />
                  </div>
                  Bibliothèque aléatoire
                </CardTitle>
                <CardDescription className="text-base">
                  Sélectionnez des catégories et laissez le hasard choisir
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                {isLoadingLibrary ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {useSmartSelection ? 'Analyse IA des passages...' : 'Chargement des textes...'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* AI Selection Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/10 to-blue-800/10 border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                          useSmartSelection
                            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-[0_0_15px_rgba(30,64,175,0.3)]'
                            : 'bg-white/50 border border-border text-muted-foreground'
                        )}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Sélection IA</p>
                          <p className="text-xs text-muted-foreground">Claude analyse et sélectionne les meilleurs passages</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUseSmartSelection(!useSmartSelection)}
                        className={cn(
                          'relative w-12 h-6 rounded-full transition-colors',
                          useSmartSelection ? 'bg-primary' : 'bg-white/60'
                        )}
                      >
                        <div className={cn(
                          'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                          useSmartSelection ? 'translate-x-6' : 'translate-x-0.5'
                        )} />
                      </button>
                    </div>
                    <LibraryImport onItemsSelected={handleLibraryItemsSelected} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 'select' && libraryData && (
            <Card className="relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 orb orb-violet opacity-30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl icon-glow-violet flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  Sélectionner les passages
                </CardTitle>
                <CardDescription className="text-base">
                  Choisissez les passages pour générer des questions
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ChunkSelector
                  title={libraryData.items.length === 1
                    ? libraryData.items[0].title
                    : `${libraryData.items.length} textes sélectionnés`}
                  subtitle={libraryData.items.length === 1
                    ? libraryData.items[0].author || 'Bibliothèque'
                    : libraryData.items.map(i => i.title).slice(0, 3).join(', ') + (libraryData.items.length > 3 ? '...' : '')}
                  chunks={libraryData.chunks}
                  onContinue={handleLibraryContinue}
                  onBack={handleLibraryBack}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  );
}
