yarn --prefer-offline
yarn run build && \
yarn --production --ignore-scripts --prefer-offline && \
pm2 reload ecosystem.config.js