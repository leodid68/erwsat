# Design : Authentification et Synchronisation des Données

**Date :** 2026-02-05
**Status :** Approuvé

## Résumé

Ajouter un système d'authentification avec NextAuth.js et une base de données Supabase (PostgreSQL) pour permettre aux utilisateurs de synchroniser leur progression entre appareils.

## Décisions

| Aspect | Choix |
|--------|-------|
| Auth providers | Google + Email/Password |
| Base de données | Supabase (PostgreSQL) gratuit |
| ORM | Prisma |
| Données synchronisées | Tout sauf les clés API |
| Auth obligatoire | Non, optionnelle avec bandeau incitatif |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Zustand     │  │ Auth Context│  │ Sync Hook           │  │
│  │ (localStorage)│ │ (session)   │  │ (localStorage ↔ DB) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ /api/auth/* │  │ /api/sync   │  │ Routes existantes   │  │
│  │ (NextAuth)  │  │ (CRUD user) │  │ (generate, etc.)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase (PostgreSQL)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ users       │  │ quiz_results│  │ user_content        │  │
│  │ accounts    │  │ (progression)│ │ (quiz, passages)    │  │
│  │ sessions    │  └─────────────┘  └─────────────────────┘  │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

## Schéma de base de données (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ===== Tables NextAuth (gérées automatiquement) =====

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  accounts      Account[]
  sessions      Session[]

  // Relations données utilisateur
  quizResults   QuizResult[]
  userContent   UserContent?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ===== Tables métier =====

model QuizResult {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  quizId         String   // ID du quiz côté client
  score          Int
  totalQuestions Int
  timeSpent      Int      // en secondes
  answers        Json     // détail des réponses
  completedAt    DateTime @default(now())

  @@index([userId])
}

model UserContent {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  data      Json     // Snapshot du Zustand store (quiz, passages, documents)
  version   Int      @default(1)
  updatedAt DateTime @updatedAt
}
```

## Flux d'authentification

### Connexion
1. User clique sur "Se connecter"
2. Modal s'ouvre avec options Google / Email+Password
3. NextAuth gère le flow OAuth ou credentials
4. Au succès, on déclenche la synchronisation

### Synchronisation au login
1. Récupérer les données DB de l'utilisateur (si existantes)
2. Récupérer les données localStorage
3. Merger intelligemment :
   - Comparer les timestamps `updatedAt`
   - Données plus récentes gagnent
   - Pour les quiz results, on additionne (pas de perte)
4. Push le résultat vers la DB
5. Mettre à jour localStorage avec les données mergées

### Sync continue (connecté)
- Debounced sync : après chaque modification du store, sync vers DB après 2s d'inactivité
- Sync au focus de la fenêtre (récupérer les changements d'un autre appareil)

### Déconnexion
- Les données restent en localStorage
- L'utilisateur peut continuer à utiliser l'app offline
- Au prochain login, merge se fait à nouveau

## Composants UI

### Header : Avatar/Bouton connexion
```tsx
// Si connecté : Avatar avec dropdown (profil, déconnexion)
// Si non connecté : Bouton "Se connecter"
```

### Bandeau incitatif
```tsx
// Affiché sur /practice, /results si non connecté
// Dismissable (stocké en localStorage)
<div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between">
  <span>Connectez-vous pour sauvegarder votre progression sur tous vos appareils.</span>
  <Button size="sm">Se connecter</Button>
</div>
```

### Modal de connexion
- Bouton Google (OAuth)
- Séparateur "ou"
- Formulaire Email/Password
- Lien vers inscription
- Lien "Mot de passe oublié"

## Variables d'environnement requises

```env
# Supabase
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="généré avec openssl rand -base64 32"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## Dépendances à installer

```bash
npm install next-auth @prisma/client @auth/prisma-adapter bcryptjs
npm install -D prisma @types/bcryptjs
```

## Structure des fichiers à créer

```
prisma/
  schema.prisma
src/
  app/
    api/
      auth/
        [...nextauth]/
          route.ts        # Config NextAuth
      sync/
        route.ts          # API sync données
  components/
    auth/
      auth-button.tsx     # Bouton header
      auth-modal.tsx      # Modal connexion
      auth-banner.tsx     # Bandeau incitatif
      auth-provider.tsx   # SessionProvider wrapper
  lib/
    auth.ts               # Config NextAuth exportée
    prisma.ts             # Client Prisma singleton
  hooks/
    useSync.ts            # Hook de synchronisation
```

## Étapes d'implémentation

1. **Setup Supabase** : Créer projet, récupérer URLs
2. **Setup Prisma** : Schema, migration, client
3. **Setup NextAuth** : Config, providers, adapter
4. **Composants Auth** : Button, Modal, Banner, Provider
5. **API Sync** : Routes CRUD pour UserContent
6. **Hook useSync** : Logique de merge et sync
7. **Intégration** : Brancher dans l'app existante
8. **Tests** : Vérifier les flows login/sync/logout
