#!/bin/bash

# Запускаем cloudflared в фоновом режиме
./cloudflared tunnel --url http://localhost:8000 &

# Ждем немного, чтобы cloudflared запустился
sleep 2

# Запускаем бота
python3 main.py
