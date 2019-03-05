cp /var/www/leavemealone/shared/.env ./.env
cp /var/www/leavemealone/shared/.env.production ./.env.production
yarn --prefer-offline
yarn run build && \
yarn --production --ignore-scripts --prefer-offline