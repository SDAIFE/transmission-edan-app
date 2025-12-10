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
# ⚠️ IMPORTANT : Vérifier la version de Node.js actuelle (si déjà installée)
node --version 2>/dev/null || echo "Node.js n'est pas installé"

# Si Node.js est déjà installé avec une version < 20, il faudra le mettre à niveau
# Voir la section "Dépannage" pour les instructions de mise à niveau

# Node.js 20.x (requis pour Prisma 7 - minimum 20.19+)
# Alternative : Node.js 22.x (22.12+) ou 24.x (24.0+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérification de la version installée
node --version
npm --version

# ⚠️ Vérification : Node.js doit être >= 20.19 pour Prisma 7
# Si vous voyez une version < 20.19, consultez la section "Dépannage" ci-dessous

# Installation de build-essential pour compiler les modules natifs
sudo apt install -y build-essential

# Installation de Git
sudo apt install -y git
```

**Note importante :** Prisma 7 nécessite Node.js 20.19+, 22.12+, ou 24.0+. Si vous avez une version antérieure (comme Node.js 18), consultez la section **"Dépannage - Problème : Node.js version incompatible avec Prisma"** plus bas dans ce guide pour les instructions de mise à niveau.

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
[PM2] Freeze a process list on reboot via:
$ pm2 save

[PM2] Remove init script via: ce script permet de retirer pm2 au démarrage
$ pm2 unstartup systemd

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
#ssh-keygen -t ed25519 -C "votre.email@example.com"

# Ou utiliser RSA si ed25519 n'est pas supporté
 ssh-keygen -t rsa -b 4096 -C "votre.email@example.com"

# Appuyez sur Entrée pour accepter l'emplacement par défaut
# Entrez un mot de passe fort (ou laissez vide pour aucune passphrase)
```

### 2.3 Ajout de la clé SSH à l'agent SSH

```bash
# Démarrer l'agent SSH
eval "$(ssh-agent -s)"

# Ajouter la clé SSH à l'agent
# ssh-add ~/.ssh/id_ed25519
# OU si vous avez utilisé RSA
 ssh-add ~/.ssh/id_rsa
```

### 2.4 Ajout de la clé publique à GitHub

```bash
# Afficher la clé publique
# cat ~/.ssh/id_ed25519.pub
# OU
 cat ~/.ssh/id_rsa.pub

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
```

**⚠️ Message lors de la première connexion :**

Lors de la première connexion, vous verrez un message de vérification de l'authenticité de l'hôte :

```
The authenticity of host 'github.com (140.82.121.3)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**C'est normal !** Tapez simplement `yes` et appuyez sur Entrée. SSH ajoutera GitHub à la liste des hôtes connus (`~/.ssh/known_hosts`).

**Après avoir tapé "yes", vous devriez voir :**
```
Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

Ce message confirme que votre authentification SSH fonctionne correctement ! 🎉

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

### 4.1 Génération du JWT_SECRET

**⚠️ IMPORTANT :** Le JWT_SECRET doit être un secret fort et aléatoire. Ne réutilisez jamais le même secret en production.

Générez un JWT_SECRET sécurisé avec l'une des méthodes suivantes :

```bash
# Méthode 1 : Utiliser OpenSSL (recommandé)
openssl rand -base64 64 | tr -d '\n'

# Méthode 2 : Utiliser Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Méthode 3 : Utiliser /dev/urandom
head -c 64 /dev/urandom | base64 | tr -d '\n'

# Méthode 4 : Utiliser pwgen (si installé)
sudo apt install -y pwgen
pwgen -s 64 1
```

**Exemple de sortie :**
```
xK9pQ2mN8vR7tY5wE3uI6oA1sD4fG9hJ0kL2zX5cV8bN1mQ4rT7yU0iP3oA6sD9fG2hJ5kL8zX
```

**⚠️ Sécurité :**
- Copiez le secret généré et stockez-le de manière sécurisée
- Ne commitez jamais le JWT_SECRET dans Git
- Utilisez un secret différent pour chaque environnement (dev, test, production)
- Le secret doit contenir au minimum 32 caractères (recommandé : 64+ caractères)

