# 🚀 Guide de Déploiement - Ubuntu avec Nginx et PM2

Ce guide vous accompagne pour déployer vos applications **NestJS** et **Next.js** sur un serveur Ubuntu avec **Nginx** comme reverse proxy et **PM2** pour la gestion des processus.

## 📋 Prérequis

- Serveur Ubuntu (20.04 LTS ou supérieur)
- Accès root ou utilisateur avec privilèges sudo
- Nom de domaine ou IP publique du serveur
- Applications prêtes à être déployées (buildées)

---

## 🔧 Étape 1 : Préparation du serveur

### 1.1 Mise à jour du système

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Installation des dépendances de base

```bash
# Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérification
node --version
npm --version

# Installation de build-essential pour compiler les modules natifs
sudo apt install -y build-essential

# Installation de Git
sudo apt install -y git
```

### 1.3 Installation de Nginx

```bash
sudo apt install -y nginx

# Démarrage et activation au boot
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérification du statut
sudo systemctl status nginx
```

### 1.4 Installation de PM2

```bash
sudo npm install -g pm2

# Configuration de PM2 pour démarrer au boot
pm2 startup systemd
# Suivez les instructions affichées (copiez-collez la commande suggérée)
```

---

## 🔐 Étape 2 : Configuration GitHub

### 2.1 Configuration Git sur le serveur

```bash
# Configuration de Git (remplacez par vos informations)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# Vérification
git config --list
```

### 2.2 Génération d'une clé SSH

```bash
# Générer une nouvelle clé SSH (si vous n'en avez pas déjà)
ssh-keygen -t ed25519 -C "votre.email@example.com"

# Ou utiliser RSA si ed25519 n'est pas supporté
# ssh-keygen -t rsa -b 4096 -C "votre.email@example.com"

# Appuyez sur Entrée pour accepter l'emplacement par défaut
# Entrez un mot de passe fort (ou laissez vide pour aucune passphrase)
```

### 2.3 Ajout de la clé SSH à l'agent SSH

```bash
# Démarrer l'agent SSH
eval "$(ssh-agent -s)"

# Ajouter la clé SSH à l'agent
ssh-add ~/.ssh/id_ed25519
# OU si vous avez utilisé RSA
# ssh-add ~/.ssh/id_rsa
```

### 2.4 Ajout de la clé publique à GitHub

```bash
# Afficher la clé publique
cat ~/.ssh/id_ed25519.pub
# OU
# cat ~/.ssh/id_rsa.pub

# Copiez tout le contenu affiché
```

**Sur GitHub :**

1. Allez sur **GitHub.com** → **Settings** → **SSH and GPG keys**
2. Cliquez sur **New SSH key**
3. Donnez un titre (ex: "Serveur Ubuntu Production")
4. Collez la clé publique copiée
5. Cliquez sur **Add SSH key**

### 2.5 Test de la connexion SSH à GitHub

```bash
# Tester la connexion
ssh -T git@github.com

# Vous devriez voir un message comme :
# Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

### 2.6 Configuration alternative : Token d'accès personnel (HTTPS)

Si vous préférez utiliser HTTPS au lieu de SSH :

```bash
# Créer un token d'accès personnel sur GitHub :
# GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
# Générer un token avec les permissions : repo (toutes)

# Cloner avec le token
git clone https://github.com/votre-username/votre-repo.git

# Ou configurer Git Credential Helper pour éviter de saisir le token à chaque fois
git config --global credential.helper store
```

### 2.7 Clonage des repositories

Une fois l'authentification configurée, vous pouvez cloner vos repositories :

```bash
# Créer la structure des répertoires
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

# Cloner l'API NestJS
cd /var/www
git clone git@github.com:votre-username/nestjs-api.git nestjs-api
# OU avec HTTPS
# git clone https://github.com/votre-username/nestjs-api.git nestjs-api

# Cloner l'application Next.js
git clone git@github.com:votre-username/nextjs-app.git nextjs-app
# OU avec HTTPS
# git clone https://github.com/votre-username/nextjs-app.git nextjs-app

# Vérifier les repositories clonés
ls -la /var/www/
```

### 2.8 Configuration des branches et remotes

```bash
# Pour chaque repository, vérifier la branche
cd /var/www/nestjs-api
git branch -a
git checkout main  # ou master, ou votre branche de production

# Vérifier les remotes
git remote -v

# Pour l'application Next.js
cd /var/www/nextjs-app
git branch -a
git checkout main
git remote -v
```

### 2.9 Configuration Git pour les déploiements automatiques (Optionnel)

Si vous souhaitez configurer des déploiements automatiques via webhooks :

```bash
# Créer un utilisateur dédié pour les déploiements (recommandé)
sudo adduser deploy
sudo usermod -aG sudo deploy

