# PROMPT DE CRÉATION : Application de Gestion des Élections Législatives

## 📋 CONTEXTE ET OBJECTIFS

Créer une application Next.js 15 professionnelle pour la gestion des élections législatives avec le concept de **circonscriptions**. Chaque circonscription contient une élection avec un nombre défini de candidatures.

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique

**Framework & Core:**
- Next.js 15.5.3 (App Router)
- React 19.1.0
- TypeScript 5
- Node.js 20+

**Authentification & Sécurité:**
- Next-Auth 5.0.0-beta.29
- Cookies httpOnly pour les tokens (sécurité XSS)
- Middleware Next.js pour la protection des routes
- JWT (jsonwebtoken 9.0.2)

**UI & Styling:**
- Tailwind CSS 4
- shadcn/ui (style: new-york)
- Radix UI (composants accessibles)
- Ant Design 5.27.4
- Lucide React (icônes)
- Framer Motion (animations)
- next-themes (mode sombre)

**State Management:**
- Zustand 5.0.8 (state management)
- React Context API (AuthContext)
- TanStack React Query 5.90.1 (server state)

**Formulaires & Validation:**
- React Hook Form 7.63.0
- Zod 4.1.11 (validation)
- @hookform/resolvers 5.2.2

**Data Visualization:**
- Chart.js 4.5.0
- react-chartjs-2 5.3.0
- Recharts 3.2.1

**Autres Packages:**
- Axios 1.12.2 (HTTP client)
- React Hot Toast 2.6.0 / Sonner 2.0.7 (notifications)
- React Dropzone 14.3.8 (upload fichiers)
- XLSX 0.18.5 (traitement Excel)
- jsPDF 3.0.3 + jspdf-autotable 5.0.2 (export PDF)
- Leaflet 1.9.4 + react-leaflet 5.0.0 (cartes)
- @upstash/ratelimit 2.0.6 (rate limiting)

## 📁 STRUCTURE DU PROJET

```
elections-legislatives-app/
├── actions/
│   └── auth.action.ts          # Server actions pour l'authentification
├── app/
│   ├── (protected)/            # Routes protégées (layout group)
│   │   ├── dashboard/
│   │   ├── circonscriptions/
│   │   ├── elections/
│   │   ├── candidatures/
│   │   ├── resultats/
│   │   └── utilisateurs/
│   ├── api/
│   │   ├── auth/               # Routes API d'authentification
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   ├── refresh/route.ts
│   │   │   └── token/route.ts
│   │   ├── circonscriptions/
│   │   ├── elections/
│   │   ├── candidatures/
│   │   └── resultats/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── layout.tsx              # Layout racine avec AuthProvider
│   ├── page.tsx                # Page d'accueil
│   └── globals.css
├── components/
│   ├── auth/                   # Composants d'authentification
│   │   ├── auth-interceptor.tsx
│   │   ├── auth-redirect.tsx
│   │   ├── protected-route.tsx
│   │   ├── route-guard.tsx
│   │   ├── session-monitor.tsx
│   │   ├── session-expired-handler.tsx
│   │   ├── inactivity-detector.tsx
│   │   └── inactivity-warning-modal.tsx
│   ├── circonscriptions/       # Composants pour circonscriptions
│   ├── elections/              # Composants pour élections
│   ├── candidatures/           # Composants pour candidatures
│   ├── resultats/              # Composants pour résultats
│   ├── dashboard/              # Composants dashboard
│   ├── layout/                 # Header, Sidebar, MainLayout
│   ├── modals/                 # Modales réutilisables
│   ├── forms/                  # Formulaires réutilisables
│   ├── tables/                 # Tables réutilisables
│   └── ui/                     # Composants shadcn/ui
├── contexts/
│   └── AuthContext.tsx         # Contexte d'authentification
├── hooks/
│   ├── use-auth.ts
│   ├── use-circonscriptions.ts
│   ├── use-elections.ts
│   ├── use-candidatures.ts
│   └── use-resultats.ts
├── lib/
│   ├── api/                    # Clients API
│   │   ├── auth.ts
│   │   ├── circonscriptions.ts
│   │   ├── elections.ts
│   │   ├── candidatures.ts
│   │   └── interceptor.ts
│   ├── services/               # Services métier
│   │   ├── auth.service.ts
│   │   ├── circonscriptions.service.ts
│   │   ├── elections.service.ts
│   │   └── candidatures.service.ts
│   ├── config/
│   │   ├── api.ts
│   │   └── cors.ts
│   ├── utils/
│   │   ├── auth.ts
│   │   └── format.ts
│   └── validations/            # Schémas Zod
│       ├── auth.schema.ts
│       ├── circonscriptions.schema.ts
│       └── elections.schema.ts
├── store/
│   ├── auth.ts                 # Store Zustand pour auth
│   └── ui.ts                   # Store Zustand pour UI
├── types/
│   ├── auth.ts
│   ├── circonscriptions.ts
│   ├── elections.ts
│   ├── candidatures.ts
│   └── index.ts
├── middleware.ts               # Middleware Next.js (protection routes)
├── next.config.ts              # Configuration Next.js
├── tailwind.config.ts          # Configuration Tailwind
├── tsconfig.json               # Configuration TypeScript
├── components.json             # Configuration shadcn/ui
└── package.json
```

