import { useState, type FormEvent } from 'react';
import './Cart.css';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartProps {
  items: CartItem[];
  onRemove: (id: number) => void;
  onCheckout: () => void;
}

interface OrderConfirmation {
  userName: string;
  userAddress: string;
  deliveryDate: string;
  items: { name: string; quantity: number; price: number }[];
}

const Cart = ({ items, onRemove, onCheckout }: CartProps) => {
  const [checkingOut, setCheckingOut] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      let lastDeliveryDate = '';
      const orderedItems: OrderConfirmation['items'] = [];
      for (const item of items) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.id, quantity: item.quantity, user: { name, address } }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Order failed for ${item.name}`);
        }
        const data = await res.json();
        lastDeliveryDate = data.order.deliveryDate;
        orderedItems.push({ name: item.name, quantity: item.quantity, price: item.price });
      }
      setConfirmation({
        userName: name,
        userAddress: address,
        deliveryDate: lastDeliveryDate,
        items: orderedItems,
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Checkout failed');
    }
  };

  const handleDismissConfirmation = () => {
    onCheckout();
    setCheckingOut(false);
    setStatus('idle');
    setName('');
    setAddress('');
    setConfirmation(null);
  };

  if (items.length === 0 && !confirmation) {
    return (
      <div className="vk-cart">
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="vk-cart">
        <div className="vk-order-confirmation">
          <h2>Order Confirmed!</h2>
          <div className="vk-confirmation-details">
            <div className="vk-confirmation-row">
              <span className="vk-confirmation-label">Customer</span>
              <span className="vk-confirmation-value">{confirmation.userName}</span>
            </div>
            <div className="vk-confirmation-row">
              <span className="vk-confirmation-label">Delivery Address</span>
              <span className="vk-confirmation-value">{confirmation.userAddress}</span>
            </div>
            <div className="vk-confirmation-row">
              <span className="vk-confirmation-label">Estimated Delivery</span>
              <span className="vk-confirmation-value">
                {new Date(confirmation.deliveryDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="vk-confirmation-items">
              <span className="vk-confirmation-label">Items Ordered</span>
              <ul>
                {confirmation.items.map((item, i) => (
                  <li key={i}>
                    {item.name} x{item.quantity} — ${(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button className="vk-cart-checkout" onClick={handleDismissConfirmation}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vk-cart">
      <h2>Your Cart</h2>
      <ul className="vk-cart-list">
        {items.map(item => (
          <li key={item.id} className="vk-cart-item">
            <img src={item.image || '/placeholder.png'} alt={item.name} className="vk-cart-item-image" />
            <div className="vk-cart-item-info">
              <span>{item.name}</span>
              <span>Qty: {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <button onClick={() => onRemove(item.id)} className="vk-cart-remove">Remove</button>
          </li>
        ))}
      </ul>
      <div className="vk-cart-total">Total: ${total.toFixed(2)}</div>

      {!checkingOut ? (
        <button className="vk-cart-checkout" onClick={() => setCheckingOut(true)}>Checkout</button>
      ) : (
        <form className="vk-checkout-form" onSubmit={handleSubmit}>
          <h3>Shipping Details</h3>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Delivery Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
          />
          {status === 'error' && <p className="vk-checkout-error">{errorMsg}</p>}
          <div className="vk-checkout-actions">
            <button type="button" onClick={() => setCheckingOut(false)} disabled={status === 'loading'}>
              Cancel
            </button>
            <button type="submit" className="vk-cart-checkout" disabled={status === 'loading'}>
              {status === 'loading' ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Cart;
