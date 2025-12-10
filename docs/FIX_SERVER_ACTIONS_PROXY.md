# 🔧 Fix : Erreur Server Actions avec Nginx Reverse Proxy

## ❌ Erreur rencontrée

```
PM2 | ⨯ [Error: Invalid Server Actions request.] { digest: '3328534788' }
PM2 | `x-forwarded-host` header with value `10.100.40.144` does not match 
PM2 | `origin` header with value `10.100.40.144:8082` from a forwarded Server Actions request.
```

## 🔍 Cause

Next.js Server Actions vérifie que les headers `x-forwarded-host` et `origin` correspondent pour la sécurité. Quand l'application est derrière un reverse proxy (Nginx), ces headers peuvent ne pas correspondre si Nginx n'est pas configuré correctement.

## ✅ Solution 1 : Configurer Nginx (Recommandé)

### Modifier la configuration Nginx pour Next.js

Éditez votre fichier de configuration Nginx (ex: `/etc/nginx/sites-available/nextjs-app`) :

```nginx
server {
    listen 8082;
    server_name 10.100.40.144;

    # ✅ IMPORTANT : Configurer les headers proxy correctement
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # Headers pour Server Actions
        proxy_set_header Host $host:$server_port;  # ✅ Inclure le port
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host:$server_port;  # ✅ Inclure le port ici aussi
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

### Appliquer la configuration

```bash
# Vérifier la syntaxe
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

## ✅ Solution 2 : Variable d'environnement (Alternative)

Si vous ne pouvez pas modifier Nginx, vous pouvez désactiver la vérification stricte (⚠️ moins sécurisé) :

### Ajouter dans `.env.production`

```env
# Désactive la vérification stricte des headers pour Server Actions
# ⚠️ À utiliser uniquement si Nginx ne peut pas être configuré correctement
NEXT_PUBLIC_APP_URL=http://10.100.40.144:8082
```

### Ou créer un middleware Next.js

Créez `middleware.ts` à la racine du projet :

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Corriger le header x-forwarded-host si nécessaire
  const host = request.headers.get('host');
  const forwardedHost = request.headers.get('x-forwarded-host');
  
  if (host && forwardedHost && host !== forwardedHost) {
    // Créer une nouvelle réponse avec le header corrigé
    const response = NextResponse.next();
    response.headers.set('x-forwarded-host', host);
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## ✅ Solution 3 : Configuration Next.js (Dernier recours)

Si les solutions précédentes ne fonctionnent pas, vous pouvez configurer Next.js pour accepter les deux formats :

### Modifier `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  // ... votre config existante
  
  // Configuration pour Server Actions derrière un reverse proxy
  experimental: {
    proxyTimeout: 180000,
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  
  // ⚠️ Dernier recours : Désactiver la vérification stricte
  // À utiliser uniquement si les autres solutions ne fonctionnent pas
  // serverActions: {
  //   allowedOrigins: ['10.100.40.144:8082', '10.100.40.144'],
  // },
};
```

## 🔍 Vérification

### 1. Vérifier les headers envoyés par Nginx

```bash
# Tester depuis le serveur
curl -I http://10.100.40.144:8082

# Vérifier les headers dans les logs Nginx
sudo tail -f /var/log/nginx/access.log
```

### 2. Vérifier que l'application fonctionne

```bash
# Redémarrer l'application Next.js
cd /var/www/edan-app/transmission-edan-app
pm2 restart nextjs-app

# Voir les logs
pm2 logs nextjs-app --lines 50
```

### 3. Tester les Server Actions

Essayez d'utiliser une fonctionnalité qui utilise les Server Actions (comme la connexion) et vérifiez qu'il n'y a plus d'erreur dans les logs.

## 📝 Checklist

- [ ] Configuration Nginx mise à jour avec les bons headers
- [ ] Nginx rechargé (`sudo systemctl reload nginx`)
- [ ] Variable `NEXT_PUBLIC_APP_URL` définie dans `.env.production` (si nécessaire)
- [ ] Application Next.js redémarrée (`pm2 restart nextjs-app`)
- [ ] Logs vérifiés (plus d'erreur Server Actions)
- [ ] Test fonctionnel effectué (connexion, etc.)

## 🚨 Important

**La Solution 1 (configuration Nginx) est la plus sécurisée** car elle préserve la vérification de sécurité de Next.js tout en permettant le fonctionnement derrière un reverse proxy.

Les Solutions 2 et 3 désactivent partiellement la vérification de sécurité et ne devraient être utilisées qu'en dernier recours.

## 📞 Commandes utiles

```bash
# Vérifier la configuration Nginx
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx

# Voir les logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Redémarrer PM2
pm2 restart nextjs-app

# Voir les logs PM2
pm2 logs nextjs-app --lines 100
```

