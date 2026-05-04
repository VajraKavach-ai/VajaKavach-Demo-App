import { useState, useEffect } from 'react';
import AdminProductTable from '../components/AdminProductTable';
import ProductForm from '../components/ProductForm';
import './AdminPage.css';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (_id: number) => {
    alert('Delete is not supported in this demo API.');
  };

  const handleFormClose = () => {
    setEditingProduct(null);
    setShowForm(false);
    fetchProducts();
  };

  return (
    <div className="vk-admin-page">
      <h1>Admin: Product Management</h1>
      <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="vk-admin-add">Add Product</button>
      <AdminProductTable products={products} onEdit={handleEdit} onDelete={handleDelete} />
      {showForm && (
        <ProductForm product={editingProduct} onClose={handleFormClose} />
      )}
    </div>
  );
};

export default AdminPage;