# Se connecter en tant que deploy
su - deploy

# Configurer Git pour cet utilisateur
git config --global user.name "Deploy Bot"
git config --global user.email "deploy@votre-domaine.com"

# Générer une clé SSH pour deploy
ssh-keygen -t ed25519 -C "deploy@votre-domaine.com"
# Ajouter cette clé à GitHub également
```

---

## 📦 Étape 3 : Préparation des applications

### 3.1 Structure des répertoires recommandée

```bash
# Si vous n'avez pas encore créé les répertoires (déjà fait si vous avez cloné)
# sudo mkdir -p /var/www
# sudo chown -R $USER:$USER /var/www

# Vérifier que les répertoires existent
ls -la /var/www/
```

```bash
# Création de la structure
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

# Création des dossiers pour chaque application
mkdir -p /var/www/nestjs-api
mkdir -p /var/www/nextjs-app
```

### 3.2 Déploiement de l'application NestJS

```bash
cd /var/www/nestjs-api

# Si vous n'avez pas encore cloné (voir Étape 2)
# git clone git@github.com:votre-username/nestjs-api.git .

# Vérifier que vous êtes sur la bonne branche
git checkout main  # ou votre branche de production
git pull origin main

# Installation des dépendances
npm install --production

# Build de l'application
npm run build

# Génération du client Prisma
npm run prisma:generate
```

### 3.3 Déploiement de l'application Next.js

```bash
cd /var/www/nextjs-app

# Si vous n'avez pas encore cloné (voir Étape 2)
# git clone git@github.com:votre-username/nextjs-app.git .

# Vérifier que vous êtes sur la bonne branche
git checkout main  # ou votre branche de production
git pull origin main

# Installation des dépendances
npm install --production

# Build de l'application Next.js
npm run build
```

---

## ⚙️ Étape 4 : Configuration des variables d'environnement

### 4.1 Configuration NestJS

Créez le fichier `.env` dans `/var/www/nestjs-api/.env` :

```env
# Configuration de la base de données SQL Server
DATABASE_URL="sqlserver://username:password@server:1433;database=nom_bd;encrypt=true;trustServerCertificate=true"

# Configuration JWT
JWT_SECRET="votre_secret_jwt_tres_securise_en_production"
JWT_EXPIRES_IN="24h"

# Configuration de l'application
PORT=3001
NODE_ENV=production

# Configuration CORS (remplacez par votre domaine)
CORS_ORIGIN="https://votre-domaine.com"
```

### 4.2 Configuration Next.js

Créez le fichier `.env.production` dans `/var/www/nextjs-app/.env.production` :

```env
# URL de l'API NestJS
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
# OU si même domaine avec sous-chemin
# NEXT_PUBLIC_API_URL=https://votre-domaine.com/api

# Autres variables d'environnement Next.js
NODE_ENV=production
PORT=3000
```

---

## 🔄 Étape 5 : Configuration PM2

### 5.1 Création du fichier ecosystem.config.js

Créez le fichier `ecosystem.config.js` à la racine de chaque projet ou un fichier global dans `/var/www/ecosystem.config.js` :

```javascript
module.exports = {
  apps: [
    // Application NestJS
    {
      name: 'nestjs-api',
      script: './dist/main.js',
      cwd: '/var/www/nestjs-api',
      instances: 2, // Nombre d'instances (ou 'max' pour utiliser tous les CPU)
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/log/pm2/nestjs-api-error.log',
      out_file: '/var/log/pm2/nestjs-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
    },
    // Application Next.js
    {
      name: 'nextjs-app',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/nextjs-app',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/nextjs-app-error.log',
      out_file: '/var/log/pm2/nextjs-app-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
    },
  ],
};
```

### 5.2 Création du répertoire de logs

```bash
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

### 5.3 Démarrage des applications avec PM2

```bash
# Si le fichier ecosystem.config.js est global
pm2 start /var/www/ecosystem.config.js

# OU si le fichier est dans chaque projet
cd /var/www/nestjs-api
pm2 start ecosystem.config.js --only nestjs-api

cd /var/www/nextjs-app
pm2 start ecosystem.config.js --only nextjs-app

# Sauvegarder la configuration PM2
pm2 save

# Vérifier le statut
pm2 status
pm2 logs
```

### 5.4 Commandes PM2 utiles

```bash
# Voir le statut
pm2 status

# Voir les logs
pm2 logs
pm2 logs nestjs-api
pm2 logs nextjs-app

# Redémarrer une application
pm2 restart nestjs-api
pm2 restart nextjs-app

# Arrêter une application
pm2 stop nestjs-api

# Supprimer une application
pm2 delete nestjs-api

# Recharger sans downtime (pour Next.js)
pm2 reload nextjs-app

# Monitorer les ressources
pm2 monit
```

