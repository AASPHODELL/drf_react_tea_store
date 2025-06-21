import React from 'react';
import { useAuth } from '../context/AuthContext'; // Импортируем наш хук useAuth

const ProfilePage = () => {
  const { user, loading } = useAuth(); // Получаем данные пользователя, статус загрузки и аутентификации

  // Пока данные загружаются или пользователь не авторизован (хотя PrivateRoute должен это обработать)
  if (loading) {
    return <div>Загрузка профиля...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Профиль Пользователя</h2>
      <p><strong>Имя пользователя:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Имя:</strong> {user.first_name || 'Не указано'}</p>
      <p><strong>Фамилия:</strong> {user.last_name || 'Не указано'}</p>
    </div>
  );
};

export default ProfilePage;