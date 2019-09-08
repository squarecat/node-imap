echo "[1/5] copying .env..."
cp /var/www/leavemealone/shared/.env .
echo "[2/5] copying .env.production..."
cp /var/www/leavemealone/shared/.env.production .
echo "[3/5] installing dependencies..."
yarn --prefer-offline --silent
echo "[4/5] building..."
touch .cache && rm -r ./.cache && yarn run build:client
echo "[5/5] copying..."
rm -r /var/www/leavemealone/source/public && mv /var/www/leavemealone/next/source/public/ /var/www/leavemealone/source