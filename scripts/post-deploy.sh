cp /var/www/leavemealone/shared/.env ./.env
yarn --prefer-offline
yarn run build && \
yarn --production --ignore-scripts --prefer-offline && \
NODE_ENV=production pm2 reload ecosystem.config.js