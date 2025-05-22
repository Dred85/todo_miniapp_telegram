# Telegram Todo List App

Простое приложение для управления задачами, интегрированное с Telegram.

## Структура проекта

- `main.py` - бэкенд на FastAPI
- `frontend/` - фронтенд на React
- `todos.db` - база данных SQLite (создается автоматически)

## Установка и запуск

### Бэкенд

1. Создайте виртуальное окружение:
```bash
python -m venv .venv
source .venv/bin/activate  # для Linux/Mac
# или
.venv\Scripts\activate  # для Windows
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Запустите бэкенд:
```bash
python main.py
```

### Фронтенд

1. Перейдите в директорию frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите фронтенд:
```bash
npm start
```

## Использование

1. Запустите бэкенд и фронтенд
2. Откройте приложение в Telegram
3. Начните добавлять и управлять своими задачами

## API Endpoints

- GET `/todos` - получить список всех задач
- POST `/todos` - создать новую задачу
- PUT `/todos/{todo_id}` - обновить существующую задачу
- DELETE `/todos/{todo_id}` - удалить задачу 