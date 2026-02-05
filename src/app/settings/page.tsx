'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
  Trash2,
  Save,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const {
    anthropicApiKey,
    setAnthropicApiKey,
    clearAllKeys,
    isAnthropicConfigured,
  } = useSettingsStore();

  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load current key into input on mount
  useEffect(() => {
    if (anthropicApiKey) {
      setInputKey(anthropicApiKey);
    }
  }, [anthropicApiKey]);

  const handleSave = () => {
    const trimmedKey = inputKey.trim();
    if (trimmedKey && trimmedKey.startsWith('sk-ant-')) {
      setAnthropicApiKey(trimmedKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleClear = () => {
    setInputKey('');
    clearAllKeys();
  };

  const isValidFormat = inputKey.trim().startsWith('sk-ant-');
  const hasKey = !!anthropicApiKey && isAnthropicConfigured();

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 20) return '••••••••••••••••';
    return key.slice(0, 10) + '••••••••••••••••••••' + key.slice(-4);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Configurez vos clés API pour utiliser les fonctionnalités de génération.
        </p>
      </div>

      {/* API Key Status */}
      <Card className={cn(
        'border-2',
        hasKey ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {hasKey ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-emerald-500">API configurée</p>
                  <p className="text-sm text-muted-foreground">
                    Génération de questions et sélection IA activées
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-amber-500">Clé API requise</p>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez votre clé Anthropic pour débloquer toutes les fonctionnalités
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Anthropic API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Clé API Anthropic (Claude)
          </CardTitle>
          <CardDescription>
            Nécessaire pour la génération de questions et la sélection intelligente de passages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Votre clé API</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                className={cn(
                  'w-full px-4 py-3 pr-24 rounded-xl border bg-background text-sm font-mono',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20',
                  inputKey && !isValidFormat && 'border-red-500/50',
                  inputKey && isValidFormat && 'border-emerald-500/50'
                )}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {inputKey && !isValidFormat && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                La clé doit commencer par "sk-ant-"
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={!inputKey || !isValidFormat}
              className="flex-1"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Enregistré !
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
            {hasKey && (
              <Button variant="outline" onClick={handleClear} className="text-red-500 hover:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>

          {/* Get API Key Link */}
          <div className="pt-4 border-t border-border">
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Key className="w-4 h-4" />
              Obtenir une clé API sur console.anthropic.com
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p>Votre clé est stockée <strong>uniquement dans votre navigateur</strong> (localStorage)</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p>Elle n'est <strong>jamais envoyée à nos serveurs</strong> ni stockée ailleurs</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p>Les appels API vont <strong>directement à Anthropic</strong> depuis votre navigateur</p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p>Vous êtes facturé directement par Anthropic selon votre usage</p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Coût estimé</CardTitle>
          <CardDescription>Tarifs Claude Sonnet 4</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground">Input</p>
              <p className="text-lg font-bold text-foreground">$3 <span className="text-xs font-normal text-muted-foreground">/ M tokens</span></p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground">Output</p>
              <p className="text-lg font-bold text-foreground">$15 <span className="text-xs font-normal text-muted-foreground">/ M tokens</span></p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ~$0.01-0.02 par question générée • ~$9 pour 600 questions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
