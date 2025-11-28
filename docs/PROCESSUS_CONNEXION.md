# Processus de Connexion - Documentation Complète

## Vue d'ensemble

Ce document décrit en détail toutes les étapes du processus d'authentification dans l'application TRECIV-Expert - EDAN 2025. Le système utilise une architecture sécurisée basée sur des cookies httpOnly pour stocker les tokens d'authentification.

## Architecture de Sécurité

### Stockage des Tokens
- **Tokens sensibles** (access_token, refresh_token) : Stockés dans des cookies **httpOnly** (non accessibles en JavaScript)
- **Données publiques** (user_role, user_status, user_name) : Stockés dans des cookies accessibles côté client pour l'UI
- **Configuration de sécurité** :
  - `httpOnly: true` pour les tokens (protection XSS)
  - `secure: true` (HTTPS uniquement)
  - `sameSite: "strict"` (protection CSRF maximale)
  - `maxAge: 7 jours` (rotation fréquente des tokens)

## Flux de Connexion - Étapes Détaillées

### ÉTAPE 1 : Soumission du Formulaire de Connexion
**Fichier** : `app/auth/login/page.tsx`

**Description** :
- L'utilisateur saisit ses identifiants (email et mot de passe) dans le formulaire de connexion
- Le formulaire utilise `react-hook-form` avec validation Zod (`loginSchema`)
- Lors du clic sur "Se connecter", la fonction `onSubmit` est déclenchée

**Code** :
```typescript
const onSubmit = async (data: LoginFormData) => {
  await login({
    email: data.email,
    password: data.password,
  });
}
```

**Validation** :
- Email : Format valide requis
- Mot de passe : Non vide, longueur minimale

---

### ÉTAPE 2 : Appel de la Fonction Login du Contexte
**Fichier** : `app/auth/login/page.tsx` → `contexts/AuthContext.tsx`

**Description** :
- La fonction `onSubmit` appelle `login()` depuis le hook `useAuth()` (AuthContext)
- Les identifiants validés sont transmis au contexte d'authentification
- Le contexte gère l'état global d'authentification de l'application

**Code** :
```typescript
const { login, isLoading, error } = useAuth();
await login({ email: data.email, password: data.password });
```

---

### ÉTAPE 3 : Traitement dans le Contexte d'Authentification
**Fichier** : `contexts/AuthContext.tsx`

**Description** :
- La fonction `login()` du contexte reçoit les identifiants
- Mise à jour de l'état : `AUTH_STATES.LOADING`
- Réinitialisation des erreurs et des états de session expirée
- Délégation vers `authService.login()` pour la logique métier

**Code** :
```typescript
const login = useCallback(async (credentials: LoginDto) => {
  setAuthState(AUTH_STATES.LOADING);
  setError(null);
  setSessionExpired(false);
  
  const response = await authService.login(credentials);
  // ...
}, [router]);
```

---

### ÉTAPE 4 : Appel du Service d'Authentification
**Fichier** : `contexts/AuthContext.tsx` → `lib/services/auth.service.ts`

**Description** :
- Le contexte délègue vers `authService.login()` pour la logique métier
- Le service orchestre l'appel API et la gestion des cookies
- Validation des données avant traitement

**Code** :
```typescript
// Dans AuthContext
const response = await authService.login(credentials);
```

---

### ÉTAPE 5 : Service d'Authentification - Logique Métier
**Fichier** : `lib/services/auth.service.ts`

**Description** :
- Réception des identifiants depuis `AuthContext.login()`
- Orchestration de l'appel API et de la gestion des cookies
- Validation des données de réponse du serveur

**Validations effectuées** :
- Présence du `accessToken` dans la réponse
- Présence des données utilisateur (`user`)
- Présence de l'email utilisateur
- Présence du rôle utilisateur

**Code** :
```typescript
async login(credentials: LoginDto): Promise<AuthResponseDto> {
  const response = await authApi.login(credentials);
  
  // Validations
  if (!response.accessToken) {
    throw new Error('Token d\'accès manquant');
  }
  if (!response.user) {
    throw new Error('Données utilisateur manquantes');
  }
  // ...
}
```

---

### ÉTAPE 6 : Appel de l'API d'Authentification
**Fichier** : `lib/services/auth.service.ts` → `lib/api/auth.ts`

