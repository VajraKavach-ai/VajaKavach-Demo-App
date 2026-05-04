import { useState, useEffect } from 'react';
import ProductList from './ProductList';
import SearchBar from './SearchBar';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface HomePageProps {
  onAddToCart: (product: Product) => void;
}

const HomePage = ({ onAddToCart }: HomePageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="vk-home-page">
      <SearchBar value={search} onChange={setSearch} />
      {loading ? <p className="vk-loading">Loading...</p> : <ProductList products={filtered} onAddToCart={onAddToCart} />}
    </div>
  );
};

export default HomePage;
