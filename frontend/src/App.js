import './App.css';
import axios from 'axios';
import React from 'react';

class App extends React.Component {
  state = {
    details: [],
    loading: true,
    error: null,
  }

  componentDidMount() {
    const API_URL = 'http://localhost:8000/api/cartitems/';

    axios.get(API_URL)
      .then(res => {
        this.setState({
          details: res.data.results,
          loading: false,
        });
      })
      .catch(err => {
        console.error("Ошибка при получении данных:", err);
        this.setState({
          error: 'Не удалось загрузить товары корзины. Проверьте консоль для деталей.',
          loading: false,
        });
      });
  }

  render() {
    const { details, loading, error } = this.state;

    if (loading) {
      return <div>Загрузка товаров...</div>;
    }

    if (error) {
      return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
      <div style={{ padding: '20px' }}>
        <header><h1>Данные из Django: Товары в корзине</h1></header>
        <hr />
        {details.length === 0 ? (
          <p>Корзина пуста.</p>
        ) : (
          <ul>
            {details.map((output) => (
              <li key={output.id} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}>
                <h2>Название: {output.product_name}</h2>
                <p>Цена: {output.product_price} руб./шт</p>
                <p>Количество: {output.product_quantity} шт.</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default App;