---

## 🌐 Étape 6 : Configuration Nginx

### 6.1 Configuration pour NestJS (API)

Créez le fichier `/etc/nginx/sites-available/nestjs-api` :

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;  # Remplacez par votre domaine ou IP

    # Redirection HTTP vers HTTPS (optionnel, si vous avez SSL)
    # return 301 https://$server_name$request_uri;

    # Logs
    access_log /var/log/nginx/nestjs-api-access.log;
    error_log /var/log/nginx/nestjs-api-error.log;

    # Taille maximale des uploads
    client_max_body_size 10M;

    # Proxy vers l'application NestJS
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Configuration spécifique pour Swagger (si nécessaire)
    location /api/docs {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.2 Configuration pour Next.js (Frontend)

Créez le fichier `/etc/nginx/sites-available/nextjs-app` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;  # Remplacez par votre domaine ou IP

    # Redirection HTTP vers HTTPS (optionnel, si vous avez SSL)
    # return 301 https://$server_name$request_uri;

    # Logs
    access_log /var/log/nginx/nextjs-app-access.log;
    error_log /var/log/nginx/nextjs-app-error.log;

    # Taille maximale des uploads
    client_max_body_size 10M;

    # Proxy vers l'application Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Proxy des requêtes API vers NestJS (si même domaine)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache des assets statiques
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.3 Configuration alternative : Un seul domaine avec sous-chemins

Si vous préférez utiliser un seul domaine avec des sous-chemins :

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    access_log /var/log/nginx/app-access.log;
    error_log /var/log/nginx/app-error.log;

    client_max_body_size 10M;

    # API NestJS sur /api
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend Next.js sur /
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.4 Activation des configurations Nginx

```bash
# Créer les liens symboliques
sudo ln -s /etc/nginx/sites-available/nestjs-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/nextjs-app /etc/nginx/sites-enabled/

# Supprimer la configuration par défaut (optionnel)
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 🔒 Étape 7 : Configuration SSL avec Let's Encrypt (Optionnel mais recommandé)

### 7.1 Installation de Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtention des certificats SSL

```bash
# Pour l'API
sudo certbot --nginx -d api.votre-domaine.com

# Pour le frontend
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

### 7.3 Renouvellement automatique

Certbot configure automatiquement le renouvellement. Vous pouvez tester avec :

```bash
sudo certbot renew --dry-run
```

---

## 🔥 Étape 8 : Configuration du pare-feu

```bash
# Installation d'UFW (si pas déjà installé)
sudo apt install -y ufw

# Autoriser SSH (IMPORTANT avant d'activer le pare-feu)
sudo ufw allow 22/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le pare-feu
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

---

## ✅ Étape 9 : Vérification et tests

### 9.1 Vérification des services

```bash
# Vérifier PM2
pm2 status
pm2 logs --lines 50

# Vérifier Nginx
sudo systemctl status nginx
sudo nginx -t

# Vérifier les ports
sudo netstat -tlnp | grep -E '3000|3001|80|443'
# OU avec ss
sudo ss -tlnp | grep -E '3000|3001|80|443'
```

### 9.2 Tests de connectivité

```bash
# Test local de l'API NestJS
curl http://localhost:3001/api/v1

# Test local de Next.js
curl http://localhost:3000

# Test via Nginx (remplacez par votre domaine/IP)
curl http://votre-domaine.com
curl http://api.votre-domaine.com/api/v1
```

---

## 🔄 Étape 10 : Mise à jour des applications

### 10.1 Script de déploiement

Créez un script `deploy.sh` dans chaque projet :

```bash
#!/bin/bash
# deploy.sh pour NestJS

cd /var/www/nestjs-api

# Récupérer les dernières modifications
git pull origin main  # ou votre branche

# Installer les dépendances
npm install --production

# Build
npm run build

# Générer Prisma
npm run prisma:generate

# Redémarrer avec PM2
pm2 restart nestjs-api

echo "✅ Déploiement terminé"
```

```bash
#!/bin/bash
# deploy.sh pour Next.js

cd /var/www/nextjs-app

# Récupérer les dernières modifications
git pull origin main  # ou votre branche

# Installer les dépendances
npm install --production

# Build
npm run build

# Redémarrer avec PM2
pm2 restart nextjs-app

echo "✅ Déploiement terminé"
```

Rendez les scripts exécutables :

```bash
chmod +x /var/www/nestjs-api/deploy.sh
chmod +x /var/www/nextjs-app/deploy.sh
```

---

## 📊 Étape 11 : Monitoring et maintenance

### 11.1 Monitoring PM2

```bash
# Interface web PM2 (optionnel)
pm2 install pm2-server-monit

# Accéder à l'interface sur http://votre-ip:9615
```

### 11.2 Logs

```bash
# Logs PM2
pm2 logs --lines 100

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs système
sudo journalctl -u nginx -f
```

### 11.3 Rotation des logs

Créez `/etc/logrotate.d/pm2` :

```
/var/log/pm2/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    missingok
    create 0640 $USER $USER
}
```

---

## 🐛 Dépannage

### Problème : Les applications ne démarrent pas

```bash
# Vérifier les logs PM2
pm2 logs

