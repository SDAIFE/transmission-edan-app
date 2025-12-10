# 📚 Documentation Complète : Résolution des Problèmes de Déploiement

## 📋 Vue d'ensemble

Ce document décrit en détail tous les problèmes rencontrés lors du déploiement de l'application Next.js sur un serveur Ubuntu avec Nginx et PM2, ainsi que leurs solutions respectives.

**Environnement de déploiement :**
- Serveur : Ubuntu
- Reverse Proxy : Nginx (port 8082)
- Gestionnaire de processus : PM2
- Application : Next.js 15 avec Server Actions
- Protocole : HTTP (10.100.40.144:8082)

---

## 🔴 Problème 1 : Conflit avec package-lock.json lors du git pull

### ❌ Symptôme

```bash
root@CEIAW901040:/var/www/edan-app/transmission-edan-app# git pull

error: Vos modifications locales aux fichiers suivants seraient écrasées par la fusion :
        package-lock.json

Veuillez valider ou remiser vos modifications avant la fusion.
Abandon
```

### 🔍 Cause

- Un nouveau package a été installé en mode développement sur le serveur
- Le fichier `package-lock.json` local a été modifié
- Le fichier `package-lock.json` sur Git est la version correcte
- Git refuse de fusionner car cela écraserait les modifications locales

### ✅ Solution

**Étape 1 : Prendre la version distante du fichier**

```bash
cd /var/www/edan-app/transmission-edan-app
git checkout --theirs package-lock.json
```

**Étape 2 : Ajouter le fichier au staging**

```bash
git add package-lock.json
```

**Étape 3 : Finaliser la fusion**

```bash
git pull
```

**Alternative (si nécessaire) : Réinstaller les dépendances**

```bash
npm ci  # Installation propre basée sur package-lock.json
```

### 📝 Explication

La commande `git checkout --theirs` prend la version du fichier depuis la branche distante (origin/master), écrasant la version locale. C'est la solution recommandée quand on sait que la version distante est la bonne.

---

## 🔴 Problème 2 : Erreur Server Components en production

### ❌ Symptôme

```
An error occurred in the Server Components render. 
The specific message is omitted in production builds to avoid leaking sensitive details.
A digest property is included on this error instance which may provide additional details about the nature of the error.
```

### 🔍 Causes possibles

1. **Variables d'environnement manquantes**
   - `NEXT_PUBLIC_API_URL` non définie
   - Autres variables d'environnement requises absentes

2. **Build Next.js manquant ou corrompu**
   - Le dossier `.next` n'existe pas ou est obsolète
   - Erreurs lors du build

3. **Erreurs dans les Server Components**
   - Utilisation de hooks React dans un Server Component
   - Accès à des APIs browser (`window`, `document`)

4. **Problème de connexion à l'API backend**
   - L'API backend n'est pas accessible
   - Problème de configuration réseau

### ✅ Solution

**Étape 1 : Vérifier les variables d'environnement**

```bash
cd /var/www/edan-app/transmission-edan-app

# Vérifier que .env.production existe
ls -la .env.production

# Si absent, créer le fichier
nano .env.production
```

**Contenu minimal de `.env.production` :**

```env
# URL de l'API backend
NEXT_PUBLIC_API_URL=http://10.100.40.144:8081

# Environnement
NODE_ENV=production

# URL de l'application (optionnel mais recommandé)
NEXT_PUBLIC_APP_URL=http://10.100.40.144:8082
```

**Étape 2 : Vérifier les logs PM2**

```bash
# Voir les logs en temps réel
pm2 logs nextjs-app --lines 100

# Voir uniquement les erreurs
pm2 logs nextjs-app --err --lines 100

# Chercher les erreurs spécifiques
grep -i "error" /var/log/pm2/nextjs-app-error.log | tail -50
```

**Étape 3 : Reconstruire l'application**

```bash
cd /var/www/edan-app/transmission-edan-app

# Vérifier que le build est à jour
ls -la .next

# Si absent ou ancien, reconstruire
npm run build

# Vérifier les erreurs de build
npm run build 2>&1 | tee build.log
```

