import ProductCard from './ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductList = ({ products, onAddToCart }: ProductListProps) => (
  <div className="vk-product-list">
    {products.length === 0 ? (
      <p className="vk-empty">No products found.</p>
    ) : (
      <div className="vk-product-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            description={product.description}
            image={product.image}
            onAddToCart={() => onAddToCart(product)}
          />
        ))}
      </div>
    )}
  </div>
);

export default ProductList;