# Vérifier les variables d'environnement
pm2 env 0  # 0 = ID de l'application

# Vérifier que les ports sont libres
sudo lsof -i :3000
sudo lsof -i :3001
```

### Problème : Nginx retourne 502 Bad Gateway

```bash
# Vérifier que les applications tournent
pm2 status

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Vérifier la configuration Nginx
sudo nginx -t
```

### Problème : Erreurs de connexion à la base de données

```bash
# Vérifier la connexion SQL Server
# Tester depuis le serveur
telnet votre-serveur-sql 1433

# Vérifier les variables d'environnement
cat /var/www/nestjs-api/.env
```

### Problème : Erreurs de connexion à GitHub

```bash
# Tester la connexion SSH
ssh -T git@github.com

# Si erreur "Permission denied", vérifier :
# 1. La clé SSH est bien ajoutée à l'agent
ssh-add -l

# 2. La clé publique est bien sur GitHub
cat ~/.ssh/id_ed25519.pub

# 3. Les permissions des fichiers SSH
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub

# Si problème avec HTTPS et token :
# Vérifier que le token n'a pas expiré
# Régénérer un token si nécessaire sur GitHub
```

### Problème : Erreurs lors du git pull dans les scripts de déploiement

```bash
# Vérifier que vous êtes dans le bon répertoire
cd /var/www/nestjs-api
pwd

# Vérifier la branche actuelle
git branch

# Vérifier les remotes
git remote -v

# Forcer la mise à jour (si nécessaire)
git fetch origin
git reset --hard origin/main  # Attention : cela supprime les modifications locales

# Vérifier les permissions
ls -la /var/www/nestjs-api/.git
```

---

## 📝 Résumé des ports

| Service | Port | Description |
|---------|------|-------------|
| NestJS API | 3001 | Application backend |
| Next.js App | 3000 | Application frontend |
| Nginx HTTP | 80 | Reverse proxy HTTP |
| Nginx HTTPS | 443 | Reverse proxy HTTPS (si SSL configuré) |
| PM2 Web UI | 9615 | Interface de monitoring (optionnel) |

---

## 🔐 Sécurité supplémentaire

### Recommandations

1. **Ne pas exposer les ports 3000 et 3001** publiquement (utiliser uniquement Nginx)
2. **Utiliser des secrets forts** pour JWT_SECRET
3. **Configurer le rate limiting** dans Nginx
4. **Activer le fail2ban** pour protéger contre les attaques
5. **Mettre à jour régulièrement** le système et les dépendances
6. **Utiliser des certificats SSL** en production

### Configuration du rate limiting dans Nginx

Ajoutez dans `/etc/nginx/nginx.conf` (dans le bloc `http`) :

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=app_limit:10m rate=30r/s;
```

Puis dans vos configurations de sites :

```nginx
# Pour l'API
location /api {
    limit_req zone=api_limit burst=20 nodelay;
    # ... reste de la config
}

# Pour l'app
location / {
    limit_req zone=app_limit burst=50 nodelay;
    # ... reste de la config
}
```

---

## ✅ Checklist de déploiement

- [ ] Serveur Ubuntu mis à jour
- [ ] Node.js et npm installés
- [ ] Git configuré sur le serveur
- [ ] Clé SSH générée et ajoutée à GitHub
- [ ] Connexion SSH à GitHub testée
- [ ] Repositories GitHub clonés
- [ ] Nginx installé et configuré
- [ ] PM2 installé et configuré pour le démarrage au boot
- [ ] Applications buildées et déployées
- [ ] Variables d'environnement configurées
- [ ] Fichier ecosystem.config.js créé
- [ ] Applications démarrées avec PM2
- [ ] Configurations Nginx créées et activées
- [ ] Pare-feu configuré
- [ ] SSL configuré (optionnel)
- [ ] Tests de connectivité réussis
- [ ] Scripts de déploiement créés
- [ ] Monitoring configuré

---

**🎉 Félicitations ! Vos applications sont maintenant déployées et accessibles via Nginx !**

