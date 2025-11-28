module.exports = {
  apps: [
    // Application NestJS - API
    {
      name: 'nestjs-api',
      script: './dist/main.js',
      cwd: '/var/www/nestjs-api', // À adapter selon votre chemin de déploiement
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
      // Variables d'environnement spécifiques (optionnel, préférez .env)
      // env_file: '/var/www/nestjs-api/.env',
    },
    // Application Next.js - Frontend
    {
      name: 'nextjs-app',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/nextjs-app', // À adapter selon votre chemin de déploiement
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
      // Variables d'environnement spécifiques (optionnel, préférez .env.production)
      // env_file: '/var/www/nextjs-app/.env.production',
    },
  ],
};

