'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore, AI_PROVIDERS, AIProvider } from '@/stores/settings-store';
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
  ChevronDown,
  Zap,
  DollarSign,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const {
    apiKeys,
    selectedProvider,
    selectedModel,
    setApiKey,
    setSelectedProvider,
    setSelectedModel,
    clearAllKeys,
    isProviderConfigured,
    getActiveProvider,
  } = useSettingsStore();

  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeProvider = getActiveProvider();
  const hasActiveKey = isProviderConfigured(selectedProvider);

  // Load current key into input when provider changes
  useEffect(() => {
    const currentKey = apiKeys[selectedProvider];
    setInputKey(currentKey || '');
    setShowKey(false);
  }, [selectedProvider, apiKeys]);

  const handleSave = () => {
    const trimmedKey = inputKey.trim();
    if (trimmedKey) {
      // Validate prefix if defined
      if (activeProvider.keyPrefix && !trimmedKey.startsWith(activeProvider.keyPrefix)) {
        return;
      }
      setApiKey(selectedProvider, trimmedKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleClear = () => {
    setInputKey('');
    setApiKey(selectedProvider, null);
  };

  const isValidFormat = () => {
    const trimmed = inputKey.trim();
    if (!trimmed) return false;
    if (!activeProvider.keyPrefix) return trimmed.length > 10;
    return trimmed.startsWith(activeProvider.keyPrefix);
  };

  // Count configured providers
  const configuredCount = AI_PROVIDERS.filter((p) => isProviderConfigured(p.id)).length;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Configurez vos clés API pour utiliser les fonctionnalités de génération.
        </p>
      </div>

      {/* Global Status */}
      <Card
        className={cn(
          'border-2',
          configuredCount > 0
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-amber-500/30 bg-amber-500/5'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {configuredCount > 0 ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-emerald-500">
                    {configuredCount} fournisseur{configuredCount > 1 ? 's' : ''} configuré
                    {configuredCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Génération de questions et sélection IA activées
                  </p>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">
                  {activeProvider.name}
                </Badge>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-amber-500">Clé API requise</p>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez au moins une clé API pour débloquer toutes les fonctionnalités
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Provider Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Fournisseur IA
          </CardTitle>
          <CardDescription>Choisissez votre fournisseur et configurez votre clé API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Fournisseur actif</label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-background',
                  'hover:border-primary/30 transition-colors',
                  isDropdownOpen && 'border-primary/50 ring-2 ring-primary/20'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      hasActiveKey
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {hasActiveKey ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{activeProvider.name}</p>
                    <p className="text-xs text-muted-foreground">{activeProvider.description}</p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-muted-foreground transition-transform',
                    isDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 py-2 rounded-xl border bg-background shadow-lg max-h-[400px] overflow-y-auto">
                  {AI_PROVIDERS.map((provider) => {
                    const isConfigured = isProviderConfigured(provider.id);
                    const isSelected = selectedProvider === provider.id;
                    return (
                      <button
                        key={provider.id}
                        onClick={() => {
                          setSelectedProvider(provider.id);
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors',
                          isSelected && 'bg-primary/10'
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            isConfigured
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {isConfigured ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{provider.name}</p>
                            {isConfigured && (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-emerald-500/30 text-emerald-500"
                              >
                                Configuré
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{provider.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {provider.inputPrice}/{provider.outputPrice}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Model Selector */}
          {activeProvider.models.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Modèle</label>
              <div className="grid grid-cols-2 gap-2">
                {activeProvider.models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all',
                      selectedModel === model.id
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border hover:border-primary/30'
                    )}
                  >
                    <p className="font-medium text-sm text-foreground">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Clé API {activeProvider.name}</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder={activeProvider.keyPlaceholder}
                className={cn(
                  'w-full px-4 py-3 pr-24 rounded-xl border bg-background text-sm font-mono',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20',
                  inputKey && !isValidFormat() && 'border-red-500/50',
                  inputKey && isValidFormat() && 'border-emerald-500/50'
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
            {inputKey && !isValidFormat() && activeProvider.keyPrefix && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                La clé doit commencer par "{activeProvider.keyPrefix}"
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={!inputKey || !isValidFormat()} className="flex-1">
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
            {hasActiveKey && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>

          {/* Get API Key Link */}
          <div className="pt-4 border-t border-border">
            <a
              href={activeProvider.consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Key className="w-4 h-4" />
              Obtenir une clé API {activeProvider.name}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Comparaison des tarifs
          </CardTitle>
          <CardDescription>Prix par million de tokens (entrée/sortie)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {AI_PROVIDERS.map((provider) => {
              const isConfigured = isProviderConfigured(provider.id);
              const isActive = selectedProvider === provider.id;
              return (
                <div
                  key={provider.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg transition-colors',
                    isActive ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        isConfigured ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                      )}
                    />
                    <span className={cn('text-sm', isActive ? 'font-medium' : 'text-muted-foreground')}>
                      {provider.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-mono">{provider.inputPrice}</span> in
                    </span>
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-mono">{provider.outputPrice}</span> out
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            💡 DeepSeek offre le meilleur rapport qualité/prix. Claude Sonnet offre la meilleure qualité.
          </p>
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
            <p>
              Vos clés sont stockées <strong>uniquement dans votre navigateur</strong> (localStorage)
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p>
              Elles ne sont <strong>jamais envoyées à nos serveurs</strong> ni stockées ailleurs
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p>
              Les appels API vont <strong>directement au fournisseur</strong> depuis votre navigateur
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p>Vous êtes facturé directement par le fournisseur selon votre usage</p>
          </div>
        </CardContent>
      </Card>

      {/* Clear All */}
      {configuredCount > 0 && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={clearAllKeys}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer toutes les clés API
          </Button>
        </div>
      )}
    </div>
  );
}