### 4.2 Configuration NestJS

Créez le fichier `.env` dans `/var/www/nestjs-api/.env` :

```env
# Configuration de la base de données SQL Server
DATABASE_URL="sqlserver://username:password@server:1433;database=nom_bd;encrypt=true;trustServerCertificate=true"

# Configuration JWT
# ⚠️ REMPLACEZ par le secret généré à l'étape 4.1
JWT_SECRET="COLEZ_ICI_LE_SECRET_GENERE_A_L_ETAPE_4_1"
JWT_EXPIRES_IN="24h"

# Configuration de l'application
PORT=3001
NODE_ENV=production

# Configuration CORS
# Pour un domaine : CORS_ORIGIN="https://votre-domaine.com"
# Pour une IP : CORS_ORIGIN="http://10.100.40.144"
# Pour plusieurs origines : CORS_ORIGIN="http://10.100.40.144,http://localhost:3000"
# Pour accepter toutes les origines (dev/test uniquement) : CORS_ORIGIN="*"
CORS_ORIGIN="http://10.100.40.144"
```

### 4.3 Configuration Next.js

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

**⚠️ IMPORTANT :** Adaptez les chemins (`cwd`) selon la structure réelle de votre serveur. Utilisez `pwd` pour connaître le chemin exact de votre projet.

Créez le fichier `ecosystem.config.js` à la racine de chaque projet ou un fichier global dans `/var/www/ecosystem.config.js` :

```javascript
module.exports = {
  apps: [
    // Application NestJS
    {
      name: 'nestjs-api',
      script: './dist/main.js',
      cwd: '/var/www/nestjs-api',  // ⚠️ ADAPTEZ selon votre chemin réel (ex: /var/www/edan-app/resultat-legislative-api)
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
    listen 8082;
    server_name 10.100.40.144;  # Remplacez par votre domaine ou IP

    # Redirection HTTP vers HTTPS (optionnel, si vous avez SSL)
    # return 301 https://$server_name$request_uri;

    # Logs
    access_log /var/log/nginx/transmission-edan-app-access.log;
    error_log /var/log/nginx/transmission-edan-app-error.log;

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
sudo ln -s /etc/nginx/sites-available/transmission-edan-app /etc/nginx/sites-enabled/

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

## 🔌 Étape 8.5 : Configuration de ports personnalisés via Nginx

Si vous souhaitez que Nginx écoute sur des ports spécifiques (8081 pour NestJS, 8082 pour Next.js) tout en gardant les applications accessibles uniquement via Nginx (pas d'accès direct), voici comment procéder :

**Architecture :**
- Nginx écoute sur les ports **8081** (NestJS) et **8082** (Next.js) - accessibles depuis l'extérieur
- Les applications écoutent sur des ports internes (3001 pour NestJS, 3002 pour Next.js) - **non accessibles depuis l'extérieur**
- Nginx fait le proxy entre les ports externes et les ports internes

### 8.5.1 Autoriser les ports dans le pare-feu

```bash
# Autoriser le port 8081 pour Nginx (NestJS API)
sudo ufw allow 8081/tcp

# Autoriser le port 8082 pour Nginx (Next.js App)
sudo ufw allow 8082/tcp

# ⚠️ IMPORTANT : Ne PAS autoriser les ports internes (3001, 3002) dans le pare-feu
# Les applications doivent rester accessibles uniquement en localhost

# Vérifier que les ports sont bien autorisés
sudo ufw status numbered

# Vous devriez voir :
# [1] 22/tcp                     ALLOW       Anywhere
# [2] 80/tcp                     ALLOW       Anywhere
# [3] 443/tcp                    ALLOW       Anywhere
# [4] 8081/tcp                   ALLOW       Anywhere
# [5] 8082/tcp                   ALLOW       Anywhere
# (Les ports 3001 et 3002 ne doivent PAS apparaître)
```

### 8.5.2 Mise à jour des variables d'environnement

**Pour NestJS API** (`/var/www/nestjs-api/.env`) :

```env
# Configuration de la base de données SQL Server
DATABASE_URL="sqlserver://username:password@server:1433;database=nom_bd;encrypt=true;trustServerCertificate=true"

