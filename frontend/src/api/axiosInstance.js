import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Разрешает Axios отправлять и получать куки с запросами
});

axiosInstance.interceptors.request.use(function (config) { // Перехватчик запросов (позволяет добавить CSRF-токен)
  const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]; // Получаем CSRF-токен из куки браузера

  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) { // Для методов post put patch delete помещаем CSRF-токен в заголовок X-CSRFToken
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

export default axiosInstance;