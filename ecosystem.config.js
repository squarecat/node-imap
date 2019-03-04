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
      log_date_format: 'YYYY-MM-DD HH:mm'
    }
  ],
  deploy: {
    // "production" is the environment name
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
      'post-deploy': './scripts/post-deploy.sh'
    }
  }
};
