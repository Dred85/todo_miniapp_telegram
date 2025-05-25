# 8185492514:AAFk9oJ-t0_gabUTdTH1vt2Hp2xRHmEGysU
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sqlite3
import os
import asyncio
from dotenv import load_dotenv
import uvicorn
from contextlib import asynccontextmanager

# Загрузка переменных окружения
load_dotenv()

# Константы
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
WEBAPP_URL = os.getenv('WEBAPP_URL')

if not TELEGRAM_TOKEN:
    raise ValueError("TELEGRAM_TOKEN не найден в переменных окружения")

# Глобальная переменная для хранения экземпляра бота
bot_application = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Запуск бота при старте приложения
    global bot_application
    bot_application = Application.builder().token(TELEGRAM_TOKEN).build()
    
    # Добавляем обработчики
    bot_application.add_handler(CommandHandler("start", start))
    bot_application.add_handler(CallbackQueryHandler(button_callback))
    
    # Запускаем бота
    await bot_application.initialize()
    await bot_application.start()
    await bot_application.updater.start_polling()
    
    yield
    
    # Остановка бота при завершении работы приложения
    if bot_application:
        await bot_application.updater.stop()
        await bot_application.stop()
        await bot_application.shutdown()

app = FastAPI(lifespan=lifespan)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Модели данных
class TodoItem(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: datetime = datetime.now()

# Инициализация базы данных
def init_db():
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Инициализация базы данных при запуске
init_db()

# API endpoints
@app.get("/todos", response_model=List[TodoItem])
async def get_todos():
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    c.execute('SELECT * FROM todos ORDER BY created_at DESC')
    todos = [TodoItem(id=row[0], title=row[1], description=row[2], 
                     completed=bool(row[3]), created_at=row[4]) 
             for row in c.fetchall()]
    conn.close()
    return todos

@app.post("/todos", response_model=TodoItem)
async def create_todo(todo: TodoItem):
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    c.execute('''
        INSERT INTO todos (title, description, completed, created_at)
        VALUES (?, ?, ?, ?)
    ''', (todo.title, todo.description, todo.completed, todo.created_at))
    conn.commit()
    todo.id = c.lastrowid
    conn.close()
    return todo

@app.put("/todos/{todo_id}", response_model=TodoItem)
async def update_todo(todo_id: int, todo: TodoItem):
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    c.execute('''
        UPDATE todos
        SET title = ?, description = ?, completed = ?
        WHERE id = ?
    ''', (todo.title, todo.description, todo.completed, todo_id))
    conn.commit()
    conn.close()
    todo.id = todo_id
    return todo

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int):
    conn = sqlite3.connect('todos.db')
    c = conn.cursor()
    c.execute('DELETE FROM todos WHERE id = ?', (todo_id,))
    conn.commit()
    conn.close()
    return {"message": "Todo deleted successfully"}

# Telegram Bot Handlers
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start"""
    try:
        keyboard = [
            [InlineKeyboardButton("Открыть Todo List", web_app=WebAppInfo(url=WEBAPP_URL))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        if update.message:
            await update.message.reply_text(
                "Привет! Я бот для управления задачами. Нажмите кнопку ниже, чтобы открыть список задач:",
                reply_markup=reply_markup
            )
        elif update.callback_query:
            await update.callback_query.message.reply_text(
                "Привет! Я бот для управления задачами. Нажмите кнопку ниже, чтобы открыть список задач:",
                reply_markup=reply_markup
            )
    except Exception as e:
        print(f"Error in start handler: {e}")
        if update.message:
            await update.message.reply_text("Произошла ошибка. Пожалуйста, попробуйте позже.")

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик нажатий на кнопки"""
    try:
        query = update.callback_query
        await query.answer()
        await query.edit_message_text(text=f"Выбранная опция: {query.data}")
    except Exception as e:
        print(f"Error in button callback: {e}")
        if update.callback_query:
            await update.callback_query.answer("Произошла ошибка. Пожалуйста, попробуйте позже.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)

button = InlineKeyboardButton(
    text="Открыть To-Do",
    web_app=WebAppInfo(url=WEBAPP_URL + "/todo")
)