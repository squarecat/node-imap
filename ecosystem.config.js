module.exports = {
  apps: [
    {
      name: 'leave-me-alone',
      script: './index.js',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      env_beta: {
        NODE_ENV: 'beta'
      },
      log_date_format: 'DD-MM-YYYY HH:mm',
      wait_ready: true,
      // wait 3 seconds for everything to connect on startup
      listen_timeout: 3000,
      // wait max 30 seconds for scans and stuff to finish
      kill_timeout: 30000
    }
  ],
  deploy: {
    beta: {
      // SSH user
      user: 'colin',
      // SSH host
      host: ['beta.leavemealone.xyz'],
      // GIT remote/branch
      ref: 'origin/beta',
      // GIT remote
      repo: 'git@github.com:squarecat/leavemealone.git',
      // path in the server
      path: '/var/www/leavemealone',
      // post-deploy action
      'post-deploy':
        './scripts/post-deploy.sh && pm2 reload ecosystem.config.js --env=beta --update-env'
    },
    prod: {
      // SSH user
      user: 'colin',
      // SSH host
      host: ['web.leavemealone.xyz'],
      // GIT remote/branch
      ref: 'origin/master',
      // GIT remote
      repo: 'git@github.com:squarecat/leavemealone.git',
      // path in the server
      path: '/var/www/leavemealone',
      // post-deploy action
      'post-deploy':
        './scripts/post-deploy.sh && pm2 reload ecosystem.config.js --env=production --update-env'
    }
  }
};
