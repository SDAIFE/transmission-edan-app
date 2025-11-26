# Plan de Développement - Application Élections Législatives

## Vision globale

**Objectif** : Application Next.js 15 pour gérer circonscriptions, élections, candidatures et résultats avec sécurité avancée et UI premium.

**Contraintes** : Tokens uniquement en cookies httpOnly, middleware obligatoire, validation Zod, UX responsive.

---

## État d'avancement

| Phase | Statut | Progression |
|-------|--------|-------------|
| Phase 1 – Bootstrapping | ✅ Terminée | 100% |
| Phase 2 – Authentification & sécurité | ✅ Terminée | 100% |
| Phase 3 – Types, validations, services | ✅ Terminée | 100% |
| Phase 4 – États & données | 🔄 En cours | 20% |
| Phase 5 – UI système | 🔄 En cours | 10% |
| Phase 6 – Pages publiques | ⏳ À faire | 0% |
| Phase 7 – Modules métiers | ⏳ À faire | 0% |
| Phase 8 – Résilience & finition | ⏳ À faire | 0% |

---

## Phase 1 – Bootstrapping ✅ TERMINÉE

- [x] Initialiser projet Next.js 15 + TypeScript
- [x] Installer toutes les dépendances (Tailwind 4, shadcn/ui, Radix, Ant Design, Chart.js, etc.)
- [x] Configurer `next.config.ts` (headers sécurité, rewrites API)
- [x] Configurer `tailwind.config.ts`
- [x] Configurer `tsconfig.json`
- [x] Configurer `components.json` (shadcn/ui style: new-york)
- [x] Configurer `eslint.config.mjs` (ESLint 9 flat config)
- [x] Configurer `globals.css` avec variables CSS shadcn/ui
- [x] Créer l'arborescence complète du projet
- [x] Créer les fichiers placeholders

---

## Phase 2 – Authentification & sécurité ✅ TERMINÉE

- [x] Implémenter `middleware.ts` (CORS, contrôle cookies, redirections rôles)
- [x] Créer `actions/auth.action.ts` (gestion cookies httpOnly sécurisés)
- [x] Construire `contexts/AuthContext.tsx` avec :
  - [x] Machine d'état (IDLE, LOADING, AUTHENTICATED, UNAUTHENTICATED, ERROR)
  - [x] Refresh token automatique
  - [x] Détection d'inactivité
  - [x] Synchronisation entre onglets
  - [x] Hooks `useAuth` et `usePermissions`
- [x] Développer routes API auth :
  - [x] `app/api/auth/login/route.ts`
  - [x] `app/api/auth/logout/route.ts`
  - [x] `app/api/auth/me/route.ts`
  - [x] `app/api/auth/refresh/route.ts`
  - [x] `app/api/auth/register/route.ts`
  - [x] `app/api/auth/token/route.ts`
- [x] Créer `lib/api/auth.ts` (client API)
- [x] Créer `lib/services/auth.service.ts`
- [x] Configurer rate limiting Upstash (`lib/config/ratelimit.ts`)
- [x] Configurer CORS (`lib/config/cors.ts`)
- [x] Headers de sécurité dans `next.config.ts`

---

## Phase 3 – Types, validations, services métier ✅ TERMINÉE

### Types TypeScript ✅
- [x] `types/circonscriptions.ts`
- [x] `types/elections.ts`
- [x] `types/candidatures.ts`
- [x] `types/resultats.ts`
- [x] `types/auth.ts`
- [x] `types/index.ts`
- [x] `types/css.d.ts` (déclarations CSS)

### Schémas Zod ✅
- [x] `lib/validations/circonscriptions.schema.ts`
- [x] `lib/validations/elections.schema.ts`
- [x] `lib/validations/candidatures.schema.ts`
- [x] `lib/validations/resultats.schema.ts`
- [x] `lib/validations/auth.schema.ts`

### Clients API ✅
- [x] `lib/api/circonscriptions.ts`
- [x] `lib/api/elections.ts`
- [x] `lib/api/candidatures.ts`
- [x] `lib/api/resultats.ts`
- [x] `lib/api/interceptor.ts` (Axios avec gestion cookies)

### Services ✅
- [x] `lib/services/circonscriptions.service.ts`
- [x] `lib/services/elections.service.ts`
- [x] `lib/services/candidatures.service.ts`
- [x] `lib/services/resultats.service.ts`

