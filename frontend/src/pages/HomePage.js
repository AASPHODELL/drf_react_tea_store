import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const HomePage = () => { 
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
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

    fetchProducts();
  }, []);

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
                <strong style={{ color: '#000' }}>Продавец:</strong> {product.user_username || 'Неизвестно'}
              </p>
              <p style={{ margin: '0 0 5px 0', color: '#555' }}>
                <strong style={{ color: '#000' }}>Цена:</strong> {product.product_price} ₽
              </p>
              <p style={{ margin: '0 0 10px 0', color: '#555' }}>
                <strong style={{ color: '#000' }}>В наличии:</strong> {product.product_quantity} шт.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;