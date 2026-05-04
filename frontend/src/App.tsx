import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import AdminPage from './pages/AdminPage';
import Cart from './components/Cart';
import './App.css';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }];
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    setCart([]);
  };

  return (
    <Router>
      <Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />
      <Routes>
        <Route path="/" element={<HomePage onAddToCart={handleAddToCart} />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/cart" element={<Cart items={cart} onRemove={handleRemoveFromCart} onCheckout={handleCheckout} />} />
      </Routes>
    </Router>
  );
}

export default App;
