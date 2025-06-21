import React, { useEffect, useState, useCallback  } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [ordering, setOrdering] = useState('');

  const fetchProducts = useCallback(async () => { // Функция для загрузки объявлений
    try {
      setLoading(true);
      setError(null);

      // Формируем параметры запроса
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (minPrice) {
        params.append('product_price__gte', minPrice);
      }
      if (maxPrice) {
        params.append('product_price__lte', maxPrice);
      }
      if (ordering) {
        params.append('ordering', ordering);
      }

      const url = `/cartitems/?${params.toString()}`; // Формируем URL с параметрами
      const response = await axiosInstance.get(url);
      setProducts(response.data.results);
    } catch (err) {
      console.error("Ошибка при получении списка объявлений:", err);
      setError('Не удалось загрузить список объявлений. Пожалуйста, попробуйте позже.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, minPrice, maxPrice, ordering]);

  useEffect(() => {
    fetchProducts(); // Запускается при монтировании

    const ws = new WebSocket('ws://localhost:8000/ws/products/'); 

    ws.onopen = () => {
        console.log('WebSocket Connected');
      };

    ws.onmessage = (event) => {
        const productData = JSON.parse(event.data); // При получении сообщения, разбираем JSON
        console.log('Received product update:', productData);

        setProducts(prevProducts => {
          const existingProductIndex = prevProducts.findIndex(p => p.id === productData.id);
          if (existingProductIndex > -1) {
            // Если товар найден, обновляем его
            const updatedProducts = [...prevProducts];
            updatedProducts[existingProductIndex] = productData; // Заменяем старые данные на новые
            return updatedProducts;
          } else {
            // Если товар не найден (например, был только что создан), добавляем его
            return [productData, ...prevProducts]; // Добавляем новый товар в начало списка
          }
        });
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      return () => {
        ws.close(); // Очистка: закрываем WebSocket-соединение при размонтировании компонента
      };
    }, [fetchProducts]);

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

  if (loading && products.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка объявлений...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Чайная Барахолка: Все Объявления</h2>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f0f0f0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label htmlFor="search" style={{ display: 'block', marginBottom: '5px' }}>Поиск по названию:</label>
            <input
              type="text"
              id="search"
              placeholder="Введите название чая"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Цена от:</label>
            <input
              type="number"
              placeholder="Мин. цена"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              min="0"
            />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Цена до:</label>
            <input
              type="number"
              placeholder="Макс. цена"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              min="0"
            />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label htmlFor="sort" style={{ display: 'block', marginBottom: '5px' }}>Сортировать по:</label>
            <select
              id="sort"
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">По умолчанию</option>
              <option value="product_name">Названию (А-Я)</option>
              <option value="-product_name">Названию (Я-А)</option>
              <option value="product_price">Цене (возр.)</option>
              <option value="-product_price">Цене (убыв.)</option>
              <option value="product_quantity">Количеству (возр.)</option>
              <option value="-product_quantity">Количеству (убыв.)</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={fetchProducts} // Теперь можно просто вызывать fetchProducts
            style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Применить
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setMinPrice('');
              setMaxPrice('');
              setOrdering('');
            }}
            style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Сбросить
          </button>
        </div>
      </div>

      <hr style={{ margin: '20px 0' }} />

      {products.length === 0 && !loading ? (
        <p style={{ textAlign: 'center' }}>Объявлений по заданным критериям не найдено.</p>
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
                <strong style={{ color: '#000' }}>В наличии:</strong> <span id={`quantity-${product.id}`}>{product.product_quantity}</span> шт.
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