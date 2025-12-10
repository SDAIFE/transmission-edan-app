# 🔍 Diagnostic : Erreur Server Components en Production

## ❌ Erreur rencontrée

```
An error occurred in the Server Components render. 
The specific message is omitted in production builds to avoid leaking sensitive details.
```

## 🔎 Causes possibles

### 1. Variables d'environnement manquantes ou incorrectes

**Symptômes :**
- L'application démarre mais les pages ne se chargent pas
- Erreurs dans les logs PM2 concernant `process.env`

**Solution :**

```bash
# Sur votre serveur Ubuntu
cd /var/www/edan-app/transmission-edan-app

# Vérifier que le fichier .env.production existe
ls -la .env.production

# Si le fichier n'existe pas, créez-le
nano .env.production
```

**Variables essentielles à vérifier :**

```env
# URL de l'API backend
NEXT_PUBLIC_API_URL=https://votre-api.com/api/v1

# Environnement
NODE_ENV=production

# Autres variables nécessaires selon votre app
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

**Vérification dans PM2 :**

```bash
# Vérifier les variables d'environnement de PM2
pm2 show nextjs-app | grep env

# Ou vérifier dans ecosystem.config.js
cat script/ecosystem.config.js
```

### 2. Erreurs dans les logs PM2

**Commandes de diagnostic :**

```bash
# Voir les logs en temps réel
pm2 logs nextjs-app --lines 100

# Voir uniquement les erreurs
pm2 logs nextjs-app --err --lines 100

# Voir les logs depuis les fichiers
tail -f /var/log/pm2/nextjs-app-error.log
tail -f /var/log/pm2/nextjs-app-out.log
```

**Rechercher les erreurs spécifiques :**

```bash
# Chercher les erreurs dans les logs
grep -i "error" /var/log/pm2/nextjs-app-error.log | tail -50
grep -i "failed" /var/log/pm2/nextjs-app-error.log | tail -50
```

### 3. Problème de build Next.js

**Vérifier que le build est à jour :**

```bash
cd /var/www/edan-app/transmission-edan-app

# Vérifier que le dossier .next existe
ls -la .next

# Si le build est ancien ou corrompu, reconstruire
npm run build

# Vérifier les erreurs de build
npm run build 2>&1 | tee build.log
```

### 4. Activer les logs détaillés temporairement

**Modifier `next.config.ts` temporairement pour voir l'erreur complète :**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // ... votre config existante
  
  // TEMPORAIRE : Activer les logs détaillés en production
  // ⚠️ À retirer après diagnostic
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Ou forcer le mode développement pour voir les erreurs
  // ⚠️ UNIQUEMENT POUR LE DIAGNOSTIC
  // reactStrictMode: false,
};
```

**OU créer un fichier `.env.local` temporaire :**

```bash
# Sur le serveur
cd /var/www/edan-app/transmission-edan-app

# Créer .env.local (sera ignoré par git)
echo "NODE_ENV=development" > .env.local

# Redémarrer PM2
pm2 restart nextjs-app

# Voir les erreurs détaillées dans les logs
pm2 logs nextjs-app --lines 200
```

**⚠️ IMPORTANT :** Retirer ces modifications après diagnostic pour la sécurité.

### 5. Vérifier les Server Components

**Problèmes courants :**

- Utilisation de hooks React dans un Server Component
- Accès à `window`, `document`, ou autres APIs browser
- Erreurs dans les `async` Server Components
- Problèmes de connexion à l'API

**Vérifier les fichiers de pages :**

```bash
# Chercher les Server Components qui pourraient avoir des problèmes
grep -r "async function" app/ --include="*.tsx" --include="*.ts"
grep -r "use client" app/ --include="*.tsx"
```

### 6. Problème de connexion à l'API backend

**Tester la connexion :**

```bash
# Depuis le serveur, tester si l'API répond
curl -I https://votre-api.com/api/v1/health

# Ou depuis l'application Next.js
curl http://localhost:3000/api/backend/health
```

**Vérifier la configuration Nginx :**

```bash
# Vérifier la config Nginx
sudo nginx -t

# Voir les logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 7. Problèmes de permissions

**Vérifier les permissions :**

```bash
# Vérifier les permissions du dossier
ls -la /var/www/edan-app/transmission-edan-app

# Donner les bonnes permissions si nécessaire
sudo chown -R $USER:$USER /var/www/edan-app/transmission-edan-app
chmod -R 755 /var/www/edan-app/transmission-edan-app
```

## 🔧 Solution rapide : Mode diagnostic

**Créer un script de diagnostic :**

```bash
#!/bin/bash
# diagnostic.sh

echo "=== Diagnostic Server Components ==="
echo ""

echo "1. Variables d'environnement :"
echo "NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
echo "NODE_ENV: $NODE_ENV"
echo ""

echo "2. Statut PM2 :"
pm2 status
echo ""

echo "3. Dernières erreurs PM2 :"
pm2 logs nextjs-app --err --lines 20 --nostream
echo ""

echo "4. Vérification du build :"
if [ -d ".next" ]; then
    echo "✅ Dossier .next existe"
    ls -la .next | head -5
else
    echo "❌ Dossier .next n'existe pas - Build nécessaire"
fi
echo ""

echo "5. Vérification des fichiers .env :"
ls -la .env* 2>/dev/null || echo "Aucun fichier .env trouvé"
echo ""

echo "6. Test de connexion API :"
if [ ! -z "$NEXT_PUBLIC_API_URL" ]; then
    curl -I "$NEXT_PUBLIC_API_URL" 2>&1 | head -3
else
    echo "⚠️ NEXT_PUBLIC_API_URL non défini"
fi
```

**Exécuter :**

```bash
chmod +x diagnostic.sh
./diagnostic.sh
```

## 📝 Checklist de diagnostic

- [ ] Variables d'environnement définies dans `.env.production`
- [ ] Variables d'environnement chargées par PM2
- [ ] Build Next.js à jour (`npm run build` réussi)
- [ ] Logs PM2 consultés (pas d'erreurs critiques)
- [ ] Logs Nginx consultés
- [ ] Connexion à l'API backend fonctionnelle
- [ ] Permissions des fichiers correctes
- [ ] Pas d'utilisation de hooks React dans Server Components
- [ ] Pas d'accès à des APIs browser dans Server Components

## 🚀 Solution : Forcer le rendu dynamique (si applicable)

Si certaines routes doivent être dynamiques, ajoutez dans vos fichiers `page.tsx` ou `route.ts` :

```typescript
// Pour les routes API
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Pour les pages
export const dynamic = 'force-dynamic';
```

## 📞 Commandes utiles

```bash
# Redémarrer l'application
pm2 restart nextjs-app

# Reconstruire et redémarrer
cd /var/www/edan-app/transmission-edan-app
npm run build
pm2 restart nextjs-app

# Voir les logs en temps réel
pm2 logs nextjs-app

# Vérifier le statut
pm2 status
pm2 info nextjs-app

# Tester l'application localement
curl http://localhost:3000
```

## ⚠️ Important

Après avoir identifié et corrigé le problème, **retirez toutes les modifications temporaires** (comme `NODE_ENV=development` dans `.env.local`) pour la sécurité en production.