**Description** :
- Délégation vers `authApi.login()` pour l'appel HTTP au backend
- Transmission des identifiants au serveur d'authentification
- Utilisation de `apiClient` (Axios) pour la requête HTTP

**Code** :
```typescript
// Dans authService
const response = await authApi.login(credentials);
```

---

### ÉTAPE 7 : Appel HTTP au Backend
**Fichier** : `lib/api/auth.ts`

**Description** :
- Exécution de la requête POST vers l'endpoint `/auth/login` du serveur backend
- Utilisation de `apiClient.post()` (Axios)
- Le serveur valide les identifiants et retourne les tokens + données utilisateur

**Code** :
```typescript
login: async (credentials: LoginDto): Promise<AuthResponseDto> => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}
```

**Route Backend** : `/api/backend/auth/login` (via proxy Next.js)

---

### ÉTAPE 8 : Route API Next.js (Optionnelle - Si utilisée)
**Fichier** : `app/api/auth/login/route.ts`

**Description** :
- Route API Next.js qui peut être utilisée comme intermédiaire
- Vérification du rate limiting (protection force brute)
- Appel de l'API backend via `authApi.login()`
- Création des cookies sécurisés via `createAuthCookie()`

**Sécurité** :
- Rate limiting : Protection contre les attaques par force brute
- Validation des données d'entrée
- Gestion des erreurs avec codes de statut appropriés

**Code** :
```typescript
export async function POST(request: NextRequest) {
  // Vérification rate limit
  const { success } = await loginRateLimit.limit(identifier);
  if (!success) {
    return NextResponse.json({ error: 'Trop de tentatives' }, { status: 429 });
  }
  
  // Appel backend
  const response = await authApi.login({ email, password });
  
  // Création cookies
  await createAuthCookie(
    response.accessToken,
    response.refreshToken,
    response.user.role.code,
    response.user.isActive ? 'active' : 'inactive',
    `${response.user.firstName} ${response.user.lastName}`
  );
}
```

---

### ÉTAPE 9 : Stockage Sécurisé des Tokens
**Fichier** : `lib/services/auth.service.ts` → `actions/auth.action.ts`

**Description** :
- Réception des tokens depuis la réponse du serveur
- Appel de `createAuthCookie()` pour stocker les tokens de manière sécurisée
- Séparation des données sensibles (httpOnly) et publiques (accessibles côté client)

**Cookies créés** :

1. **Cookies httpOnly (sécurisés)** :
   - `access_token` : Token d'accès JWT
   - `refresh_token` : Token de rafraîchissement