# Configuration JWT
JWT_SECRET="VOTRE_SECRET_JWT"
JWT_EXPIRES_IN="24h"

# Configuration de l'application - PORT INTERNE (non accessible depuis l'extérieur)
PORT=3001
NODE_ENV=production

# Configuration CORS - Inclure les ports Nginx
CORS_ORIGIN="http://10.100.40.144,http://10.100.40.144:8081,http://10.100.40.144:8082"
```

**Pour Next.js App** (`/var/www/nextjs-app/.env.production`) :

```env
# URL de l'API NestJS - Utiliser le port Nginx
NEXT_PUBLIC_API_URL=http://10.100.40.144:8081

# Configuration de l'application - PORT INTERNE (non accessible depuis l'extérieur)
NODE_ENV=production
PORT=3002
```

### 8.5.3 Mise à jour de la configuration PM2

Mettez à jour le fichier `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [
    // Application NestJS
    {
      name: 'nestjs-api',
      script: './dist/main.js',
      cwd: '/var/www/nestjs-api',  // Adaptez selon votre chemin réel
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,  // ⚠️ PORT INTERNE (localhost uniquement)
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
        PORT: 3002,  // ⚠️ PORT INTERNE (localhost uniquement)
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

### 8.5.4 Mise à jour de la configuration Nginx

**Pour NestJS API** (`/etc/nginx/sites-available/nestjs-api`) :

```nginx
server {
    listen 8081;  # ⚠️ Nginx écoute sur le port 8081 (accessible depuis l'extérieur)
    server_name 10.100.40.144;  # Votre IP ou domaine

    # Logs
    access_log /var/log/nginx/nestjs-api-access.log;
    error_log /var/log/nginx/nestjs-api-error.log;

    # Taille maximale des uploads
    client_max_body_size 10M;

    # Proxy vers l'application NestJS sur le port interne (localhost uniquement)
    location / {
        proxy_pass http://localhost:3001;  # ⚠️ PORT INTERNE (non accessible depuis l'extérieur)
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

    # Configuration spécifique pour Swagger
    location /api/docs {
        proxy_pass http://localhost:3001;  # ⚠️ PORT INTERNE
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Pour Next.js App** (`/etc/nginx/sites-available/nextjs-app`) :

```nginx
server {
    listen 8082;  # ⚠️ Nginx écoute sur le port 8082 (accessible depuis l'extérieur)
    server_name 10.100.40.144;  # Votre IP ou domaine

    # Logs
    access_log /var/log/nginx/nextjs-app-access.log;
    error_log /var/log/nginx/nextjs-app-error.log;

    # Taille maximale des uploads
    client_max_body_size 10M;

    # Proxy vers l'application Next.js sur le port interne (localhost uniquement)
    location / {
        proxy_pass http://localhost:3002;  # ⚠️ PORT INTERNE (non accessible depuis l'extérieur)
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

    # Proxy des requêtes API vers NestJS (via Nginx sur le port 8081)
    location /api {
        proxy_pass http://localhost:3001;  # ⚠️ PORT INTERNE de NestJS
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache des assets statiques
    location /_next/static {
        proxy_pass http://localhost:3002;  # ⚠️ PORT INTERNE
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### 8.5.5 Application des modifications

```bash
# 1. Redémarrer les applications avec PM2
pm2 restart all

# OU redémarrer individuellement
pm2 restart nestjs-api
pm2 restart nextjs-app

# 2. Recharger la configuration Nginx
sudo nginx -t  # Vérifier la syntaxe
sudo systemctl reload nginx

# 3. Vérifier que Nginx écoute bien sur les ports 8081 et 8082
sudo netstat -tlnp | grep -E '8081|8082'
# OU avec ss
sudo ss -tlnp | grep -E '8081|8082'

# Vous devriez voir Nginx écouter sur ces ports :
# tcp  0  0  0.0.0.0:8081  0.0.0.0:*  LISTEN  PID/nginx
# tcp  0  0  0.0.0.0:8082  0.0.0.0:*  LISTEN  PID/nginx

# 4. Vérifier que les applications écoutent uniquement en localhost (ports internes)
sudo netstat -tlnp | grep -E '3001|3002'
# OU avec ss
sudo ss -tlnp | grep -E '3001|3002'

# Vous devriez voir les applications Node.js écouter uniquement en localhost :
# tcp  0  0  127.0.0.1:3001  0.0.0.0:*  LISTEN  PID/node
# tcp  0  0  127.0.0.1:3002  0.0.0.0:*  LISTEN  PID/node
# ⚠️ Notez que c'est 127.0.0.1 (localhost) et non 0.0.0.0 (toutes les interfaces)
```

### 8.5.6 Test des nouveaux ports

```bash
# Tester NestJS API via Nginx sur le port 8081
curl http://10.100.40.144:8081/api/v1

# Tester Next.js App via Nginx sur le port 8082
curl http://10.100.40.144:8082

# Tester depuis un autre ordinateur
# Depuis votre machine locale :
curl http://10.100.40.144:8081/api/v1
curl http://10.100.40.144:8082

# ⚠️ Vérifier que les ports internes ne sont PAS accessibles depuis l'extérieur
# Cette commande devrait échouer (timeout ou connexion refusée) :
curl http://10.100.40.144:3001/api/v1  # Devrait échouer
curl http://10.100.40.144:3002  # Devrait échouer
```

### 8.5.7 Accès aux applications via Nginx

Une fois configuré, vous pourrez accéder à vos applications uniquement via Nginx :

- **NestJS API** : `http://10.100.40.144:8081` (via Nginx → localhost:3001)
- **Swagger Documentation** : `http://10.100.40.144:8081/api/docs` (via Nginx → localhost:3001)
- **Next.js App** : `http://10.100.40.144:8082` (via Nginx → localhost:3002)

**✅ Sécurité :**
- Les applications (ports 3001, 3002) ne sont **pas accessibles directement** depuis l'extérieur
- Seul Nginx (ports 8081, 8082) est accessible depuis l'extérieur
- Toutes les requêtes passent par Nginx qui fait le proxy vers les applications en localhost
- Le pare-feu bloque l'accès direct aux ports internes (3001, 3002)

**Option : Restreindre l'accès par IP (recommandé pour la production)**

```bash
# Autoriser uniquement certaines IPs pour le port 8081
sudo ufw delete allow 8081/tcp  # Supprimer la règle générale
sudo ufw allow from 192.168.1.0/24 to any port 8081  # Autoriser un réseau
sudo ufw allow from 10.0.0.0/8 to any port 8081  # Autoriser un autre réseau

# Faire de même pour le port 8082
sudo ufw delete allow 8082/tcp
sudo ufw allow from 192.168.1.0/24 to any port 8082
sudo ufw allow from 10.0.0.0/8 to any port 8082

# Vérifier les règles
sudo ufw status numbered
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

# Vérifier les ports (ports personnalisés)
sudo netstat -tlnp | grep -E '8081|8082|80|443'
# OU avec ss
sudo ss -tlnp | grep -E '8081|8082|80|443'
```

### 9.2 Tests de connectivité

```bash
# Test local de l'API NestJS (port personnalisé)
curl http://localhost:8081/api/v1

# Test local de Next.js (port personnalisé)
curl http://localhost:8082

# Test direct via IP (ports personnalisés)
curl http://10.100.40.144:8081/api/v1
curl http://10.100.40.144:8082

# Test via Nginx (remplacez par votre domaine/IP)
curl http://votre-domaine.com
curl http://api.votre-domaine.com/api/v1

# Vérifier que les ports sont bien ouverts
sudo netstat -tlnp | grep -E '8081|8082'
# OU avec ss
sudo ss -tlnp | grep -E '8081|8082'
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

### Problème : Erreurs CORS dans le navigateur

**Erreur typique dans la console :**
```
Access to fetch at 'http://10.100.40.144/api/v1/...' from origin 'http://10.100.40.144' has been blocked by CORS policy
```

**Solutions :**

```bash
# 1. Vérifier la variable CORS_ORIGIN dans .env
cat /var/www/edan-app/resultat-legislative-api/.env | grep CORS_ORIGIN

# 2. Pour un accès par IP en développement/test, configurez CORS_ORIGIN ainsi :
# Option A : Accepter toutes les origines (développement/test uniquement)
CORS_ORIGIN="*"

# Option B : Spécifier plusieurs origines (séparées par des virgules)
CORS_ORIGIN="http://10.100.40.144,http://localhost:3000,http://localhost:3001"

# Option C : Spécifier une seule origine
CORS_ORIGIN="http://10.100.40.144"

# 3. Éditer le fichier .env
nano /var/www/edan-app/resultat-legislative-api/.env
# Modifiez CORS_ORIGIN selon vos besoins

# 4. Redémarrer l'application avec PM2
pm2 restart nestjs-api

# 5. Vérifier les logs pour confirmer
pm2 logs nestjs-api
```

**Note :** Le code a été mis à jour pour accepter plusieurs origines séparées par des virgules. Si `CORS_ORIGIN` n'est pas défini ou vaut `*`, toutes les origines sont acceptées (uniquement en développement/test).

### Problème : Redirection automatique vers HTTPS

**Symptôme :** L'URL HTTP (ex: `http://10.100.40.144/api/docs`) se transforme automatiquement en HTTPS.

**Causes possibles :**

1. **Helmet force HTTPS** (dans le code NestJS)
2. **Nginx redirige vers HTTPS** (dans la configuration)
3. **Le navigateur force HTTPS** (HSTS)

**Solutions :**

```bash
# 1. Vérifier la configuration Nginx pour les redirections HTTPS
sudo grep -r "return 301 https" /etc/nginx/sites-available/
# Si vous trouvez une ligne comme "return 301 https://...", commentez-la :
sudo nano /etc/nginx/sites-available/nestjs-api
# Cherchez et commentez : # return 301 https://$server_name$request_uri;

# 2. Vérifier que Helmet n'est pas configuré pour forcer HTTPS
# Le code a été mis à jour pour désactiver HSTS en développement/test
# Vérifiez que NODE_ENV n'est pas défini sur "production" si vous testez en HTTP
cat /var/www/edan-app/resultat-legislative-api/.env | grep NODE_ENV

# 3. Si vous testez en HTTP, assurez-vous que NODE_ENV n'est pas "production"
# Dans .env, pour le développement/test :
NODE_ENV=development
# OU
NODE_ENV=test

# 4. Recharger Nginx
sudo nginx -t
sudo systemctl reload nginx

# 5. Redémarrer l'application
pm2 restart nestjs-api

# 6. Vider le cache du navigateur
# Dans Chrome/Edge : Ctrl+Shift+Delete
# Ou ouvrir en navigation privée pour tester
```

**Configuration Nginx recommandée pour HTTP (sans SSL) :**

```nginx
server {
    listen 80;
    server_name 10.100.40.144;  # Votre IP ou domaine

    # ⚠️ NE PAS décommenter cette ligne si vous n'avez pas SSL configuré
    # return 301 https://$server_name$request_uri;

    # ... reste de la configuration
}
```

**Pour tester rapidement :**

```bash
# Tester directement l'API (bypass Nginx)
curl http://localhost:3001/api/v1

# Tester via Nginx
curl http://10.100.40.144/api/v1

# Vérifier les headers de réponse
curl -I http://10.100.40.144/api/v1
```

### Problème : Swagger charge les ressources en HTTPS (ERR_CONNECTION_REFUSED)

**Erreurs typiques dans la console :**
```
GET https://10.100.40.144/api/docs/swagger-ui.css net::ERR_CONNECTION_REFUSED
GET https://10.100.40.144/api/docs/swagger-ui-bundle.js net::ERR_CONNECTION_REFUSED
Cross-Origin-Opener-Policy header has been ignored, because the URL's origin was untrustworthy
```

**Causes :**
1. Helmet envoie des headers qui nécessitent HTTPS (Cross-Origin-Opener-Policy)
2. Swagger génère des URLs en HTTPS alors que le serveur est en HTTP
3. Le navigateur force HTTPS pour certaines ressources

**Solutions :**

```bash
# 1. Vérifier que NODE_ENV n'est pas "production" si vous testez en HTTP
cat /var/www/edan-app/resultat-legislative-api/.env | grep NODE_ENV
# Doit être : NODE_ENV=development ou NODE_ENV=test

# 2. Mettre à jour le code (rebuild nécessaire)
cd /var/www/edan-app/resultat-legislative-api
git pull origin main  # ou votre branche
npm run build

# 3. Redémarrer l'application
pm2 restart nestjs-api

# 4. Vider complètement le cache du navigateur
# Chrome/Edge : Ctrl+Shift+Delete → Cocher "Images et fichiers en cache" → Effacer
# OU utiliser la navigation privée (Ctrl+Shift+N)

# 5. Si le problème persiste, vérifier les headers envoyés par le serveur
curl -I http://10.100.40.144/api/docs
# Vérifiez qu'il n'y a pas de headers Cross-Origin-Opener-Policy ou HSTS

# 6. Vérifier la configuration Nginx (ne doit pas forcer HTTPS)
sudo grep -i "https\|ssl" /etc/nginx/sites-available/nestjs-api
# Ne doit pas contenir de redirection HTTPS active
```

**Configuration .env recommandée pour HTTP :**

```env
NODE_ENV=development
# OU
NODE_ENV=test
# PAS "production" si vous testez en HTTP
```

**Note :** Le code a été mis à jour pour :
- Désactiver les headers Helmet qui nécessitent HTTPS en développement/test
- Configurer Swagger pour utiliser des URLs HTTP en développement
- Permettre l'accès Swagger en HTTP sans erreurs CORS

**Si le problème persiste après le rebuild :**

```bash
# Vérifier que le nouveau code est bien déployé
pm2 logs nestjs-api | tail -20

# Vérifier les headers HTTP
curl -v http://10.100.40.144/api/docs 2>&1 | grep -i "cross-origin\|hsts"

# Tester directement sur le port 3001 (bypass Nginx)
curl -v http://localhost:3001/api/docs 2>&1 | grep -i "cross-origin\|hsts"
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

### Problème : PM2 - Script not found (dist/main.js)

**Erreur typique :**
```
[PM2][ERROR] Error: Script not found: /var/www/edan-app/resultat-legislative-api/dist/main.js
```

**Solutions :**

```bash
# 1. Vérifier le chemin réel de votre application
ls -la /var/www/
# Notez le chemin exact (ex: /var/www/edan-app/resultat-legislative-api)

# 2. Vérifier que le build a été fait
cd /var/www/edan-app/resultat-legislative-api  # Adaptez selon votre chemin
ls -la dist/
# Si le dossier dist/ n'existe pas ou est vide, faites le build :
npm run build

# 3. Vérifier que dist/main.js existe
ls -la dist/main.js
# Si le fichier n'existe pas, le build a échoué

# 4. Corriger le fichier ecosystem.config.js
# Éditez le fichier avec votre éditeur préféré
nano /var/www/edan-app/resultat-legislative-api/ecosystem.config.js
# OU
vi /var/www/edan-app/resultat-legislative-api/ecosystem.config.js

# Modifiez la ligne 'cwd' pour correspondre à votre chemin réel :
# cwd: '/var/www/edan-app/resultat-legislative-api',  # Votre chemin réel

# 5. Si vous utilisez un fichier ecosystem.config.js global, mettez à jour le chemin
# Éditez /var/www/ecosystem.config.js (ou où se trouve votre fichier global)
# et modifiez le 'cwd' pour correspondre à votre structure

# 6. Redémarrer PM2 avec la configuration corrigée
pm2 delete nestjs-api  # Supprimer l'ancienne configuration
pm2 start ecosystem.config.js --only nestjs-api
# OU si fichier global :
pm2 start /var/www/ecosystem.config.js --only nestjs-api

# 7. Vérifier que ça fonctionne
pm2 status
pm2 logs nestjs-api
```

**Exemple de configuration corrigée pour votre cas :**

```javascript
module.exports = {
  apps: [
    {
      name: 'nestjs-api',
      script: './dist/main.js',
      cwd: '/var/www/edan-app/resultat-legislative-api',  // Votre chemin réel
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // ... reste de la config
    },
  ],
};
```

**Vérification rapide :**

```bash
# Vérifier le chemin de travail actuel de PM2
pm2 describe nestjs-api | grep cwd

# Vérifier que le fichier existe au chemin spécifié
test -f /var/www/edan-app/resultat-legislative-api/dist/main.js && echo "OK" || echo "Fichier manquant"
```

### Problème : Node.js version incompatible avec Prisma

**Erreur typique :**
```
Prisma only supports Node.js versions 20.19+, 22.12+, 24.0+.
Please upgrade your Node.js version.
```

**Solution : Mise à niveau de Node.js**

```bash
# 1. Vérifier la version actuelle
node --version

# 2. Si vous avez Node.js < 20.19, procédez à la mise à niveau :

# Option A : Utiliser NodeSource (recommandé)
# Désinstaller l'ancienne version (si installée via apt)
sudo apt remove nodejs npm -y
sudo apt autoremove -y

# Nettoyer les anciens dépôts NodeSource (si présents)
sudo rm -f /etc/apt/sources.list.d/nodesource.list

# Installer Node.js 20.x (version LTS recommandée)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier la nouvelle version
node --version
npm --version

# Option B : Utiliser NVM (Node Version Manager) - Plus flexible
# Installer NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recharger le shell
source ~/.bashrc
# OU
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Installer Node.js 20 (LTS)
nvm install 20
nvm use 20
nvm alias default 20

# Vérifier la version
node --version

# 3. Si vous utilisez PM2, redémarrer les applications
pm2 restart all

# 4. Réinstaller les dépendances du projet
cd /var/www/nestjs-api
rm -rf node_modules package-lock.json
npm install --production

# 5. Vérifier que Prisma peut maintenant s'installer
npm install @prisma/client prisma --save
```

**Note :** Si vous utilisez NVM, assurez-vous que PM2 utilise la bonne version de Node.js :

```bash
# Vérifier quelle version de Node.js utilise PM2
pm2 env 0  # Remplacez 0 par l'ID de votre application

# Si nécessaire, redémarrer PM2 avec la bonne version
pm2 delete all
# Puis redémarrer avec ecosystem.config.js
pm2 start ecosystem.config.js
pm2 save
```

**Vérification des versions supportées par Prisma :**
- ✅ Node.js 20.19 ou supérieur
- ✅ Node.js 22.12 ou supérieur  
- ✅ Node.js 24.0 ou supérieur
- ❌ Node.js 18.x (non supporté)
- ❌ Node.js 20.0 à 20.18 (non supporté)

---

## 📝 Résumé des ports

| Service | Port | Description | Accessible depuis l'extérieur |
|---------|------|-------------|-------------------------------|
| Nginx (NestJS) | 8081 | Reverse proxy pour NestJS API | ✅ Oui |
| Nginx (Next.js) | 8082 | Reverse proxy pour Next.js App | ✅ Oui |
| NestJS API (interne) | 3001 | Application backend (localhost uniquement) | ❌ Non |
| Next.js App (interne) | 3002 | Application frontend (localhost uniquement) | ❌ Non |
| Nginx HTTP | 80 | Reverse proxy HTTP (optionnel) | ✅ Oui (si configuré) |
| Nginx HTTPS | 443 | Reverse proxy HTTPS (si SSL configuré) | ✅ Oui (si configuré) |
| PM2 Web UI | 9615 | Interface de monitoring (optionnel) | ⚠️ Optionnel |
| SSH | 22 | Accès sécurisé au serveur | ✅ Oui |

**Architecture :**
- Les applications (NestJS, Next.js) écoutent uniquement sur `localhost` (ports 3001, 3002) - **non accessibles depuis l'extérieur**
- Nginx écoute sur les ports 8081 et 8082 - **accessibles depuis l'extérieur**
- Nginx fait le proxy entre les ports externes (8081, 8082) et les ports internes (3001, 3002)
- Le pare-feu bloque l'accès direct aux ports internes (3001, 3002)

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

