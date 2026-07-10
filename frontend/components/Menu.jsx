import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get('/api/menu');
        setMenuItems(response.data);
      } catch (err) {
        console.error('Error fetching menu items', err);
      }
    };
    fetchMenu();
  }, []);

  const filteredItems = category === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === category);

  return (
    <section className="menu-section">
      <div className="tabs">
        {['all', 'breakfast', 'lunch', 'dinner', 'drinks'].map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategory(cat)}
            className={category === cat ? 'active' : ''}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="menu-item">
            <h3>{item.name}</h3>
            <span>{item.price}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Menu;
