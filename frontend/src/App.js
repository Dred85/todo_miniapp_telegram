import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Paper,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Устанавливаем временную зону в ISO строку
  const moscowTime = new Date(date.getTime() + (3 * 60 * 60 * 1000));
  return moscowTime.toLocaleString('ru-RU', { 
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};


const API_URL = 'http://localhost:8000';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [editingTodo, setEditingTodo] = useState(null); // ID редактируемой задачи
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Инициализация Telegram WebApp
    try {
      WebApp.ready();
      WebApp.expand();
    } catch (error) {
      console.warn('Telegram WebApp not available:', error);
    }
    
    fetchTodos();
  }, []);

  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity });
  };

  const fetchTodos = async () => {
    try {
      console.log('Fetching todos from:', `${API_URL}/todos`);
      const response = await axios.get(`${API_URL}/todos`);
      console.log('Response data:', response.data);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      showAlert('Ошибка при загрузке задач', 'error');
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) {
      showAlert('Введите название задачи', 'warning');
      return;
    }
    
    try {
      const todoData = {
        ...newTodo,
        created_at: new Date().toISOString(),
        completed: false
      };
      
      console.log('Sending todo data:', todoData);
      const response = await axios.post(`${API_URL}/todos`, todoData);
      console.log('Response from server:', response.data);
      setTodos([response.data, ...todos]);
      setNewTodo({ title: '', description: '' });
      showAlert('Задача добавлена', 'success');
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      showAlert('Ошибка при добавлении задачи', 'error');
    }
  };

  const handleUpdateTodo = async (todoId) => {
    const todo = todos.find(t => t.id === todoId);
    try {
      const response = await axios.put(`${API_URL}/todos/${todoId}`, todo);
      setTodos(todos.map(t => t.id === todoId ? response.data : t));
      setEditingTodo(null);
      showAlert('Задача обновлена', 'success');
    } catch (error) {
      console.error('Error updating todo:', error);
      showAlert('Ошибка при обновлении задачи', 'error');
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const updatedTodo = { ...todo, completed: !todo.completed };
      await axios.put(`${API_URL}/todos/${todo.id}`, updatedTodo);
      setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
    } catch (error) {
      console.error('Error updating todo:', error);
      showAlert('Ошибка при обновлении задачи', 'error');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await axios.delete(`${API_URL}/todos/${todoId}`);
      setTodos(todos.filter(todo => todo.id !== todoId));
      showAlert('Задача удалена', 'success');
    } catch (error) {
      console.error('Error deleting todo:', error);
      showAlert('Ошибка при удалении задачи', 'error');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Todo List
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label={editingTodo ? "Редактировать название" : "Название"}
            variant="outlined"
            value={editingTodo ? todos.find(t => t.id === editingTodo).title : newTodo.title}
            onChange={(e) => {
              if (editingTodo) {
                setTodos(todos.map(t => 
                  t.id === editingTodo ? { ...t, title: e.target.value } : t
                ));
              } else {
                setNewTodo({ ...newTodo, title: e.target.value });
              }
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={editingTodo ? "Редактировать описание" : "Описание"}
            variant="outlined"
            multiline
            rows={3}
            value={editingTodo ? todos.find(t => t.id === editingTodo).description : newTodo.description}
            onChange={(e) => {
              if (editingTodo) {
                setTodos(todos.map(t => 
                  t.id === editingTodo ? { ...t, description: e.target.value } : t
                ));
              } else {
                setNewTodo({ ...newTodo, description: e.target.value });
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            {editingTodo ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleUpdateTodo(editingTodo);
                    setEditingTodo(null);
                  }}
                >
                  Сохранить
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setEditingTodo(null);
                    setNewTodo({ title: '', description: '' });
                  }}
                >
                  Отмена
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddTodo}
              >
                Добавить задачу
              </Button>
            )}
          </Box>
        </Box>

        <List>
          {todos.map((todo) => (
            <ListItem
              key={todo.id}
              sx={{
                bgcolor: 'background.paper',
                mb: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton edge="end" onClick={() => handleDeleteTodo(todo.id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => {
                    setEditingTodo(todo.id);
                    setNewTodo({ title: todo.title, description: todo.description });
                  }}>
                    <EditIcon />
                  </IconButton>
                </Box>
              }
            >
              <Checkbox
                edge="start"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo)}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText
                primary={todo.title}
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        {todo.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        Создано: {formatTime(todo.created_at)}
                      </Typography>
                      {todo.completed && todo.completed_at && (
                        <Typography variant="caption" color="success.main">
                          Выполнено: {formatTime(todo.completed_at)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                }
                sx={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? 'text.secondary' : 'text.primary'
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Snackbar 
        open={alert.open} 
        autoHideDuration={3000} 
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert 
          onClose={() => setAlert({ ...alert, open: false })} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App; 