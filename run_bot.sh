#!/bin/bash

# Переходим в директорию frontend и устанавливаем зависимости
cd frontend || exit 1

# Используем правильный Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \". "$NVM_DIR/nvm.sh"

# Используем Node.js 16
nvm use 16

# Устанавливаем зависимости с legacy peer dependencies
npm install --force --legacy-peer-deps

# Запускаем фронтенд на порту 3000 в фоновом режиме с подробным логированием
npm start --verbose > frontend.log 2>&1 &

# Возвращаемся в корневую директорию
cd ..

# Создаем директорию для сертификата, если она не существует
mkdir -p ~/.cloudflared

# Запускаем cloudflared с конфигурацией и более подробными логами
cloudflared tunnel --config cloudflared.yml --verbose --loglevel debug --transport-loglevel debug > cloudflared_frontend.log 2>&1 &

# Ждем немного, чтобы cloudflared запустился
sleep 2

# Запускаем бота с логированием
python3 main.py > bot.log 2>&1 &

# Выводим PID процессов
echo "cloudflared frontend PID: $!"
echo "bot PID: $!"

# Ждем завершения процессов
wait

# При завершении выводим логи
echo "cloudflared frontend логи:"
cat cloudflared_frontend.log
echo "\nБот логи:"
cat bot.log
echo "\nФронтенд логи:"
cat frontend/frontend.log
