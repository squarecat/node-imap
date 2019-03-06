echo "[1/5] copying .env..."
cp /var/www/leavemealone/shared/.env .
echo "[2/5] copying .env.production..."
cp /var/www/leavemealone/shared/.env.production .
echo "[3/5] installing dependencies..."
yarn --prefer-offline --silent
echo "[4/5] building..."
yarn run build --silent
echo "[5/5] pruning dependencies..."
yarn --production --ignore-scripts --prefer-offline --silent