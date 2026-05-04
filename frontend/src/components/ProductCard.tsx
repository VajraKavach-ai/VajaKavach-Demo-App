import './ProductCard.css';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  onAddToCart: () => void;
}

const ProductCard = ({ name, price, description, image, onAddToCart }: ProductCardProps) => (
  <div className="vk-product-card">
    <img src={image || '/placeholder.png'} alt={name} className="vk-product-image" />
    <div className="vk-product-info">
      <h3>{name}</h3>
      <p className="vk-product-desc">{description}</p>
      <div className="vk-product-bottom">
        <span className="vk-product-price">${price.toFixed(2)}</span>
        <button className="vk-add-to-cart" onClick={onAddToCart}>Add to Cart</button>
      </div>
    </div>
  </div>
);

export default ProductCard;