### Routes API métier ✅
- [x] `app/api/circonscriptions/route.ts` (GET, POST)
- [x] `app/api/circonscriptions/[id]/route.ts` (GET, PATCH, DELETE)
- [x] `app/api/circonscriptions/[id]/stats/route.ts` (GET)
- [x] `app/api/elections/route.ts` (GET, POST)
- [x] `app/api/elections/[id]/route.ts` (GET, PATCH, DELETE)
- [x] `app/api/elections/[id]/statut/route.ts` (PATCH)
- [x] `app/api/candidatures/route.ts` (GET, POST)
- [x] `app/api/candidatures/[id]/route.ts` (GET, PATCH, DELETE)
- [x] `app/api/resultats/route.ts` (GET, POST)
- [x] `app/api/resultats/[id]/route.ts` (GET, PATCH, DELETE)
- [x] `app/api/resultats/[id]/calculate/route.ts` (POST)
- [x] `app/api/resultats/[id]/publish/route.ts` (POST)

---

## Phase 4 – États & données 🔄 EN COURS (20%)

### Stores Zustand
- [x] `store/auth.ts` (placeholder créé)
- [x] `store/ui.ts` (placeholder créé)
- [ ] **TODO** : Implémenter `store/auth.ts` complet
  - État utilisateur synchronisé avec AuthContext
  - Actions de mise à jour
- [ ] **TODO** : Implémenter `store/ui.ts` complet
  - État sidebar (ouvert/fermé)
  - État thème
  - État modales globales
  - Notifications

### React Query Provider
- [ ] **TODO** : Créer `providers/query-provider.tsx`
- [ ] **TODO** : Configurer QueryClient avec options par défaut

### Hooks spécialisés
- [x] `hooks/use-auth.ts` (placeholder créé)
- [x] `hooks/use-circonscriptions.ts` (placeholder créé)
- [x] `hooks/use-elections.ts` (placeholder créé)
- [x] `hooks/use-candidatures.ts` (placeholder créé)
- [x] `hooks/use-resultats.ts` (placeholder créé)
- [ ] **TODO** : Implémenter `hooks/use-circonscriptions.ts` avec React Query
- [ ] **TODO** : Implémenter `hooks/use-elections.ts` avec React Query
- [ ] **TODO** : Implémenter `hooks/use-candidatures.ts` avec React Query
- [ ] **TODO** : Implémenter `hooks/use-resultats.ts` avec React Query

### Utilitaires
- [x] `lib/utils.ts` (cn function)
- [x] `lib/utils/format.ts` (placeholder créé)
- [x] `lib/utils/auth.ts`
- [x] `lib/utils/error.ts` (getErrorMessage)
- [ ] **TODO** : Implémenter formatteurs dans `lib/utils/format.ts`
  - Formatage dates
  - Formatage nombres/pourcentages
  - Formatage monétaire

---

## Phase 5 – UI système 🔄 EN COURS (10%)

### Layout global
- [x] `app/layout.tsx` (structure de base)
- [x] `app/(protected)/layout.tsx` (structure de base)
- [ ] **TODO** : Intégrer AuthProvider dans layout racine
- [ ] **TODO** : Intégrer QueryClientProvider
- [ ] **TODO** : Intégrer ThemeProvider (next-themes)
- [ ] **TODO** : Intégrer Sonner Toaster

### Composants Layout
- [x] `components/layout/` (dossier créé)
- [ ] **TODO** : Créer `components/layout/header.tsx`
- [ ] **TODO** : Créer `components/layout/sidebar.tsx`
- [ ] **TODO** : Créer `components/layout/main-layout.tsx`
- [ ] **TODO** : Créer `components/layout/footer.tsx`

### Composants Auth
- [x] `components/auth/route-guard.tsx` ✅ Implémenté
- [x] `components/auth/protected-route.tsx` (placeholder)
- [x] `components/auth/session-monitor.tsx` (placeholder)
- [x] `components/auth/inactivity-detector.tsx` (placeholder)
- [x] `components/auth/inactivity-warning-modal.tsx` (placeholder)
- [x] `components/auth/auth-interceptor.tsx` (placeholder)
- [x] `components/auth/auth-redirect.tsx` (placeholder)
- [x] `components/auth/session-expired-handler.tsx` (placeholder)
- [ ] **TODO** : Implémenter les composants auth restants

### Composants shadcn/ui
- [ ] **TODO** : Générer et configurer les composants requis :
  - [ ] Button
  - [ ] Input
  - [ ] Card
  - [ ] Dialog
  - [ ] Table
  - [ ] Tabs
  - [ ] Select
  - [ ] Checkbox
  - [ ] Form
  - [ ] Toast
  - [ ] Dropdown Menu
  - [ ] Avatar
  - [ ] Badge
  - [ ] Skeleton

### Thème sombre
- [ ] **TODO** : Configurer next-themes
- [ ] **TODO** : Créer toggle thème dans Header

