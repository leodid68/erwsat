'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload, FileText, Loader2, AlertCircle, Scissors, FileStack, File, CloudUpload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

type SplitMode = 'sat' | 'medium' | 'full';

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
    }>;
  }) => void;
}

export function FileDropzone({ onFileProcessed }: FileDropzoneProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>('medium');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsProcessing(true);
      setError(null);

      try {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process file');
      } finally {
        setIsProcessing(false);
      }
    },
    [onFileProcessed, splitMode]
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
      {/* Split Mode Selection */}
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
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div>
                <p className="font-semibold text-lg text-foreground">Traitement du fichier...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Extraction du texte et création des passages
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