**Étape 4 : Redémarrer PM2**

```bash
pm2 restart nextjs-app
pm2 logs nextjs-app --lines 50
```

### 📝 Explication

Les erreurs Server Components en production sont souvent dues à :
- Des variables d'environnement manquantes (Next.js ne peut pas accéder aux données nécessaires)
- Un build obsolète (le code compilé ne correspond pas au code source)
- Des erreurs dans le code qui ne se manifestent qu'en production

La solution consiste à s'assurer que toutes les dépendances sont correctement configurées et que le build est à jour.

---

## 🔴 Problème 3 : Erreur Server Actions avec headers proxy

### ❌ Symptôme

```
PM2 | ⨯ [Error: Invalid Server Actions request.] { digest: '3328534788' }
PM2 | `x-forwarded-host` header with value `10.100.40.144` does not match 
PM2 | `origin` header with value `10.100.40.144:8082` from a forwarded Server Actions request.
```

### 🔍 Cause

**Problème de configuration des headers proxy dans Nginx :**

- Next.js Server Actions vérifie que les headers `x-forwarded-host` et `origin` correspondent pour la sécurité
- Nginx envoie `x-forwarded-host: 10.100.40.144` (sans le port)
- L'application Next.js reçoit `origin: 10.100.40.144:8082` (avec le port)
- La différence entre les deux headers fait échouer la vérification de sécurité

**Pourquoi c'est important :**
- Les Server Actions sont des fonctions serveur appelées depuis le client
- Next.js vérifie l'origine pour prévenir les attaques CSRF
- Si les headers ne correspondent pas, Next.js rejette la requête par sécurité

### ✅ Solution

**Étape 1 : Modifier la configuration Nginx**

Éditer le fichier de configuration Nginx (ex: `/etc/nginx/sites-available/nextjs-app`) :

```nginx
server {
    listen 8082;
    server_name 10.100.40.144;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # ✅ CRITIQUE : Headers pour Server Actions
        # Le header Host doit inclure le port pour correspondre à l'origin
        proxy_set_header Host $host:$server_port;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host:$server_port;  # ✅ Inclure le port
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Headers pour WebSocket (si utilisé)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Points clés :**
- `proxy_set_header Host $host:$server_port;` - Inclut le port dans le header Host
- `proxy_set_header X-Forwarded-Host $host:$server_port;` - Inclut le port dans X-Forwarded-Host

**Étape 2 : Vérifier la syntaxe Nginx**

```bash
sudo nginx -t
```

**Étape 3 : Recharger Nginx**

```bash
sudo systemctl reload nginx
```

**Étape 4 : Redémarrer l'application Next.js**

```bash
cd /var/www/edan-app/transmission-edan-app
pm2 restart nextjs-app
pm2 logs nextjs-app --lines 50
```

### 📝 Explication

**Pourquoi le port est important :**

1. **Sécurité Next.js :** Next.js vérifie que la requête vient bien du même domaine que l'application
2. **Headers proxy :** Quand une requête passe par un reverse proxy, les headers originaux sont modifiés
3. **Correspondance :** Pour que la vérification fonctionne, `x-forwarded-host` et `origin` doivent correspondre exactement

**Sans le port :**
- `x-forwarded-host: 10.100.40.144`
- `origin: 10.100.40.144:8082`
- ❌ Ne correspondent pas → Erreur

**Avec le port :**
- `x-forwarded-host: 10.100.40.144:8082`
- `origin: 10.100.40.144:8082`
- ✅ Correspondent → Succès

---

## 🔴 Problème 4 : Redirection après connexion ne fonctionne pas

### ❌ Symptôme

- La connexion réussit (le frontend communique bien avec le backend)
- L'utilisateur reste sur la page de login
- Pas de redirection vers `/dashboard`
- Dans la console réseau, on voit `"$Sreact.fragment"` dans la réponse

### 🔍 Causes possibles

1. **Cookies non définis correctement**
   - Les cookies avec `secure: true` ne sont pas définis si l'application n'est pas en HTTPS
   - Les cookies ne sont pas accessibles après la connexion

2. **Redirection `router.push()` ne fonctionne pas**
   - `router.push()` est appelé mais la page ne change pas
   - Problème de timing ou de contexte React

3. **Middleware bloque la redirection**
   - Le middleware intercepte la requête avant que les cookies ne soient lus
   - Les cookies ne sont pas encore disponibles au moment de la vérification

4. **Problème de timing**
   - La redirection se fait avant que les cookies ne soient définis
   - Le délai de 100ms n'est pas suffisant

### ✅ Solution

**Solution 1 : Configuration adaptative des cookies**

Modifier `actions/auth.action.ts` pour détecter automatiquement le protocole :

```typescript
// ✅ Détection automatique du protocole (HTTPS ou HTTP)
const isSecure =
  process.env.NODE_ENV === "production"
    ? (process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false)
    : false;

