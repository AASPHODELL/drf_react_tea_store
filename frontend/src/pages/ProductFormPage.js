import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const ProductFormPage = () => {
  const [formData, setFormData] = useState({
    product_name: '',
    product_price: '',
    product_quantity: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Состояние загрузки данных для редактирования
  const navigate = useNavigate();
  const { id } = useParams(); // Получаем id из URL для режима редактирования

  useEffect(() => {
    if (id) { // Если id есть в URL, значит, мы в режиме редактирования - загружаем данные товара
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(`/cartitems/${id}/`);
          setFormData({
            product_name: response.data.product_name,
            product_price: response.data.product_price,
            product_quantity: response.data.product_quantity,
          });
          setError(null);
        } catch (err) {
          console.error("Ошибка при загрузке объявления:", err);
          setError('Не удалось загрузить данные объявления для редактирования. Возможно, у вас нет к нему доступа.');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
      setLoading(false); // Для режима создания нет загрузки данных, сразу показываем форму
    }
  }, [id]); // Зависимость от id, чтобы эффект срабатывал при его изменении (например, при переходе с /new на /edit/1)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Сбрасываем предыдущие ошибки

    try {
      if (id) {
        // Режим редактирования: PUT-запрос
        await axiosInstance.put(`/cartitems/${id}/`, formData);
        alert('Объявление успешно обновлено!');
      } else {
        // Режим создания: POST-запрос
        await axiosInstance.post('/cartitems/', formData);
        alert('Объявление успешно добавлено!');
      }
      navigate('/'); // Перенаправляем на главную страницу после успешного сохранения
    } catch (err) {
      console.error("Ошибка при сохранении объявления:", err.response?.data || err);
      // Отображаем ошибки валидации с бэкенда
      if (err.response && err.response.data) {
        let errorMessages = [];
        for (const key in err.response.data) {
          errorMessages.push(`${key}: ${err.response.data[key].join(', ')}`);
        }
        setError(errorMessages.join('\n'));
      } else {
        setError('Произошла ошибка при сохранении объявления.');
      }
    }
  };

  // Показываем сообщение о загрузке только если мы в режиме редактирования и ждем данные
  if (loading && id) { 
    return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка данных объявления...</div>;
  }
  // Если мы в режиме редактирования, но загрузка завершилась с ошибкой и нет данных
  if (id && !loading && error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
  }


  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{id ? 'Редактировать объявление' : 'Добавить новое объявление'}</h2>
      {error && <pre style={{ color: 'red', whiteSpace: 'pre-wrap', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</pre>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="product_name" style={{ display: 'block', marginBottom: '5px' }}>Название чая:</label>
          <input
            type="text"
            id="product_name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="product_price" style={{ display: 'block', marginBottom: '5px' }}>Цена (₽):</label>
          <input
            type="number"
            id="product_price"
            name="product_price"
            value={formData.product_price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="product_quantity" style={{ display: 'block', marginBottom: '5px' }}>Количество (шт.):</label>
          <input
            type="number"
            id="product_quantity"
            name="product_quantity"
            value={formData.product_quantity}
            onChange={handleChange}
            required
            min="1"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {id ? 'Сохранить изменения' : 'Добавить объявление'}
        </button>
      </form>
    </div>
  );
};

export default ProductFormPage;