import React, { useState, useEffect } from 'react';
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
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const API_URL = 'http://localhost:8000';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
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
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      showAlert('Ошибка при загрузке задач', 'error');
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) {
      showAlert('Введите название задачи', 'warning');
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/todos`, newTodo);
      setTodos([response.data, ...todos]);
      setNewTodo({ title: '', description: '' });
      showAlert('Задача добавлена', 'success');
    } catch (error) {
      console.error('Error adding todo:', error);
      showAlert('Ошибка при добавлении задачи', 'error');
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
            label="Название задачи"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Описание"
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTodo}
            fullWidth
          >
            Добавить задачу
          </Button>
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
            >
              <Checkbox
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo)}
              />
              <ListItemText
                primary={todo.title}
                secondary={todo.description}
                sx={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? 'text.secondary' : 'text.primary'
                }}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
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