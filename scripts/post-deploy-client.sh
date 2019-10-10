source ../.env
URL="https://api.telegram.org/bot$TELEGRAM_TOKEN/sendMessage"

echo "[1/5] copying .env..."
cp /var/www/leavemealone/shared/.env .
echo "[2/5] copying .env.production..."
cp /var/www/leavemealone/shared/.env.production .
echo "[3/5] installing dependencies..."
yarn --prefer-offline --silent
echo "[4/5] building..."
touch .cache && rm -r ./.cache && yarn run build:client
if [ $? -eq 0 ]; then
    echo "[5/5] copying..."
    rm -r /var/www/leavemealone/source/public && mv /var/www/leavemealone/next/source/public/ /var/www/leavemealone/source
    curl -s -X POST $URL -d chat_id=$TELEGRAM_CHAT_ID -d text="✅ Successfully deployed Leave Me Alone client"
else 
  curl -s -X POST $URL -d chat_id=$TELEGRAM_CHAT_ID -d text="❌ Failed to deploy Leave Me Alone client"
fi 
