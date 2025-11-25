Vision globale
Objectif : application Next.js 15 pour gérer circonscriptions, élections, candidatures et résultats avec sécurité avancée et UI premium.
Contraintes : tokens uniquement en cookies httpOnly, middleware obligatoire, validation Zod, UX responsive.
Plan de développement
Phase 1 – Bootstrapping
Initialiser projet Next.js 15 + TypeScript, installer toutes les dépendances listées, configurer Tailwind 4 et shadcn/ui (style: new-york).
Mettre en place next.config.ts, tailwind.config.ts, tsconfig.json, components.json.
Structurer l’arborescence décrite et créer les fichiers placeholders.
Phase 2 – Authentification & sécurité
Implémenter middleware complet (CORS, contrôle cookies, redirections rôles) suivant la section correspondante.
Créer actions/auth.action.ts pour gestion des cookies sécurisés.
Construire AuthContext + hooks (useAuth, usePermissions) : machine d’état, refresh token, inactivité, synchro onglets.
Développer routes API auth (login, logout, me, refresh, token) + service lib/services/auth.service.ts.
Intégrer Next-Auth si besoin des providers futurs, sinon se limiter aux server actions + API.
Mettre en place rate limiting Upstash sur endpoints sensibles, CSP & headers de sécurité.
Phase 3 – Types, validations, services métier
Créer les interfaces TypeScript (types/*) pour circonscriptions, élections, candidatures, résultats.
Écrire schémas Zod correspondants (lib/validations/*.schema.ts).
Implémenter services API (lib/api/*.ts + lib/services/*.ts) + intercepteur axios gérant cookies httpOnly côté serveur (via routes proxy).
Phase 4 – États & données
Configurer Zustand stores (store/auth, store/ui) et React Query Provider.
Ajouter hooks spécialisés (hooks/use-*.ts) reliant services, React Query et Zustand.
Préparer formatteurs utilitaires (lib/utils).
Phase 5 – UI système
Mettre en place layout global (app/layout.tsx) avec AuthProvider, theming, Sonner toast, animations Framer.
Créer composants de base (Header, Sidebar, MainLayout) et modules d’auth (route guard, inactivity monitor, modales).
Générer les composants shadcn/ui requis (Button, Input, Card, Dialog, Table, Tabs, etc.).
Configurer thème sombre via next-themes.
Phase 6 – Pages publiques
Implémenter / (landing) avec CTA, /auth/login, /auth/register utilisant React Hook Form + Zod + messages d’erreur.
Phase 7 – Modules métiers protégés
dashboard: statistiques globales (React Query + Chart.js/Recharts).
circonscriptions: CRUD complet, filtres, exports Excel/PDF.
elections: gestion par circonscription, statuts, validations.
candidatures: formulaire avec upload photo (React Dropzone), ordre d’affichage, limites.
resultats: saisie résultats, calcul pourcentages, publication, graphiques, exports.
utilisateurs: réservé Admin/SuperAdmin (respect du middleware).
Chaque page doit intégrer :
Tables/Cartes modulaires.
Formulaires RHF + Zod.
États loading/error + toasts.
Optimistic updates lorsque pertinent.
Phase 8 – Résilience & finition
Ajouter session monitor, refresh auto, gestion expiration.
Tests manuels auth/permissions, vérif redirections middleware.
Optimisations perf (lazy loading, memo).
Accessibilité (Radix, aria) et responsive.
Scripts npm (dev, build, start, lint) déjà définis.
Références clés
Description complète de l’architecture et stack
PROMPT_NOUVELLE_APP_ELECTIONS.mdLines 1-152
// … sections contexte, architecture, packages …
Exigences d’authentification middleware + server actions
PROMPT_NOUVELLE_APP_ELECTIONS.mdLines 154-345
// … middleware.ts, actions/auth.action.ts …
Types métiers et fonctionnalités principales
PROMPT_NOUVELLE_APP_ELECTIONS.mdLines 387-706
// … modèles de données, UI, pages, fonctionnalités 