---

## Phase 6 – Pages publiques ⏳ À FAIRE

### Landing Page
- [ ] **TODO** : Créer `app/page.tsx` avec :
  - Hero section avec CTA
  - Features section
  - Footer

### Pages Auth
- [x] `app/auth/login/page.tsx` (placeholder)
- [x] `app/auth/register/page.tsx` (placeholder)
- [ ] **TODO** : Implémenter formulaire login (React Hook Form + Zod)
- [ ] **TODO** : Implémenter formulaire register (React Hook Form + Zod)
- [ ] **TODO** : Messages d'erreur et validation
- [ ] **TODO** : Redirection après auth

---

## Phase 7 – Modules métiers protégés ⏳ À FAIRE

### Dashboard
- [x] `app/(protected)/dashboard/page.tsx` (placeholder)
- [ ] **TODO** : Statistiques globales avec React Query
- [ ] **TODO** : Graphiques (Chart.js/Recharts)
- [ ] **TODO** : Cartes résumé

### Circonscriptions
- [x] `app/(protected)/circonscriptions/` (dossier créé)
- [ ] **TODO** : Page liste avec filtres
- [ ] **TODO** : Page détail
- [ ] **TODO** : Formulaire création/édition
- [ ] **TODO** : Export Excel/PDF
- [ ] **TODO** : Carte Leaflet

### Élections
- [x] `app/(protected)/elections/` (dossier créé)
- [ ] **TODO** : Page liste avec filtres par statut
- [ ] **TODO** : Page détail
- [ ] **TODO** : Gestion des statuts
- [ ] **TODO** : Formulaire création/édition

### Candidatures
- [x] `app/(protected)/candidatures/` (dossier créé)
- [ ] **TODO** : Page liste par élection
- [ ] **TODO** : Formulaire avec upload photo (React Dropzone)
- [ ] **TODO** : Gestion ordre d'affichage
- [ ] **TODO** : Validation limites

### Résultats
- [x] `app/(protected)/resultats/` (dossier créé)
- [ ] **TODO** : Page saisie résultats
- [ ] **TODO** : Calcul pourcentages automatique
- [ ] **TODO** : Publication résultats
- [ ] **TODO** : Graphiques comparatifs
- [ ] **TODO** : Export PDF/Excel

### Utilisateurs (Admin)
- [x] `app/(protected)/utilisateurs/` (dossier créé)
- [ ] **TODO** : Page liste (Admin/SuperAdmin uniquement)
- [ ] **TODO** : Gestion rôles
- [ ] **TODO** : Activation/désactivation comptes

### Exigences communes à toutes les pages
- [ ] Tables/Cartes modulaires
- [ ] Formulaires RHF + Zod
- [ ] États loading/error + toasts
- [ ] Optimistic updates

---

## Phase 8 – Résilience & finition ⏳ À FAIRE

### Session & Auth
- [ ] **TODO** : Implémenter session monitor complet
- [ ] **TODO** : Refresh automatique avant expiration
- [ ] **TODO** : Modal avertissement expiration
- [ ] **TODO** : Gestion déconnexion forcée

### Tests
- [ ] **TODO** : Tests manuels auth/permissions
- [ ] **TODO** : Vérification redirections middleware
- [ ] **TODO** : Tests responsive

### Performance
- [ ] **TODO** : Lazy loading des pages
- [ ] **TODO** : Mémoisation composants (React.memo)
- [ ] **TODO** : Optimisation images

### Accessibilité
- [ ] **TODO** : Vérification ARIA (Radix)
- [ ] **TODO** : Navigation clavier
- [ ] **TODO** : Contraste couleurs

### Scripts npm
- [x] `dev` ✅
- [x] `build` ✅
- [x] `start` ✅
- [x] `lint` ✅

---

## Références clés

| Section | Fichier | Lignes |
|---------|---------|--------|
| Architecture & Stack | `PROMPT_NOUVELLE_APP_ELECTIONS.md` | 1-152 |
| Auth Middleware & Actions | `PROMPT_NOUVELLE_APP_ELECTIONS.md` | 154-345 |
| Types & Fonctionnalités | `PROMPT_NOUVELLE_APP_ELECTIONS.md` | 387-706 |

---

## Prochaines étapes recommandées

1. **Phase 4** : Implémenter les stores Zustand et hooks React Query
2. **Phase 5** : Générer composants shadcn/ui et créer le layout
3. **Phase 6** : Implémenter les pages login/register
4. **Phase 7** : Développer les modules métiers un par un

---

*Dernière mise à jour : 25 novembre 2025*
