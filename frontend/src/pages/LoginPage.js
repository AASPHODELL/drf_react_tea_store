import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({ // Наполнение формы логина
    username: '',
    password: '',
  });
  const [error, setError] = useState(''); // Для отображения ошибок входа
  const { login, isAuthenticated } = useAuth(); // Получаем функцию login и статус isAuthenticated
  const navigate = useNavigate();

  // Если пользователь уже авторизован, перенаправляем на главную страницу
  if (isAuthenticated) {
    navigate('/');
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Сброс предыдущих ошибок

    const result = await login(formData.username, formData.password);

    if (result.success) {
      // Если вход успешен, useAuth уже обновил isAuthenticated и user, и компонент автоматически перенаправит
      console.log('Вход выполнен успешно!');
    } else {
      setError(result.error || 'Ошибка входа. Пожалуйста, проверьте учетные данные.');
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Вход</h2>
      {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Имя пользователя:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Пароль:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Войти
        </button>
      </form>
    </div>
  );
};

export default LoginPage;