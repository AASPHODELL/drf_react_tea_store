// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => { // Функция для загрузки объявлений
    try {
      setLoading(true); 
      const response = await axiosInstance.get('/cartitems/');
      setProducts(response.data.results);
      setError(null); 
    } catch (err) {
      console.error("Ошибка при получении списка объявлений:", err);
      setError('Не удалось загрузить список объявлений. Пожалуйста, попробуйте позже.');
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(); // Запускается при монтировании
  }, []); // Пустой массив зависимостей означает, что эффект запустится один раз при монтировании


  const handleDelete = async (productId) => {  // Функция для обработки удаления объявления
    if (window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      try {
        await axiosInstance.delete(`/cartitems/${productId}/`); 
        alert('Объявление успешно удалено!');
        fetchProducts(); // Перезагружаем список объявлений после удаления
      } catch (err) {
        console.error("Ошибка при удалении объявления:", err.response?.data || err);
        alert('Не удалось удалить объявление. Убедитесь, что вы являетесь его владельцем.');
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка объявлений...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Чайная Барахолка: Все Объявления</h2>
      <hr />
      {products.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Объявлений пока нет. Станьте первым, кто добавит чай на продажу!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {products.map((product) => (
            <div key={product.id} style={{ 
              marginBottom: '15px', 
              padding: '15px', 
              border: '1px solid #eee', 
              borderRadius: '8px', 
              backgroundColor: '#f9f9f9',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1.2em' }}>{product.product_name}</h3>
              <p style={{ margin: '0 0 5px 0', color: '#555' }}>
                <strong style={{ color: '#000' }}>Продавец:</strong> {product.author || 'Неизвестно'}
              </p>
              <p style={{ margin: '0 0 5px 0', color: '#555' }}>
                <strong style={{ color: '#000' }}>Цена:</strong> {product.product_price} ₽
              </p>
              <p style={{ margin: '0 0 10px 0', color: '#555' }}>
                <strong style={{ color: '#000' }}>В наличии:</strong> {product.product_quantity} шт.
              </p>

              {isAuthenticated && user && user.id === product.author && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    style={{ 
                      flex: 1,
                      padding: '8px 12px', 
                      background: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    style={{ 
                      flex: 1,
                      padding: '8px 12px', 
                      background: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;