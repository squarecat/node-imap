echo "[1] copying .env..."
cp /var/www/leavemealone/shared/.env .
echo "[2] copying .env.production..."
cp /var/www/leavemealone/shared/.env.production .
echo "[3] installing dependencies..."
yarn --prefer-offline
echo "[4] building..."
yarn run build
echo "[5] pruning dependencies..."
yarn --production --ignore-scripts --prefer-offline