## 🔐 SYSTÈME D'AUTHENTIFICATION COMPLET

### 1. Middleware (`middleware.ts`)

Le middleware doit implémenter :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isOriginAllowed } from '@/lib/config/cors';

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // ✅ Gestion CORS pour les routes API
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    
    if (origin && !isOriginAllowed(origin)) {
      return new NextResponse(null, { 
        status: 403,
        statusText: 'Origine non autorisée'
      });
    }
    
    const response = NextResponse.next();
    
    if (origin && isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
      );
    }
    
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: origin && isOriginAllowed(origin) ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT',
          'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          'Access-Control-Max-Age': '86400',
        } : {}
      });
    }
    
    return response;
  }

  // Routes publiques
  const publicRoutes = ['/', '/auth/login', '/auth/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // ✅ Vérification de l'authentification via cookies httpOnly
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const userRole = cookieStore.get('user_role')?.value;
  const userStatus = cookieStore.get('user_status')?.value;

  const isLoggedIn = !!accessToken && !!userRole;

  // Redirection si connecté et accès à /auth
  if (isLoggedIn && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Redirection si non connecté et accès à route protégée
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', nextUrl));
  }

  // Vérification des permissions selon le rôle
  if (isLoggedIn && userRole) {
    // Routes réservées aux admins et super admins
    const adminRoutes = ['/utilisateurs', '/rapports', '/configurations'];
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    if (isAdminRoute && !['ADMIN', 'SADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    // Vérifier si le compte est actif
    if (userStatus === 'inactive') {
      return NextResponse.redirect(new URL('/auth/login?error=account_inactive', nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
```

### 2. Server Actions (`actions/auth.action.ts`)

```typescript
"use server";

import { cookies } from "next/headers";

/**
 * ✅ SÉCURITÉ CRITIQUE : Crée des cookies d'authentification sécurisés
 * 
 * Configuration de sécurité :
 * - httpOnly: true (protection XSS - JavaScript ne peut pas accéder aux tokens)
 * - secure: true (HTTPS uniquement)
 * - sameSite: "strict" (protection CSRF maximale)
 * - maxAge: 7 jours (rotation fréquente des tokens)
 */
export const createAuthCookie = async (
  token: string,
  refreshToken: string,
  role: string,
  status: string,
  userName?: string
) => {
  const cookieStore = await cookies();
  
  // ✅ Configuration sécurisée pour les TOKENS (httpOnly)
  const secureCookieConfig = {
    httpOnly: true,              // ✅ Protection XSS
    secure: true,                // ✅ HTTPS uniquement
    sameSite: "strict" as const, // ✅ Protection CSRF
    path: "/",
    maxAge: 60 * 60 * 24 * 7,    // ✅ 7 jours
  };
  
  // ✅ Configuration pour les DONNÉES NON-SENSIBLES (accessibles côté client)
  const publicCookieConfig = {
    httpOnly: false,             // Accessible côté client pour l'UI
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,    // ✅ 7 jours
  };
  
  // ✅ TOKENS SENSIBLES : Stockés avec httpOnly
  cookieStore.set("access_token", token, secureCookieConfig);
  cookieStore.set("refresh_token", refreshToken, secureCookieConfig);
  
  // ✅ DONNÉES NON-SENSIBLES : Accessibles pour l'UI
  cookieStore.set("user_role", role, publicCookieConfig);
  cookieStore.set("user_status", status, publicCookieConfig);
  cookieStore.set("user_name", userName || "", publicCookieConfig);
};

/**
 * ✅ SÉCURITÉ : Supprime tous les cookies d'authentification
 */
export const deleteAuthCookie = async () => {
  const cookieStore = await cookies();
  
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("user_role");
  cookieStore.delete("user_status");
  cookieStore.delete("user_name");
};

/**
 * ✅ SÉCURITÉ : Récupère le token d'accès côté serveur
 */
export const getServerToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value || null;
};

/**
 * ✅ SÉCURITÉ : Récupère le refresh token côté serveur
 */
export const getServerRefreshToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("refresh_token")?.value || null;
};

/**
 * ✅ SÉCURITÉ : Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getServerToken();
  return !!token;
};
```

### 3. AuthContext (`contexts/AuthContext.tsx`)

Le contexte doit gérer :
- États d'authentification (IDLE, LOADING, AUTHENTICATED, UNAUTHENTICATED, ERROR)
- Login/Register/Logout
- Refresh token automatique
- Gestion de l'expiration de session
- Détection d'inactivité
- Synchronisation entre onglets
- Vérification du token via cookies httpOnly

**Structure minimale requise :**
- `AuthProvider` avec machine d'état
- `useAuth()` hook
- `usePermissions()` hook
- Gestion des erreurs robuste
- Prévention des boucles infinies
- Optimisations de performance (useMemo, useCallback)

### 4. Routes API d'Authentification

**`app/api/auth/login/route.ts`** : Endpoint de connexion
**`app/api/auth/logout/route.ts`** : Endpoint de déconnexion
**`app/api/auth/me/route.ts`** : Récupération du profil utilisateur
**`app/api/auth/refresh/route.ts`** : Rafraîchissement du token
**`app/api/auth/token/route.ts`** : Vérification de la présence du token

### 5. Service d'Authentification (`lib/services/auth.service.ts`)

Le service doit exposer :
- `login(credentials: LoginDto): Promise<AuthResponseDto>`
- `register(userData: RegisterDto): Promise<UserResponseDto>`
- `logout(): Promise<void>`
- `getCurrentUser(): Promise<UserResponseDto>`
- `refreshToken(): Promise<string>`
- `verifyToken(): Promise<boolean>`
- `updateProfile(updates: Partial<UserResponseDto>): Promise<UserResponseDto>`

**Important :** Utiliser uniquement les cookies httpOnly, jamais localStorage pour les tokens.

## 🗳️ MODÈLE DE DONNÉES - ÉLECTIONS LÉGISLATIVES

### Types Principaux

```typescript
// types/circonscriptions.ts
export interface Circonscription {
  id: string;
  code: string;
  libelle: string;
  region: string;
  departement: string;
  nombreSieges: number; // Nombre de sièges à pourvoir
  nombreCandidatures: number; // Nombre de candidatures attendues
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// types/elections.ts
export interface Election {
  id: string;
  circonscriptionId: string;
  circonscription: Circonscription;
  dateElection: Date;
  statut: 'PREPARATION' | 'EN_COURS' | 'CLOTUREE' | 'PUBLIEE';
  nombreInscrits: number;
  nombreVotants?: number;
  nombreBulletinsNuls?: number;
  nombreBulletinsBlancs?: number;
  nombreBulletinsValides?: number;
  createdAt: Date;
  updatedAt: Date;
}

// types/candidatures.ts
export interface Candidature {
  id: string;
  electionId: string;
  election: Election;
  numeroOrdre: number; // Ordre d'affichage sur le bulletin
  nom: string;
  prenom: string;
  partiPolitique?: string;
  liste?: string;
  photo?: string;
  biographie?: string;
  programme?: string;
  statut: 'VALIDE' | 'INVALIDE' | 'RETIREE';
  nombreVoix?: number;
  pourcentageVoix?: number;
  estElu?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// types/resultats.ts
export interface ResultatElection {
  id: string;
  electionId: string;
  election: Election;
  circonscription: Circonscription;
  candidatures: Candidature[];
  nombreInscrits: number;
  nombreVotants: number;
  nombreBulletinsNuls: number;
  nombreBulletinsBlancs: number;
  nombreBulletinsValides: number;
  tauxParticipation: number;
  candidatsElus: Candidature[];
  datePublication?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎨 CONFIGURATION UI

### Tailwind Config (`tailwind.config.ts`)

Utiliser la même configuration que l'app actuelle avec :
- Couleurs primaires personnalisées
- Mode sombre (darkMode: "class")
- Animations personnalisées
- Shadows personnalisées
- Configuration shadcn/ui (style: new-york)

### Composants UI

Utiliser shadcn/ui avec les composants suivants (minimum) :
- Button, Input, Label
- Card, Dialog, Alert Dialog
- Table, Select, Checkbox
- Dropdown Menu, Popover
- Toast (Sonner)
- Badge, Avatar
- Tabs, Accordion
- Form (avec React Hook Form)

## 📦 PACKAGE.JSON

```json
{
  "name": "elections-legislatives-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@ant-design/icons": "^6.0.2",
    "@auth/core": "^0.40.0",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tanstack/react-query": "^5.90.1",
    "@tanstack/react-table": "^8.21.3",
    "@types/jsonwebtoken": "^9.0.10",
    "@upstash/ratelimit": "^2.0.6",
    "@upstash/redis": "^1.35.5",
    "antd": "^5.27.4",
    "axios": "^1.12.2",
    "chart.js": "^4.5.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.23.18",
    "jsonwebtoken": "^9.0.2",
    "jspdf": "^3.0.3",
    "jspdf-autotable": "^5.0.2",
    "lucide-react": "^0.544.0",
    "next": "15.5.3",
    "next-auth": "^5.0.0-beta.29",
    "next-themes": "^0.4.6",
    "react": "19.1.0",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "19.1.0",
    "react-hook-form": "^7.63.0",
    "react-hot-toast": "^2.6.0",
    "recharts": "^3.2.1",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "xlsx": "^0.18.5",
    "zod": "^4.1.11",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.3",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## ⚙️ CONFIGURATION NEXT.JS

### `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  poweredByHeader: false,
  generateEtags: false,
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self'",
              "connect-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`
          : 'http://localhost:3001/api/v1/:path*',
      },
    ];
  },
  experimental: {
    proxyTimeout: 180000,
  },
};

export default nextConfig;
```

## 🔒 SÉCURITÉ

### Points Critiques

1. **Cookies httpOnly** : Tous les tokens doivent être dans des cookies httpOnly
2. **CORS** : Configuration stricte des origines autorisées
3. **CSP** : Content Security Policy stricte
4. **Rate Limiting** : Utiliser @upstash/ratelimit pour les endpoints sensibles
5. **Validation** : Zod pour toutes les entrées utilisateur
6. **Sanitization** : Nettoyer toutes les données avant stockage
7. **HTTPS** : Forcer HTTPS en production (secure: true dans cookies)

## 📱 PAGES PRINCIPALES

### Routes Protégées

1. **`/dashboard`** : Tableau de bord avec statistiques
2. **`/circonscriptions`** : Liste et gestion des circonscriptions
3. **`/elections`** : Liste et gestion des élections par circonscription
4. **`/candidatures`** : Gestion des candidatures par élection
5. **`/resultats`** : Visualisation et publication des résultats
6. **`/utilisateurs`** : Gestion des utilisateurs (Admin/SuperAdmin)

### Routes Publiques

1. **`/`** : Page d'accueil
2. **`/auth/login`** : Connexion
3. **`/auth/register`** : Inscription (si autorisée)

## 🎯 FONCTIONNALITÉS PRINCIPALES

### Gestion des Circonscriptions
- CRUD complet
- Filtrage et recherche
- Export Excel/PDF
- Validation du nombre de sièges

### Gestion des Élections
- Création d'élection par circonscription
- Suivi du statut (préparation, en cours, clôturée, publiée)
- Validation du nombre de candidatures

### Gestion des Candidatures
- Ajout/modification/suppression de candidatures
- Ordre d'affichage (numéro d'ordre)
- Upload de photos
- Validation du nombre maximum de candidatures

### Résultats
- Saisie des résultats par candidature
- Calcul automatique des pourcentages
- Détermination des élus (selon nombre de sièges)
- Publication des résultats
- Export PDF/Excel
- Visualisation graphique (Chart.js/Recharts)

## 🚀 DÉMARRAGE

1. Créer le projet Next.js 15 avec TypeScript
2. Installer tous les packages listés
3. Configurer shadcn/ui
4. Implémenter le système d'authentification complet (middleware + auth.action.ts + AuthContext)
5. Créer la structure de dossiers
6. Définir les types TypeScript
7. Implémenter les services API
8. Créer les composants UI
9. Implémenter les pages principales
10. Tester l'authentification et les permissions

## 📝 NOTES IMPORTANTES

- **Toujours utiliser les cookies httpOnly** pour les tokens, jamais localStorage
- **Middleware obligatoire** pour protéger toutes les routes
- **Validation Zod** sur tous les formulaires
- **Gestion d'erreurs robuste** avec messages utilisateur clairs
- **Loading states** sur toutes les actions asynchrones
- **Optimistic updates** avec React Query
- **Accessibilité** : Respecter les standards WCAG
- **Responsive** : Mobile-first design
- **Performance** : Code splitting, lazy loading, memoization

---

**Ce prompt doit servir de référence complète pour créer l'application avec la même qualité et architecture que l'application actuelle.**

