# Design : Import arXiv

## Vue d'ensemble

Permettre l'import de papiers arXiv par ID pour générer des questions SAT à partir de sections sélectionnées.

## Flux utilisateur

1. L'utilisateur va sur `/upload`
2. Deux onglets : "Fichier" (actuel) | "arXiv" (nouveau)
3. Dans l'onglet arXiv : un champ pour coller l'ID (ex: `2301.00234`)
4. Clic sur "Récupérer" → appel API → affichage des sections
5. L'utilisateur coche les sections à garder (Abstract, Introduction, etc.)
6. Clic sur "Continuer" → sauvegarde dans le store → redirection vers `/generate`

## API arXiv

ArXiv expose une API gratuite sans authentification :
- Métadonnées : `http://export.arxiv.org/api/query?id_list=2301.00234`
- PDF : `https://arxiv.org/pdf/2301.00234.pdf`

## Route API `/api/arxiv/fetch`

**Input:**
```json
{ "arxivId": "2301.00234" }
```

**Output:**
```json
{
  "success": true,
  "paper": {
    "id": "2301.00234",
    "title": "Attention Is All You Need",
    "authors": ["Ashish Vaswani", "Noam Shazeer"],
    "abstract": "The dominant sequence...",
    "published": "2017-06-12",
    "pdfUrl": "https://arxiv.org/pdf/2301.00234.pdf"
  },
  "sections": [
    { "id": "abs", "name": "Abstract", "text": "...", "wordCount": 150 },
    { "id": "intro", "name": "Introduction", "text": "...", "wordCount": 820 }
  ]
}
```

## Parsing des sections

Détection des headers classiques via regex :
- Abstract, Introduction, Background, Methods/Methodology
- Results, Discussion, Conclusion, References

Patterns :
- `^(Abstract|Introduction|Conclusion|...)\s*$`
- `^\d+\.?\s+(Introduction|Methods|...)`
- `^[IVX]+\.?\s+[A-Z]`

## Composants UI

### ArxivImport.tsx
Formulaire avec champ ID et bouton "Récupérer"

### ArxivSectionSelector.tsx
Liste des sections avec checkboxes, affichage du titre/auteurs, bouton continuer

## Gestion d'erreurs

- ID invalide → "Format d'ID arXiv invalide"
- Paper non trouvé → "Papier non trouvé sur arXiv"
- PDF inaccessible → "Impossible de télécharger le PDF"
