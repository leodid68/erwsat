'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, FileText, Loader2, AlertCircle, Scissors, FileStack, File, CloudUpload, Sparkles, Brain } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

type SplitMode = 'sat' | 'medium' | 'full';
type SelectionMode = 'manual' | 'ai';

const SPLIT_MODE_OPTIONS: { value: SplitMode; label: string; description: string; icon: typeof Scissors }[] = [
  {
    value: 'sat',
    label: 'SAT Court',
    description: '80-125 mots par passage',
    icon: Scissors,
  },
  {
    value: 'medium',
    label: 'SAT Standard',
    description: '125-200 mots (recommandé)',
    icon: FileStack,
  },
  {
    value: 'full',
    label: 'Texte complet',
    description: 'Garder le max (jusqu\'à 2000 mots)',
    icon: File,
  },
];

interface FileDropzoneProps {
  onFileProcessed: (data: {
    documentId: string;
    filename: string;
    extractedText: string;
    passages: Array<{
      id: string;
      text: string;
      wordCount: number;
      selected: boolean;
      reason?: string; // AI explanation for why this passage was selected
    }>;
  }) => void;
}

export function FileDropzone({ onFileProcessed }: FileDropzoneProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>('medium');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('ai'); // AI by default

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsProcessing(true);
      setError(null);

      try {
        if (selectionMode === 'ai') {
          // Step 1: Extract text first
          setProcessingStep('Extraction du texte...');
          const formData = new FormData();
          formData.append('file', file);
          formData.append('splitMode', 'full'); // Get full text for AI analysis

          const extractResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const extractData = await extractResponse.json();

          if (!extractResponse.ok) {
            throw new Error(extractData.error || 'Failed to extract text');
          }

          // Step 2: Send to AI for smart selection
          setProcessingStep('Analyse IA des passages...');
          const smartResponse = await fetch('/api/upload/smart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              extractedText: extractData.extractedText,
              filename: file.name,
              maxPassages: 5,
            }),
          });

          const smartData = await smartResponse.json();

          if (!smartResponse.ok) {
            throw new Error(smartData.error || 'AI analysis failed');
          }

          onFileProcessed(smartData);
        } else {
          // Manual mode: traditional splitting
          setProcessingStep('Découpage du texte...');
          const formData = new FormData();
          formData.append('file', file);
          formData.append('splitMode', splitMode);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to process file');
          }

          onFileProcessed(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process file');
      } finally {
        setIsProcessing(false);
        setProcessingStep('');
      }
    },
    [onFileProcessed, splitMode, selectionMode]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf'],
        'text/plain': ['.txt'],
      },
      maxFiles: 1,
      disabled: isProcessing,
    });

  return (
    <div className="space-y-6">
      {/* Selection Mode Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
            selectionMode === 'ai'
              ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
              : 'bg-muted border border-border text-muted-foreground'
          )}>
            {selectionMode === 'ai' ? <Sparkles className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {selectionMode === 'ai' ? 'Sélection IA' : 'Découpage manuel'}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectionMode === 'ai'
                ? 'Claude analyse et sélectionne les meilleurs passages SAT'
                : 'Découpage automatique par paragraphes/phrases'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectionMode(selectionMode === 'ai' ? 'manual' : 'ai')}
          disabled={isProcessing}
          className={cn(
            'relative w-14 h-7 rounded-full transition-colors',
            selectionMode === 'ai' ? 'bg-violet-500' : 'bg-muted',
            isProcessing && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className={cn(
            'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform',
            selectionMode === 'ai' ? 'translate-x-7' : 'translate-x-0.5'
          )} />
        </button>
      </div>

      {/* Split Mode Selection - Only show in manual mode */}
      {selectionMode === 'manual' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">Mode de découpage</Label>
          <div className="grid grid-cols-3 gap-3">
            {SPLIT_MODE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = splitMode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSplitMode(option.value)}
                  disabled={isProcessing}
                  className={cn(
                    'cell-3d p-4 rounded-xl text-left transition-all duration-200',
                    isSelected
                      ? 'bg-primary/10 border border-primary/30 shadow-sm'
                      : 'bg-background border border-border hover:bg-muted hover:border-primary/20',
                    isProcessing && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn('w-4 h-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-sm font-medium', isSelected ? 'text-primary' : 'text-foreground')}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* File Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative overflow-hidden border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300',
          isDragActive
            ? 'border-primary/50 bg-primary/5 scale-[1.01] shadow-md'
            : 'border-border bg-background hover:border-primary/30 hover:bg-muted',
          isProcessing && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Background on drag */}
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent pointer-events-none" />
        )}

        <input {...getInputProps()} />

        <div className="relative flex flex-col items-center gap-4">
          {isProcessing ? (
            <>
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center border',
                selectionMode === 'ai'
                  ? 'bg-violet-500/10 border-violet-500/20'
                  : 'bg-primary/10 border-primary/20'
              )}>
                {selectionMode === 'ai' ? (
                  <Sparkles className="w-8 h-8 text-violet-500 animate-pulse" />
                ) : (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                )}
              </div>
              <div>
                <p className="font-semibold text-lg text-foreground">
                  {processingStep || 'Traitement du fichier...'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectionMode === 'ai'
                    ? 'Claude identifie les passages idéaux pour le SAT'
                    : 'Extraction du texte et création des passages'}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-300',
                  isDragActive
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-400/50 shadow-lg'
                    : 'bg-muted border-border'
                )}>
                  <CloudUpload className={cn(
                    'w-8 h-8 transition-all duration-300',
                    isDragActive ? 'text-white scale-110' : 'text-muted-foreground'
                  )} />
                </div>
                {/* Subtle highlight effect */}
                <div className={cn(
                  'absolute inset-0 rounded-2xl bg-primary blur-xl transition-opacity duration-200',
                  isDragActive ? 'opacity-20' : 'opacity-0'
                )} />
              </div>
              <div>
                <p className="font-semibold text-lg text-foreground">
                  {isDragActive ? 'Déposez votre fichier ici' : 'Déposez votre fichier ici ou cliquez pour parcourir'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF (max 10 Mo) ou TXT (max 5 Mo)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {acceptedFiles.length > 0 && !isProcessing && !error && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-success font-medium">Sélectionné : {acceptedFiles[0].name}</span>
        </div>
      )}
    </div>
  );
}
