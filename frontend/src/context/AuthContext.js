import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance'; 

const AuthContext = createContext(null); 

export const AuthProvider = ({ children }) => { // Компонент для доступа к состояниям пользователя 
  const [user, setUser] = useState(null); // Состояние для хранения данных текущего пользователя
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Флаг: авторизован ли пользователь
  const [loading, setLoading] = useState(true); // Флаг: идет ли проверка статуса аутентификации


  const getCsrfToken = useCallback(async () => { // Получение CSRF-токена
    try {
      await axiosInstance.get('/'); 
      console.log('CSRF token requested and should be in cookies.');
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => { // Проверка статуса пользователя
    try {
      setLoading(true); // Начинаем загрузку
      const response = await axiosInstance.get('/users/profile/');
      setUser(response.data); // Если успешно, сохраняем данные пользователя
      setIsAuthenticated(true); // Устанавливаем флаг, что пользователь авторизован
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) { // Либо пользователь не авторизован, лио сессия истекла
        setUser(null);
        setIsAuthenticated(false);
      } else {
        console.error("Error checking auth status:", error);
      }
    } finally {
      setLoading(false); // Завершаем загрузку, независимо от результата
    }
  }, []);

  // Здесь мы получаем CSRF-токен и затем проверяем статус аутентификации
  useEffect(() => { 
    getCsrfToken(); 
    checkAuthStatus();
  }, [getCsrfToken, checkAuthStatus]);

  // Функции для взаимодействия с API аутентификации
  const login = async (username, password) => {
    try {
      await axiosInstance.post('/users/login/', { username, password });
      await checkAuthStatus(); // После успешного входа, обновим статус пользователя
      return { success: true }; // Возвращаем успех
    } catch (error) {
      console.error("Login failed:", error.response?.data || error);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.get('/users/logout/');
      setUser(null); // Очищаем данные пользователя
      setIsAuthenticated(false); // Устанавливаем флаг, что пользователь не авторизован
      await getCsrfToken(); // После выхода, возможно, потребуется новый CSRF-токен для следующих запросов
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const register = async (userData) => { // Объект userData содержит все поля из формы регистрации
    try {
      await axiosInstance.post('/users/register/', userData); // Отправляет их на эндпоинт для регистрации 
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error);
      return { success: false, errors: error.response?.data }; // Возвращаем ошибки, чтобы форма регистрации могла их отобразить
    }
  };

  // Возвращаем провайдер контекста, предоставляя значения user, isAuthenticated, loading,
  // а также функции login, logout, register всем дочерним компонентам
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Пользовательский хук для удобного доступа к контексту аутентификации в компонентах
export const useAuth = () => useContext(AuthContext);