// ✅ Détermination de sameSite selon le protocole
const sameSiteValue: "strict" | "lax" = isSecure ? "strict" : "lax";

// ✅ Configuration sécurisée pour les TOKENS (httpOnly)
const secureCookieConfig = {
  httpOnly: true,
  secure: isSecure, // ✅ false pour HTTP, true pour HTTPS
  sameSite: sameSiteValue, // ✅ "lax" pour HTTP, "strict" pour HTTPS
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
```

**Explication :**
- En HTTP : `secure: false` permet aux cookies d'être définis
- En HTTPS : `secure: true` pour la sécurité maximale
- `sameSite: "lax"` pour HTTP permet la redirection après connexion

**Solution 2 : Redirection avec fallback**

Modifier `contexts/AuthContext.tsx` pour ajouter un fallback :

```typescript
// Délai court pour éviter les conflits de redirection et laisser les cookies se définir
setTimeout(() => {
  try {
    router.push(redirectPath);
    
    // ✅ CORRECTION PRODUCTION : Vérifier après 500ms si la redirection a fonctionné
    // Si on est toujours sur /auth/login, forcer la redirection avec window.location
    setTimeout(() => {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath.startsWith("/auth/login") || currentPath === "/auth/login") {
          // Redirection forcée avec window.location.href
          window.location.href = redirectPath;
        }
      }
    }, 500);
  } catch (redirectError) {
    // En cas d'erreur avec router.push(), utiliser window.location.href
    if (typeof window !== "undefined") {
      window.location.href = redirectPath;
    }
  }
}, 200); // Augmenté à 200ms pour laisser plus de temps aux cookies
```

**Explication :**
1. **Premier essai :** `router.push()` pour une navigation fluide
2. **Vérification :** Après 500ms, vérifier si on est toujours sur `/auth/login`
3. **Fallback :** Si oui, forcer avec `window.location.href` (rechargement complet)
4. **Délai augmenté :** 200ms au lieu de 100ms pour laisser le temps aux cookies

**Solution 3 : Vérifier la variable d'environnement**

S'assurer que `.env.production` contient :

```env
NEXT_PUBLIC_APP_URL=http://10.100.40.144:8082
```

### 📝 Explication

**Pourquoi les cookies ne fonctionnaient pas :**

1. **`secure: true` en HTTP :** Les cookies avec `secure: true` ne sont jamais définis en HTTP
2. **Cookies non définis :** Sans cookies, le middleware ne détecte pas l'authentification
3. **Pas de redirection :** Sans authentification détectée, pas de redirection vers le dashboard

**Pourquoi `router.push()` peut échouer :**

1. **Timing :** Les cookies ne sont pas encore disponibles
2. **Contexte React :** Le contexte d'authentification n'est pas encore mis à jour
3. **Middleware :** Le middleware intercepte avant que l'état ne soit synchronisé

**Solution combinée :**

1. **Cookies adaptatifs :** Fonctionnent en HTTP et HTTPS
2. **Redirection robuste :** Fallback avec `window.location.href` si nécessaire
3. **Délai suffisant :** 200ms pour les cookies + 500ms pour la vérification

---

## 🔴 Problème 5 : Configuration des cookies pour HTTP/HTTPS

### ❌ Symptôme

- Les cookies ne sont pas définis après la connexion
- Vérification dans DevTools (F12 > Application > Cookies) : aucun cookie présent
- L'authentification ne persiste pas

### 🔍 Cause

**Configuration statique des cookies :**

Le code original avait :
```typescript
const secureCookieConfig = {
  httpOnly: true,
  secure: true, // ❌ Toujours true, ne fonctionne pas en HTTP
  sameSite: "strict" as const, // ❌ Trop strict pour HTTP
  // ...
};
```

**Problèmes :**
- `secure: true` empêche les cookies d'être définis en HTTP
- `sameSite: "strict"` peut bloquer les redirections après connexion en HTTP
- Pas de détection automatique du protocole

### ✅ Solution

**Configuration adaptative implémentée :**

```typescript
// ✅ Détection automatique du protocole
const isSecure =
  process.env.NODE_ENV === "production"
    ? (process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false)
    : false;

