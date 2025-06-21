import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Импортируем провайдер и хук аутентификации

// Импортируем компоненты страниц-заглушек
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';

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

// Компонент для навигации ---
const NavBar = () => {
  const { isAuthenticated, logout, user } = useAuth(); // Получаем статус, функцию выхода и данные пользователя

  return (
    <nav style={{ padding: '10px', background: '#f0f0f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
      <Link to="/" style={{ marginRight: '15px' }}>Главная</Link>
      <Link to="/cart" style={{ marginRight: '15px' }}>Корзина</Link>
      {isAuthenticated ? ( // Если пользователь авторизован
        <>
          {/* Ссылка на профиль с именем пользователя */}
          <Link to="/profile" style={{ marginRight: '15px' }}>Привет, {user?.username}!</Link>
          {/* Кнопка выхода */}
          <button onClick={logout} style={{ marginRight: '15px', padding: '5px 10px', cursor: 'pointer' }}>Выйти</button>
        </>
      ) : ( // Если пользователь не авторизован
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
    <Router> {/* BrowserRouter оборачивает все маршруты */}
      <AuthProvider> {/* AuthProvider предоставляет контекст аутентификации */}
        <NavBar /> {/* Панель навигации */}
        <div style={{ padding: '20px' }}>
          <Routes> {/* Routes определяет, какой компонент будет отображен в зависимости от URL */}
            <Route path="/" element={<HomePage />} /> {/* Главная страница */}
            <Route path="/login" element={<LoginPage />} /> {/* Страница входа */}
            <Route path="/register" element={<RegisterPage />} /> {/* Страница регистрации */}
            
            {/* Защищенные маршруты. PrivateRoute решит, показывать ли CartPage/ProfilePage */}
            <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;