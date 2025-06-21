import axios from 'axios';
import Cookies from 'js-cookie'

const API_BASE_URL = 'http://localhost:8000/api'; 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Разрешает Axios отправлять и получать куки с запросами
});

axiosInstance.interceptors.request.use(function (config) { // Перехватчик запросов (позволяет добавить CSRF-токен)
  const csrfToken = Cookies.get('csrftoken'); // Получаем CSRF-токен из кукисов

//   if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) { // Для методов post put patch delete помещаем CSRF-токен в заголовок X-CSRFToken
//     config.headers['X-CSRFToken'] = csrfToken;
//   }
    config.headers['X-CSRFToken'] = csrfToken; // Пусть csrf-токен ставится всегда, вряд ли это как-то навредит
  return config; 
}, function (error) {
  return Promise.reject(error);
});

export default axiosInstance;