2. **Cookies publics (pour l'UI)** :
   - `user_role` : Code du rôle utilisateur (USER, ADMIN, SADMIN)
   - `user_status` : Statut utilisateur (active, inactive)
   - `user_name` : Nom complet de l'utilisateur

**Code** :
```typescript
// Dans authService
await createAuthCookie(
  response.accessToken,
  response.refreshToken || '',
  roleCode,
  userStatus,
  userName
);
```

**Fichier** : `actions/auth.action.ts`
```typescript
export const createAuthCookie = async (
  token: string,
  refreshToken: string,
  role: string,
  status: string,
  userName?: string
) => {
  const cookieStore = await cookies();
  
  // Configuration sécurisée pour les TOKENS
  const secureCookieConfig = {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  };
  
  // Configuration pour les DONNÉES NON-SENSIBLES
  const publicCookieConfig = {
    httpOnly: false,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
  
  cookieStore.set("access_token", token, secureCookieConfig);
  cookieStore.set("refresh_token", refreshToken, secureCookieConfig);
  cookieStore.set("user_role", role, publicCookieConfig);
  cookieStore.set("user_status", status, publicCookieConfig);
  cookieStore.set("user_name", userName || "", publicCookieConfig);
};
```

---

### ÉTAPE 10 : Détermination du Chemin de Redirection
**Fichier** : `contexts/AuthContext.tsx` → `lib/utils/auth.ts`

**Description** :
- Extraction du rôle utilisateur depuis la réponse du service
- Appel de `getRedirectPath()` pour déterminer la destination
- Logique de redirection basée sur les permissions du rôle

**Code** :
```typescript
// Dans AuthContext.login()
const roleCode = typeof response.user.role === "string"
  ? response.user.role
  : response.user.role?.code || "USER";
const redirectPath = getRedirectPath(roleCode);
```

**Fichier** : `lib/utils/auth.ts`
```typescript
export function getRedirectPath(role: string): string {
  switch (role) {
    case 'SADMIN':
      return '/dashboard';
    case 'ADMIN':
      return '/dashboard';
    case 'USER':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}
```

---

### ÉTAPE 11 : Mise à Jour de l'État du Contexte
**Fichier** : `contexts/AuthContext.tsx`

**Description** :
- Mise à jour de l'état utilisateur avec les données reçues
- Passage de l'état à `AUTH_STATES.AUTHENTICATED`
- Réinitialisation des erreurs et des états de session expirée

**Code** :
```typescript
if (response.user) {
  setUser(response.user);
  setAuthState(AUTH_STATES.AUTHENTICATED);
  setSessionExpired(false);
  setInactivityWarning(false);
}
```

---

### ÉTAPE 12 : Exécution de la Redirection
**Fichier** : `contexts/AuthContext.tsx`

**Description** :
- Redirection avec délai pour laisser l'état se stabiliser
- Utilisation de `router.push()` pour naviguer vers la page de destination
- Affichage d'un message de succès via toast

**Code** :
```typescript
// Dans AuthContext.login()
setTimeout(() => {
  router.push(redirectPath);
}, 100);
```

**Dans la page de login** :
```typescript
toast.success("Connexion réussie");
```

---

## Gestion des Erreurs

### Erreurs Possibles

1. **Erreurs de validation** :
   - Email invalide
   - Mot de passe manquant
   - **Gestion** : Affichage d'erreurs de validation via `react-hook-form`

2. **Erreurs d'authentification** :
   - Identifiants incorrects (401)
   - Compte inactif
   - **Gestion** : Affichage d'un message d'erreur dans le formulaire

3. **Erreurs de rate limiting** (429) :
   - Trop de tentatives de connexion
   - **Gestion** : Affichage d'un compteur dégressif avec temps d'attente

4. **Erreurs réseau** :
   - Serveur indisponible
   - Timeout
   - **Gestion** : Message d'erreur générique avec possibilité de réessayer

### Gestion des Erreurs dans le Code

**Dans AuthContext** :
```typescript
catch (error: any) {
  setError(error.message || "Erreur de connexion");
  setAuthState(AUTH_STATES.ERROR);
  throw error;
}
```

**Dans la page de login** :
```typescript
catch (error: any) {
  if (error.isRateLimited || error.response?.status === 429) {
    setIsRateLimited(true);
    setRetryAfter(error.retryAfter || 60);
    toast.error(`Trop de tentatives. Réessayez dans ${seconds} secondes.`);
    return;
  }
  toast.error(errorMessage);
}
```

---

## Sécurité

### Mesures de Sécurité Implémentées

1. **Protection XSS** :
   - Tokens stockés dans des cookies httpOnly (non accessibles en JavaScript)
   - Validation et sanitisation des entrées utilisateur

2. **Protection CSRF** :
   - Cookies avec `sameSite: "strict"`
   - Validation des origines des requêtes

3. **Protection Force Brute** :
   - Rate limiting sur les tentatives de connexion
   - Compteur dégressif avec temps d'attente

4. **Sécurité HTTPS** :
   - Cookies avec `secure: true` (HTTPS uniquement)
   - Validation des certificats SSL

5. **Gestion des Sessions** :
   - Tokens avec expiration (7 jours)
   - Refresh automatique des tokens expirés
   - Déconnexion automatique en cas d'inactivité

### Intercepteur Axios

**Fichier** : `lib/api/interceptor.ts`

L'intercepteur Axios gère automatiquement :
- Ajout du token Bearer depuis les cookies httpOnly
- Refresh automatique des tokens expirés (401)
- Gestion des erreurs réseau
- Gestion du rate limiting

**Code** :
```typescript
apiClient.interceptors.request.use(async (config) => {
  const token = await getTokenFromCookies();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Tentative de refresh automatique
      const newToken = await authService.refreshToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

---

## Diagramme de Flux

```
┌─────────────────┐
│  Utilisateur    │
│  (Formulaire)   │
└────────┬────────┘
         │ ÉTAPE 1: Soumission
         ▼
┌─────────────────┐
│  LoginPage      │
│  (onSubmit)     │
└────────┬────────┘
         │ ÉTAPE 2: Appel login()
         ▼
┌─────────────────┐
│  AuthContext    │
│  (login)        │
└────────┬────────┘
         │ ÉTAPE 3-4: Délégation
         ▼
┌─────────────────┐
│  authService    │
│  (login)        │
└────────┬────────┘
         │ ÉTAPE 5-6: Appel API
         ▼
┌─────────────────┐
│  authApi        │
│  (login)        │
└────────┬────────┘
         │ ÉTAPE 7: Requête HTTP
         ▼
┌─────────────────┐
│  Backend API    │
│  /auth/login    │
└────────┬────────┘
         │ Réponse (tokens + user)
         ▼
┌─────────────────┐
│  authService    │
│  (validation)   │
└────────┬────────┘
         │ ÉTAPE 8-9: Création cookies
         ▼
┌─────────────────┐
│  createAuthCookie│
│  (actions)      │
└────────┬────────┘
         │ ÉTAPE 10-11: Mise à jour état
         ▼
┌─────────────────┐
│  AuthContext    │
│  (setUser)      │
└────────┬────────┘
         │ ÉTAPE 12: Redirection
         ▼
┌─────────────────┐
│  Dashboard      │
│  (Page cible)   │
└─────────────────┘
```

---

## Fichiers Clés

### Fichiers Principaux

1. **Interface Utilisateur** :
   - `app/auth/login/page.tsx` : Page de connexion

2. **Gestion d'État** :
   - `contexts/AuthContext.tsx` : Contexte d'authentification global

3. **Logique Métier** :
   - `lib/services/auth.service.ts` : Service d'authentification
   - `lib/api/auth.ts` : Appels API d'authentification

4. **Sécurité** :
   - `actions/auth.action.ts` : Actions serveur pour les cookies
   - `lib/api/interceptor.ts` : Intercepteur Axios pour les tokens

5. **Utilitaires** :
   - `lib/utils/auth.ts` : Fonctions utilitaires d'authentification
   - `lib/auth/rate-limit.ts` : Gestion du rate limiting

### Routes API

1. **Route de connexion** :
   - `app/api/auth/login/route.ts` : Route API Next.js pour la connexion

2. **Route de token** :
   - `app/api/auth/token/route.ts` : Récupération du token depuis les cookies

3. **Route de refresh** :
   - `app/api/auth/refresh/route.ts` : Rafraîchissement du token

4. **Route de déconnexion** :
   - `app/api/auth/logout/route.ts` : Déconnexion utilisateur

---

## Tests et Débogage

### Logs de Développement

En mode développement, des logs détaillés sont affichés à chaque étape :

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('🔐 [AuthContext] Tentative de connexion...');
  console.log('✅ [AuthService] Connexion réussie pour:', response.user.email);
  console.log('📋 [AuthService] Rôle:', roleCode, '| Statut:', userStatus);
}
```

### Points de Contrôle

1. **Vérification des cookies** :
   - Ouvrir les DevTools → Application → Cookies
   - Vérifier la présence de `access_token`, `refresh_token`, `user_role`, etc.

2. **Vérification des requêtes réseau** :
   - Ouvrir les DevTools → Network
   - Vérifier la requête POST vers `/api/backend/auth/login`
   - Vérifier les headers `Authorization: Bearer <token>`

3. **Vérification de l'état** :
   - Utiliser React DevTools
   - Inspecter le contexte `AuthContext`
   - Vérifier les valeurs de `user`, `isAuthenticated`, `isLoading`

---

## Conclusion

Le processus de connexion est conçu avec une architecture sécurisée et robuste, utilisant des cookies httpOnly pour protéger les tokens contre les attaques XSS. Chaque étape est documentée et traceable, facilitant le débogage et la maintenance.

### Points Clés à Retenir

1. **Sécurité** : Tokens stockés dans des cookies httpOnly (non accessibles en JavaScript)
2. **Validation** : Validation à chaque étape (client, serveur, backend)
3. **Gestion d'erreurs** : Gestion complète des erreurs avec messages appropriés
4. **Rate Limiting** : Protection contre les attaques par force brute
5. **Refresh automatique** : Rafraîchissement automatique des tokens expirés
6. **Redirection** : Redirection automatique basée sur le rôle utilisateur

---

**Dernière mise à jour** : 2025
**Version** : 1.0

