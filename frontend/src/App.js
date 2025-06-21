import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Импортируем провайдер и хук аутентификации

// Импортируем компоненты страниц-заглушек
import HomePage from './pages/HomePage'; 
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ProductFormPage from './pages/ProductFormPage';

// Компонент, который решает: отображать маршрут, или перенаправлять пользователя на страницу входа 
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // Получаем статус аутентификации из контекста

  // Сообщение - заглужка при проверке аутентификации
  if (loading) {
    return <div>Загрузка аутентификации...</div>; 
  }

  // Если пользователь аутентифицирован, показываем дочерние компоненты, иначе - перенаправляем на страницу входа
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Компонент для навигации
const NavBar = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav style={{ padding: '10px', background: '#f0f0f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
      <Link to="/" style={{ marginRight: '15px' }}>Главная (Объявления)</Link>
      {isAuthenticated ? (
        <>
          <Link to="/profile" style={{ marginRight: '15px' }}>Привет, {user?.username}!</Link>
          <Link to="/products/new" style={{ marginRight: '15px' }}>Добавить объявление</Link>
          <button onClick={logout} style={{ marginRight: '15px', padding: '5px 10px', cursor: 'pointer' }}>Выйти</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: '15px' }}>Войти</Link>
          <Link to="/register" style={{ marginRight: '15px' }}>Регистрация</Link>
        </>
      )}
    </nav>
  );
};

// Основной компонент App
function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Защищенные маршруты */}
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            {/* Маршрут для создания нового объявления */}
            <Route path="/products/new" element={<PrivateRoute><ProductFormPage /></PrivateRoute>} />
            {/* Маршрут для редактирования существующего объявления, :id - это параметр URL */}
            <Route path="/products/edit/:id" element={<PrivateRoute><ProductFormPage /></PrivateRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;