// ✅ Détermination de sameSite selon le protocole
const sameSiteValue: "strict" | "lax" = isSecure ? "strict" : "lax";

// ✅ Configuration adaptative
const secureCookieConfig = {
  httpOnly: true,
  secure: isSecure, // ✅ Adaptatif
  sameSite: sameSiteValue, // ✅ Adaptatif
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
```

**Logique de détection :**

1. **En développement :** Toujours `secure: false` (HTTP local)
2. **En production :**
   - Si `NEXT_PUBLIC_APP_URL` commence par `https://` → `secure: true`, `sameSite: "strict"`
   - Sinon → `secure: false`, `sameSite: "lax"`

### 📝 Explication

**Pourquoi `secure: true` ne fonctionne pas en HTTP :**

- Les cookies avec `secure: true` ne sont envoyés que sur des connexions HTTPS
- En HTTP, le navigateur refuse de définir ces cookies
- Résultat : Aucun cookie n'est créé, l'authentification ne fonctionne pas

**Pourquoi `sameSite: "lax"` pour HTTP :**

- `sameSite: "strict"` bloque les requêtes cross-site, même les redirections après connexion
- `sameSite: "lax"` permet les redirections tout en protégeant contre CSRF
- En HTTP, `lax` est un bon compromis entre sécurité et fonctionnalité

**Avantages de la solution adaptative :**

1. ✅ Fonctionne en HTTP (développement/test)
2. ✅ Sécurisé en HTTPS (production)
3. ✅ Détection automatique (pas de configuration manuelle)
4. ✅ Compatible avec les deux protocoles

---

## 📊 Résumé des Solutions

### Checklist de déploiement

- [ ] **Git :** Résoudre les conflits de `package-lock.json` avec `git checkout --theirs`
- [ ] **Variables d'environnement :** Créer `.env.production` avec `NEXT_PUBLIC_API_URL` et `NEXT_PUBLIC_APP_URL`
- [ ] **Build :** Reconstruire l'application avec `npm run build`
- [ ] **Nginx :** Configurer les headers proxy avec le port (`$host:$server_port`)
- [ ] **Cookies :** Vérifier que la configuration est adaptative (HTTP/HTTPS)
- [ ] **Redirection :** Vérifier que le fallback `window.location.href` est activé
- [ ] **PM2 :** Redémarrer l'application et vérifier les logs

### Commandes essentielles

```bash
# 1. Résoudre les conflits Git
git checkout --theirs package-lock.json
git add package-lock.json
git pull

# 2. Configurer les variables d'environnement
nano .env.production
# Ajouter NEXT_PUBLIC_API_URL et NEXT_PUBLIC_APP_URL

# 3. Reconstruire l'application
npm run build

# 4. Vérifier la configuration Nginx
sudo nginx -t
sudo systemctl reload nginx

# 5. Redémarrer PM2
pm2 restart nextjs-app

# 6. Vérifier les logs
pm2 logs nextjs-app --lines 100
```

### Fichiers modifiés

1. **`actions/auth.action.ts`**
   - Détection automatique du protocole (HTTP/HTTPS)
   - Configuration adaptative des cookies

2. **`contexts/AuthContext.tsx`**
   - Redirection avec fallback `window.location.href`
   - Délai augmenté pour laisser le temps aux cookies

3. **`next.config.ts`**
   - Configuration pour Server Actions derrière un reverse proxy

4. **Configuration Nginx**
   - Headers proxy avec le port inclus

---

## 🔍 Diagnostic et Dépannage

### Vérifier que tout fonctionne

**1. Vérifier les cookies dans le navigateur :**

1. Ouvrir DevTools (F12)
2. Aller dans **Application** (Chrome) ou **Storage** (Firefox)
3. Cliquer sur **Cookies** > votre domaine
4. Après connexion, vérifier la présence de :
   - `access_token`
   - `refresh_token`
   - `user_role`
   - `user_status`

**2. Vérifier les logs PM2 :**

```bash
pm2 logs nextjs-app --lines 100 | grep -i "error\|warn"
```

**3. Tester la connexion :**

1. Se connecter avec des identifiants valides
2. Vérifier la redirection vers `/dashboard`
3. Vérifier que l'utilisateur est bien authentifié

**4. Vérifier la configuration Nginx :**

```bash
# Vérifier la syntaxe
sudo nginx -t

# Voir les logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Problèmes courants et solutions

**Problème : Les cookies ne sont toujours pas définis**

- ✅ Vérifier que `.env.production` contient `NEXT_PUBLIC_APP_URL`
- ✅ Vérifier que l'application n'est pas en HTTPS (si HTTP est utilisé)
- ✅ Vérifier les logs PM2 pour des erreurs

**Problème : La redirection ne fonctionne toujours pas**

- ✅ Vérifier que les cookies sont bien définis (voir ci-dessus)
- ✅ Vérifier la console du navigateur pour des erreurs JavaScript
- ✅ Tester manuellement : `window.location.href = '/dashboard'` dans la console

**Problème : Erreurs Server Actions persistent**

- ✅ Vérifier la configuration Nginx (headers avec port)
- ✅ Vérifier que Nginx a été rechargé : `sudo systemctl reload nginx`
- ✅ Vérifier les logs PM2 pour des erreurs spécifiques

---

## 📚 Références

### Documentation créée

1. **`docs/DIAGNOSTIC_ERREUR_SERVER_COMPONENTS.md`**
   - Guide de diagnostic pour les erreurs Server Components

2. **`docs/FIX_SERVER_ACTIONS_PROXY.md`**
   - Solution détaillée pour les erreurs Server Actions avec proxy

3. **`docs/FIX_REDIRECTION_APRES_CONNEXION.md`**
   - Guide pour résoudre les problèmes de redirection

4. **`docs/NGINX_CONFIG_NEXTJS_EXAMPLE.conf`**
   - Exemple de configuration Nginx complète

### Commandes utiles

```bash
# PM2
pm2 status
pm2 logs nextjs-app
pm2 restart nextjs-app
pm2 info nextjs-app

# Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx

# Git
git status
git pull
git checkout --theirs <fichier>

# Build
npm run build
npm ci
```

---

## ✅ Conclusion

Tous les problèmes de déploiement ont été résolus en :

1. **Résolvant les conflits Git** avec la bonne version de `package-lock.json`
2. **Configurant correctement Nginx** pour les headers proxy avec le port
3. **Adaptant la configuration des cookies** pour fonctionner en HTTP et HTTPS
4. **Ajoutant un fallback de redirection** pour garantir la navigation après connexion
5. **Vérifiant toutes les variables d'environnement** nécessaires

L'application est maintenant fonctionnelle en production avec :
- ✅ Connexion utilisateur opérationnelle
- ✅ Redirection automatique vers le dashboard
- ✅ Cookies correctement définis et persistants
- ✅ Server Actions fonctionnelles derrière le reverse proxy
- ✅ Configuration adaptative pour HTTP/HTTPS

---

**Date de création :** 2025  
**Dernière mise à jour :** 2025  
**Version :** 1.0

