yarn run build
yarn run build:server
cp server/utils/countries.json build/utils/countries.json
# zip
tar cf leavemealone.tar.gz build public config index.js package.json ecosystem.config.js
# deploy
scp leavemealone.tar.gz leavemealone:/var/www/leavemealone
# ssh leavemealone "tar xf -C /var/www/leavemealone/ /var/www/leavemealone/leavemealone.tar.gz
# install
# ssh leavemealone "RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 cd /var/www/leavemealone/ && yarn install --production --ignore-scripts --prefer-offline
# start
