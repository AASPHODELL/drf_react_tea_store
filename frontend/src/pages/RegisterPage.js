import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom'; 

const RegisterPage = () => {
  const [formData, setFormData] = useState({ // Поля формы для регистрации 
    username: '',
    email: '',
    password: '',
    password2: '', 
    first_name: '',
    last_name: '',
  });
  const [generalError, setGeneralError] = useState(''); // Ошибки
  const { register } = useAuth(); // Получаем функцию register из AuthContext
  const navigate = useNavigate(); // Инициализируем хук навигации

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Обновляем соответствующее поле в состоянии formData
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы (перезагрузку страницы)
    setGeneralError(''); // Сбрасываем предыдущую общую ошибку

    // Вызываем функцию register из AuthContext, передавая ей данные формы
    const result = await register(formData);

    if (result.success) {
      alert('Регистрация прошла успешно! Теперь вы можете войти.');
      navigate('/login');
    } else {
      // Если регистрация не удалась, формируем одно общее сообщение об ошибке.
      // Можно взять первое попавшееся сообщение из ошибок Django или стандартное.
      let errorMessage = 'Произошла ошибка при регистрации.';

      if (result.errors) {
        // Проверяем, есть ли общие ошибки (например, non_field_errors)
        if (result.errors.non_field_errors) {
          errorMessage = result.errors.non_field_errors[0];
        } else {
          // Ищем первую ошибку в любом поле, если общих нет
          for (const key in result.errors) {
            if (Array.isArray(result.errors[key]) && result.errors[key].length > 0) {
              errorMessage = result.errors[key][0];
              break; // Берем первое сообщение и выходим
            }
          }
        }
      } else if (result.error) {
          errorMessage = result.error; // Ошибки от Axios, не связанные с валидацией
      }
      
      setGeneralError(errorMessage); // Устанавливаем общее сообщение об ошибке
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Регистрация</h2>
      {/* Отображаем общую ошибку сверху формы */}
      {generalError && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{generalError}</p>}
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

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSsizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
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

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password2" style={{ display: 'block', marginBottom: '5px' }}>Повторите пароль:</label>
          <input
            type="password"
            id="password2"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="first_name" style={{ display: 'block', marginBottom: '5px' }}>Имя:</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="last_name" style={{ display: 'block', marginBottom: '5px' }}>Фамилия:</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;