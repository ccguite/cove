'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import './page.css';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const NEIGHBORHOOD_OPTIONS = [
  { id: 'chanmari', name: 'Chanmari' },
  { id: 'dawrpui', name: 'Dawrpui' },
  { id: 'zarkawt', name: 'Zarkawt' },
  { id: 'ramhlun', name: 'Ramhlun' },
  { id: 'bawngkawn', name: 'Bawngkawn' },
  { id: 'khatla', name: 'Khatla' },
  { id: 'maubawk', name: 'Maubawk' },
  { id: 'melthum', name: 'Melthum' },
  { id: 'sihphir', name: 'Sihphir' },
];

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'takeaway' | 'delivery'>('takeaway');
  const [neighborhood, setNeighborhood] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingRadius, setCheckingRadius] = useState<boolean>(false);
  const [radiusError, setRadiusError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const supabase = createSupabaseBrowserClient();

  // Load cart and check auth state on mount
  useEffect(() => {
    // 1. Get cart items
    try {
      const cartData = localStorage.getItem('cove-cafe-cart');
      if (cartData) {
        setCart(JSON.parse(cartData) || []);
      }
    } catch {}

    // 2. Get active session
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthChecked(true);
    };
    checkAuth();

    // 3. Load Razorpay SDK Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [supabase]);

  // Handle quantity updates
  const updateQty = (itemId: string, increment: boolean) => {
    const newCart = [...cart];
    const index = newCart.findIndex((i) => i.id === itemId);
    if (index !== -1) {
      if (increment) {
        newCart[index].qty += 1;
      } else {
        if (newCart[index].qty <= 1) {
          newCart.splice(index, 1);
        } else {
          newCart[index].qty -= 1;
        }
      }
      setCart(newCart);
      localStorage.setItem('cove-cafe-cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event('cove-cart-update'));
    }
  };

  // Remove item entirely
  const removeItem = (itemId: string) => {
    const newCart = cart.filter((item) => item.id !== itemId);
    setCart(newCart);
    localStorage.setItem('cove-cafe-cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cove-cart-update'));
  };

  // Check delivery radius via API when neighborhood changes
  const handleNeighborhoodChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nhId = e.target.value;
    setNeighborhood(nhId);
    setRadiusError(null);

    if (!nhId) return;

    setCheckingRadius(true);
    try {
      const res = await fetch('/api/orders/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neighborhoodId: nhId }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        setRadiusError(result.error || 'Failed to validate delivery address');
      } else if (result.data && !result.data.isValid) {
        setRadiusError(`Selected address falls outside our 5km delivery radius (${result.data.distanceKm}km)`);
      }
    } catch {
      setRadiusError('Failed to connect to address validation service');
    } finally {
      setCheckingRadius(false);
    }
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = Math.round(subtotal * 0.05); // 5% flat GST
  const deliveryFee = orderType === 'delivery' ? 50 : 0;
  const grandTotal = subtotal + tax + deliveryFee;

  // Checkout eligibility guards
  const isDelivery = orderType === 'delivery';
  const deliveryInvalid = isDelivery && (!neighborhood || !streetAddress || !!radiusError);
  const deliveryMinError = isDelivery && subtotal < 299;
  const isCheckoutDisabled = cart.length === 0 || loading || checkingRadius || deliveryInvalid || deliveryMinError;

  const handleCheckout = async () => {
    if (isCheckoutDisabled) return;

    // Redirect to login if unauthorized
    if (!session) {
      router.push('/login?next=/cart');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on server
      const payload = {
        type: orderType,
        items: cart.map((i) => ({ id: i.id, qty: i.qty })),
        deliveryAddress: isDelivery
          ? { neighborhoodId: neighborhood, streetAddress }
          : null,
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        alert(result.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      const orderData = result.data;

      // 2. Open Razorpay payment gateway or bypass for mock orders
      if (orderData.razorpayOrderId && orderData.razorpayOrderId.startsWith('order_mock_')) {
        const webhookRes = await fetch('/api/razorpay/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-razorpay-signature': 'mock_signature',
          },
          body: JSON.stringify({
            event: 'payment.captured',
            payload: {
              payment: {
                entity: {
                  order_id: orderData.razorpayOrderId,
                },
              },
            },
          }),
        });

        if (!webhookRes.ok) {
          throw new Error('Mock payment validation failed.');
        }

        // Success: Clear cart and redirect
        localStorage.removeItem('cove-cafe-cart');
        window.dispatchEvent(new Event('cove-cart-update'));
        router.push(`/cart/confirmation?orderId=${orderData.orderId}`);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'COVE Café & Lounge',
        description: 'Food Order Payment',
        order_id: orderData.razorpayOrderId,
        handler: function () {
          // Success: Clear cart and redirect
          localStorage.removeItem('cove-cafe-cart');
          window.dispatchEvent(new Event('cove-cart-update'));
          router.push(`/cart/confirmation?orderId=${orderData.orderId}`);
        },
        prefill: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          contact: orderData.customerPhone,
        },
        theme: {
          color: '#4A3428', // Espresso Brand Color
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Checkout error:', err);
      alert('An unexpected error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return <div className="cart-page-loader">Checking session...</div>;
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-page-title">Your Order Cart</h1>

        {cart.length === 0 ? (
          <div className="cart-empty-state">
            <span className="material-symbols-outlined empty-icon">shopping_bag</span>
            <p className="empty-text">Your cart is currently empty.</p>
            <Link href="/menu" className="btn-browse-menu">
              Browse Our Menu
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* Left side: Items lists */}
            <div className="cart-items-panel">
              <h2 className="panel-title">Selected Items</h2>
              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-unit-price">₹{item.price} each</span>
                    </div>

                    <div className="item-actions">
                      <div className="cart-qty-adjuster">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, false)}
                          className="btn-qty-btn"
                          aria-label="Decrease quantity"
                        >
                          <span className="material-symbols-outlined">remove</span>
                        </button>
                        <span className="qty-display">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, true)}
                          className="btn-qty-btn"
                          aria-label="Increase quantity"
                        >
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>

                      <span className="item-total-price">₹{item.price * item.qty}</span>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="btn-remove-item"
                        aria-label="Remove item"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Delivery Info & pricing */}
            <div className="cart-checkout-panel">
              <h2 className="panel-title">Checkout &amp; Fulfillment</h2>

              {/* Takeaway vs Delivery Toggle */}
              <div className="fulfillment-selector">
                <button
                  type="button"
                  onClick={() => {
                    setOrderType('takeaway');
                    setRadiusError(null);
                  }}
                  className={`fulfillment-tab-btn ${orderType === 'takeaway' ? 'active' : ''}`}
                >
                  <span className="material-symbols-outlined">storefront</span>
                  Takeaway
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`fulfillment-tab-btn ${orderType === 'delivery' ? 'active' : ''}`}
                >
                  <span className="material-symbols-outlined">local_shipping</span>
                  Delivery
                </button>
              </div>

              {/* Delivery Address fields */}
              {orderType === 'delivery' && (
                <div className="delivery-address-form fade-in">
                  <div className="form-group">
                    <label htmlFor="neighborhood" className="form-label">
                      Neighborhood (Aizawl Area)
                    </label>
                    <select
                      id="neighborhood"
                      className="form-select-field"
                      value={neighborhood}
                      onChange={handleNeighborhoodChange}
                      required
                    >
                      <option value="">Select your neighborhood...</option>
                      {NEIGHBORHOOD_OPTIONS.map((nh) => (
                        <option key={nh.id} value={nh.id}>
                          {nh.name}
                        </option>
                      ))}
                    </select>
                    {checkingRadius && (
                      <span className="validation-helper checking">Checking distance...</span>
                    )}
                    {radiusError && (
                      <span className="validation-helper error">{radiusError}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="street" className="form-label">
                      Street Address / House Details
                    </label>
                    <input
                      id="street"
                      type="text"
                      className="form-input-field"
                      placeholder="House number, Landmark, Street"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Ledger breakdown */}
              <div className="pricing-ledger">
                <div className="ledger-row">
                  <span className="ledger-label">Subtotal</span>
                  <span className="ledger-val">₹{subtotal}</span>
                </div>
                <div className="ledger-row">
                  <span className="ledger-label">GST Tax (5%)</span>
                  <span className="ledger-val">₹{tax}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="ledger-row">
                    <span className="ledger-label">Delivery Fee</span>
                    <span className="ledger-val">₹50</span>
                  </div>
                )}
                <div className="ledger-divider"></div>
                <div className="ledger-row grand-total">
                  <span className="ledger-label">Grand Total</span>
                  <span className="ledger-val">₹{grandTotal}</span>
                </div>
              </div>

              {/* Errors & Alerts */}
              {orderType === 'delivery' && deliveryMinError && (
                <p className="checkout-alert-error" role="alert">
                  * Delivery orders require a minimum subtotal of ₹299. Add ₹{299 - subtotal} more to checkout.
                </p>
              )}

              {/* Checkout Button */}
              {session ? (
                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutDisabled}
                  className="btn-checkout-submit"
                >
                  {loading ? 'Processing Payment...' : 'Proceed to Payment'}
                </button>
              ) : (
                <Link
                  href="/login?next=/cart"
                  className="btn-checkout-login"
                  style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
                >
                  Sign In to Place Order
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
