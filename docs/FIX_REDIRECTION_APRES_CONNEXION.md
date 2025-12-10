# 🔧 Fix : Redirection après connexion ne fonctionne pas en production

## ❌ Problème

Après une connexion réussie, l'application ne redirige pas vers le dashboard. Le frontend communique bien avec le backend, mais la redirection ne se fait pas.

## 🔍 Causes possibles

### 1. Cookies non définis correctement

**Symptôme :** Les cookies avec `secure: true` ne sont pas définis si l'application n'est pas en HTTPS.

**Vérification :**

```bash
# Dans la console du navigateur (F12 > Application > Cookies)
# Vérifier que les cookies suivants existent :
# - access_token
# - refresh_token
# - user_role
# - user_status
```

**Solution :**

Si l'application n'est pas en HTTPS, modifier `actions/auth.action.ts` :

```typescript
// ⚠️ TEMPORAIRE : Pour HTTP en développement/test
const secureCookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' ? true : false, // false si HTTP
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
```

### 2. Redirection `router.push()` ne fonctionne pas

**Symptôme :** `router.push()` est appelé mais la page ne change pas.

**Solution :** 
La correction a été appliquée dans `contexts/AuthContext.tsx` avec un fallback `window.location.href`.

### 3. Middleware bloque la redirection

**Symptôme :** Le middleware intercepte la requête avant que les cookies ne soient lus.

**Vérification :**

Vérifier que le middleware lit bien les cookies après la connexion :

```typescript
// middleware.ts
const cookieStore = await cookies();
const accessToken = cookieStore.get('access_token')?.value;
const userRole = cookieStore.get('user_role')?.value;
```

### 4. Problème de timing

**Symptôme :** La redirection se fait avant que les cookies ne soient définis.

**Solution :**
Le délai a été augmenté à 200ms dans la correction.

## ✅ Corrections appliquées

### 1. Redirection avec fallback

Dans `contexts/AuthContext.tsx`, la fonction `login()` a été modifiée pour :

1. Essayer `router.push()` d'abord
2. Vérifier après 500ms si la redirection a fonctionné
3. Si toujours sur `/auth/login`, forcer avec `window.location.href`
4. En cas d'erreur, utiliser directement `window.location.href`

### 2. Délai augmenté

Le délai avant redirection a été augmenté de 100ms à 200ms pour laisser plus de temps aux cookies.

## 🔧 Solutions supplémentaires

### Solution 1 : Vérifier la configuration des cookies

**Sur le serveur Ubuntu :**

```bash
# Vérifier si l'application est en HTTPS ou HTTP
cd /var/www/edan-app/transmission-edan-app

# Vérifier la configuration Nginx
sudo cat /etc/nginx/sites-available/votre-config | grep -i ssl
```

**Si HTTP (pas HTTPS) :**

Modifier `actions/auth.action.ts` temporairement :

```typescript
const secureCookieConfig = {
  httpOnly: true,
  secure: false, // ⚠️ false pour HTTP (à changer en true pour HTTPS)
  sameSite: "lax" as const, // "lax" au lieu de "strict" pour HTTP
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
```

### Solution 2 : Forcer la redirection côté serveur

Modifier le middleware pour rediriger automatiquement après connexion :

```typescript
// middleware.ts
export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  
  // ... code existant ...
  
  // ✅ NOUVEAU : Redirection automatique après connexion
  // Si on vient de /api/auth/login et qu'on est connecté, rediriger vers dashboard
  const referer = request.headers.get('referer');
  if (referer?.includes('/auth/login') && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }
  
  // ... reste du code ...
}
```

### Solution 3 : Utiliser `window.location.href` directement

Si les solutions précédentes ne fonctionnent pas, modifier `contexts/AuthContext.tsx` pour utiliser directement `window.location.href` :

```typescript
// Dans la fonction login(), remplacer :
setTimeout(() => {
  router.push(redirectPath);
}, 100);

// Par :
setTimeout(() => {
  if (typeof window !== "undefined") {
    window.location.href = redirectPath;
  }
}, 200);
```

## 🔍 Diagnostic

### 1. Vérifier les cookies dans le navigateur

1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet **Application** (Chrome) ou **Storage** (Firefox)
3. Cliquer sur **Cookies** > votre domaine
4. Vérifier que les cookies suivants existent après connexion :
   - `access_token`
   - `refresh_token`
   - `user_role`
   - `user_status`

### 2. Vérifier les logs PM2

```bash
# Sur le serveur
pm2 logs nextjs-app --lines 100 | grep -i "redirect\|login\|auth"
```

### 3. Vérifier la console du navigateur

Ouvrir la console (F12 > Console) et vérifier s'il y a des erreurs JavaScript.

### 4. Tester la redirection manuellement

Après connexion, dans la console du navigateur :

```javascript
// Tester si router.push fonctionne
window.location.href = '/dashboard';
```

## 📝 Checklist de vérification

- [ ] Les cookies sont bien définis après connexion (vérifier dans DevTools)
- [ ] La configuration `secure` des cookies correspond au protocole (HTTP/HTTPS)
- [ ] Le délai de redirection est suffisant (200ms minimum)
- [ ] Le fallback `window.location.href` est activé
- [ ] Le middleware ne bloque pas la redirection
- [ ] Pas d'erreurs JavaScript dans la console
- [ ] Les logs PM2 ne montrent pas d'erreurs

## 🚀 Commandes utiles

```bash
# Redémarrer l'application
cd /var/www/edan-app/transmission-edan-app
pm2 restart nextjs-app

# Voir les logs en temps réel
pm2 logs nextjs-app --lines 50

# Reconstruire l'application
npm run build
pm2 restart nextjs-app
```

## ⚠️ Important

**Pour la production avec HTTPS :**
- `secure: true` dans la configuration des cookies
- `sameSite: "strict"` pour la sécurité maximale

**Pour le développement/test avec HTTP :**
- `secure: false` dans la configuration des cookies
- `sameSite: "lax"` pour permettre la redirection

## 📞 Prochaines étapes

1. Vérifier les cookies dans le navigateur après connexion
2. Si les cookies ne sont pas définis, ajuster la configuration `secure`
3. Tester la redirection manuelle avec `window.location.href`
4. Vérifier les logs PM2 pour d'éventuelles erreurs

