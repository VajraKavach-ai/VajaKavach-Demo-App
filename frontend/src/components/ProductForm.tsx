import { useState, type ChangeEvent, type FormEvent } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
}

const ProductForm = ({ product, onClose }: ProductFormProps) => {
  const [form, setForm] = useState<Omit<Product, 'id'>>(
    product ?? { name: '', price: 0, description: '', image: '' }
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (product) {
      try {
        const res = await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, password }),
        });
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || 'Update failed');
          return;
        }
      } catch {
        setError('Update failed');
        return;
      }
    }
    onClose();
  };

  return (
    <div className="vk-modal">
      <form className="vk-product-form" onSubmit={handleSubmit}>
        <h2>{product ? 'Edit' : 'Add'} Product</h2>
        <label>Name:<input name="name" value={form.name} onChange={handleChange} required /></label>
        <label>Description:<textarea name="description" value={form.description} onChange={handleChange} required /></label>
        <label>Price:<input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required /></label>
        <label>Image URL:<input name="image" value={form.image} onChange={handleChange} /></label>
        {product && (
          <label>Admin Password:<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
        )}
        {error && <p className="vk-form-error">{error}</p>}
        <div className="vk-form-actions">
          <button type="submit">{product ? 'Update' : 'Add'}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
