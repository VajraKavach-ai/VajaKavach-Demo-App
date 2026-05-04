import { Link } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  cartCount: number;
}

const Navbar = ({ cartCount }: NavbarProps) => (
  <nav className="vk-navbar">
    <div className="vk-navbar-brand">
      <img src="/Aspire.png" alt="Ecommerce" className="vk-logo" />
      <span className="vk-title">Ecommerce Demo</span>
    </div>
    <ul className="vk-navbar-links">
      <li><Link to="/">Shop</Link></li>
      <li><Link to="/admin">Admin</Link></li>
      <li className="vk-cart-link">
        <Link to="/cart">
          <span role="img" aria-label="cart">🛒</span>
          {cartCount > 0 && <span className="vk-cart-count">{cartCount}</span>}
        </Link>
      </li>
    </ul>
  </nav>
);

export default Navbar;
