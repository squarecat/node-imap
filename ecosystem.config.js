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
  ]
};
