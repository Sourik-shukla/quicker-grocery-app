import { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import api from "./api";

function Nav() {
  const user = JSON.parse(localStorage.getItem("quicker_user") || "null");
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("quicker_token");
    localStorage.removeItem("quicker_user");
    navigate("/");
  };

  return (
    <nav>
      <Link className="brand" to="/">⚡ Quicker</Link>
      <div className="navlinks">
        <Link to="/">Shop</Link>
        {user && <Link to="/orders">My Orders</Link>}
        {user && ["manager", "admin"].includes(user.role) && <Link to="/dashboard">Dashboard</Link>}
        {user ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <>
            <Link className="nav-register" to="/register">Register</Link>
            <Link className="button" to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("quicker_cart") || "[]"));

  const categories = ["All", "Vegetables", "Fruits", "Dairy", "Grains & Pulses", "Snacks", "Beverages", "Household", "Staples", "Bakery"];

  const load = async () => {
    try {
      const response = await api.get("/products", { params: { search } });
      setProducts(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

 const add = p => {
  const next = [...cart];
  const found = next.find(x => x.product === p._id);

  if (found) {
    found.quantity += 1;
  } else {
    next.push({
      product: p._id,
      name: p.name,
      price: p.price,
      quantity: 1,
      image: p.image
    });
  }

  setCart(next);
  localStorage.setItem("quicker_cart", JSON.stringify(next));
};

// Increase or decrease quantity
const updateQuantity = (productId, change) => {
  const next = cart
    .map(item =>
      item.product === productId
        ? { ...item, quantity: item.quantity + change }
        : item
    )
    .filter(item => item.quantity > 0);

  setCart(next);
  localStorage.setItem("quicker_cart", JSON.stringify(next));
};

// Remove item completely
const removeFromCart = productId => {
  const next = cart.filter(item => item.product !== productId);

  setCart(next);
  localStorage.setItem("quicker_cart", JSON.stringify(next));
};

const total = cart.reduce(
  (s, x) => s + x.price * x.quantity,
  0
);

const visibleProducts = category === "All"
  ? products
  : products.filter(p => p.category === category);

  return (
    <main className="shop-page">
      <section className="grocery-hero">
        <div>
          <p className="eyebrow">FRESH & HEALTHY</p>
          <h1>Your Daily Groceries</h1>
          <p>Everything you need, delivered fresh to your doorstep.</p>
          <button onClick={() => document.querySelector(".product-section")?.scrollIntoView({ behavior: "smooth" })}>
            Shop Now →
          </button>
        </div>
        <img
          src="/products/hero-grocery.svg"
          alt="Fresh vegetables"
          className="hero-image"
        />
      </section>

      <div className="shop-layout">
        <section className="product-section">
          <div className="section-heading">
            <div>
              <h2>Grocery Items</h2>
              <p>{visibleProducts.length} products available</p>
            </div>
            <div className="search-box">
              <input
                placeholder="Search groceries..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && load()}
              />
              <button onClick={load}>Search</button>
            </div>
          </div>

          <div className="category-tabs">
            {categories.map(c => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <section className="grid grocery-grid">
            {visibleProducts.map(p => (
              <article className="card grocery-card" key={p._id}>
                <div className="product-image-wrap">
                  <img
                    src={p.image || "/products/generic-grocery.svg"}
                    alt={p.name}
                    className="product-image"
                    loading="lazy"
                  />
                </div>
                <small>{p.category}</small>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div className="row product-price-row">
                  <b>₹{p.price}</b>
                  <span>{p.stock} left</span>
                </div>
                <button disabled={!p.stock} onClick={() => add(p)}>
                  {p.stock ? "🛒 Add to Cart" : "Out of stock"}
                </button>
              </article>
            ))}
          </section>
        </section>

        <aside className="checkout grocery-cart">
          <div className="cart-title">
            <h3>🛒 Your Cart</h3>
            <span>{cart.reduce((s, x) => s + x.quantity, 0)}</span>
          </div>
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty. Add some groceries!</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(x => (
                  <div className="cartrow cart-item" key={x.product}>
  <img
    src={x.image || "/products/generic-grocery.svg"}
    alt={x.name}
  />

  <div className="cart-item-info">
    <strong>{x.name}</strong>

    <small>₹{x.price} each</small>

    <div className="cart-quantity">
      <button
        type="button"
        onClick={() => updateQuantity(x.product, -1)}
      >
        −
      </button>

      <span>{x.quantity}</span>

      <button
        type="button"
        onClick={() => updateQuantity(x.product, 1)}
      >
        +
      </button>
    </div>
  </div>

  <div className="cart-item-actions">
    <b>₹{x.price * x.quantity}</b>

    <button
      type="button"
      className="remove-cart-item"
      onClick={() => removeFromCart(x.product)}
    >
      🗑️ Remove
    </button>
  </div>
</div>
                ))}
              </div>
              <div className="cart-total"><strong>Total</strong><strong>₹{total}</strong></div>
              <Link className="button wide" to="/checkout">Proceed to Checkout →</Link>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}

function Auth({ mode }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password };

      const r = await api.post(`/auth/${mode}`, payload);
      localStorage.setItem("quicker_token", r.data.token);
      localStorage.setItem("quicker_user", JSON.stringify(r.data.user));
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to connect to the server. Make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth-shell">
        <div className="auth-intro">
          <div className="auth-logo">⚡</div>
          <p className="eyebrow">QUICKER</p>
          <h1>{isRegister ? "Start shopping in minutes." : "Welcome back."}</h1>
          <p>
            {isRegister
              ? "Create your account and enjoy simple, fast grocery ordering."
              : "Sign in to manage your cart, orders and delivery updates."}
          </p>
          <div className="auth-points">
            <span>✓ Easy ordering</span>
            <span>✓ Live order status</span>
            <span>✓ Secure account</span>
          </div>
        </div>

        <form className="panel auth-panel" onSubmit={submit}>
          <div>
            <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
            <p className="form-subtitle">
              {isRegister ? "Fill in your details to get started." : "Enter your details to continue."}
            </p>
          </div>

          {error && <div className="error-box">{error}</div>}

          {isRegister && (
            <label>
              Full name
              <input
                placeholder="Enter your name"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label>
            Password
            <div className="password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={isRegister ? "At least 6 characters" : "Enter your password"}
                minLength={6}
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <button className="auth-submit" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
          </button>

          <div className="auth-switch">
            {isRegister ? (
              <>
                Already have an account?
                <Link to="/login">Login here</Link>
              </>
            ) : (
              <>
                Don't have an account?
                <Link to="/register">Create an account</Link>
              </>
            )}
          </div>

          <Link className="back-shop" to="/">← Back to Shop</Link>
        </form>
      </div>
    </main>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("quicker_user") || "null");
  const [cart] = useState(JSON.parse(localStorage.getItem("quicker_cart") || "[]"));
  const [form, setForm] = useState({
    phone: "",
    address: "",
    city: "Vadodara",
    pincode: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 499 || subtotal === 0 ? 0 : 30;
  const total = subtotal + delivery;

  useEffect(() => {
    if (!user) navigate("/login");
    if (!cart.length) navigate("/");
  }, []);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Could not load the online payment gateway. Check your internet connection."));
    document.body.appendChild(script);
  });

  const shippingAddress = `${form.address.trim()}, ${form.city.trim()} - ${form.pincode.trim()}`;

  const placeCodOrder = async () => {
    const r = await api.post("/orders", {
      items: cart,
      address: shippingAddress,
      contactPhone: form.phone.trim(),
      paymentMethod: "COD"
    });
    localStorage.removeItem("quicker_cart");
    navigate(`/orders?new=${r.data._id}`);
  };

  const payOnline = async () => {
  try {
    await loadRazorpay();

    const create = await api.post("/orders/payment/create", {
      items: cart,
      address: shippingAddress,
      contactPhone: form.phone.trim()
    });

    return new Promise((resolve, reject) => {
      const options = {
        key: create.data.key,
        amount: create.data.amount,
        currency: create.data.currency,
        name: "Quicker",
        description: "Grocery order payment",
        order_id: create.data.razorpayOrderId,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: form.phone.trim()
        },

        theme: {
          color: "#1c7c54"
        },

        handler: async (response) => {
          try {
            const verified = await api.post("/orders/payment/verify", {
              ...response,
              items: cart,
              address: shippingAddress,
              contactPhone: form.phone.trim()
            });

            localStorage.removeItem("quicker_cart");
            navigate(`/orders?new=${verified.data._id}`);
            resolve();
          } catch (err) {
            const message =
              err.response?.data?.message ||
              "Payment was received but order verification failed.";

            setError(message);
            reject(err);
          }
        },

        modal: {
          ondismiss: () => {
            reject(new Error("Payment window closed."));
          }
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        reject(
          new Error(
            response.error?.description ||
            "Payment failed. Please try again."
          )
        );
      });

      razorpay.open();
    });

  } catch (err) {
    console.error("PAYMENT CREATE ERROR:", err.response?.data || err);

    setError(
      err.response?.data?.message ||
      err.message ||
      "Unable to create payment order."
    );

    throw err;
  }
};
  const submit = async e => {
    e.preventDefault();
    setError("");
    if (!localStorage.getItem("quicker_token")) return navigate("/login");
    if (!/^\d{10}$/.test(form.phone.trim())) return setError("Enter a valid 10-digit phone number.");
    if (form.address.trim().length < 8) return setError("Enter your complete delivery address.");
    if (!/^\d{6}$/.test(form.pincode.trim())) return setError("Enter a valid 6-digit PIN code.");

    setLoading(true);
    try {
      if (paymentMethod === "COD") await placeCodOrder();
      else await payOnline();
    } catch (err) {
      if (err.message !== "Payment window closed.") {
        setError(err.response?.data?.message || err.message || "Unable to complete checkout.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!cart.length) return null;

  return (
    <main className="checkout-page">
      <div className="checkout-header">
        <div>
          <p className="eyebrow">QUICKER CHECKOUT</p>
          <h1>Complete your order</h1>
          <p>Secure checkout with Cash on Delivery or Razorpay test payments.</p>
        </div>
        <Link className="back-shop" to="/">← Continue shopping</Link>
      </div>

      <div className="checkout-layout">
        <form className="panel checkout-form" onSubmit={submit}>
          <h2>Delivery details</h2>
          {error && <div className="error-box">{error}</div>}

          <label>
            Phone number
            <input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="10-digit mobile number" inputMode="numeric" required />
          </label>
          <label>
            Complete address
            <textarea value={form.address} onChange={e => update("address", e.target.value)} placeholder="House no., street, area" required />
          </label>
          <div className="two-col">
            <label>
              City
              <input value={form.city} onChange={e => update("city", e.target.value)} required />
            </label>
            <label>
              PIN code
              <input value={form.pincode} onChange={e => update("pincode", e.target.value)} placeholder="390001" inputMode="numeric" required />
            </label>
          </div>

          <h2>Payment method</h2>
          <div className="payment-options">
            <label className={`payment-option ${paymentMethod === "COD" ? "selected" : ""}`}>
              <input type="radio" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
              <span><strong>Cash on Delivery</strong><small>Pay when your groceries arrive.</small></span>
            </label>
            <label className={`payment-option ${paymentMethod === "RAZORPAY" ? "selected" : ""}`}>
              <input type="radio" checked={paymentMethod === "RAZORPAY"} onChange={() => setPaymentMethod("RAZORPAY")} />
              <span><strong>Online Payment</strong><small>Razorpay test mode — UPI, cards and other test methods.</small></span>
            </label>
          </div>

          <button className="place-order-button" disabled={loading}>
            {loading ? "Processing..." : paymentMethod === "COD" ? `Place Order • ₹${total}` : `Pay Securely • ₹${total}`}
          </button>
        </form>

        <aside className="panel order-summary">
          <h2>Order summary</h2>
          <div className="summary-items">
            {cart.map(item => (
              <div className="summary-item" key={item.product}>
                <img src={item.image || "/products/generic-grocery.svg"} alt="" />
                <div><strong>{item.name}</strong><small>₹{item.price} × {item.quantity}</small></div>
                <b>₹{item.price * item.quantity}</b>
              </div>
            ))}
          </div>
          <div className="summary-line"><span>Subtotal</span><b>₹{subtotal}</b></div>
          <div className="summary-line"><span>Delivery</span><b>{delivery ? `₹${delivery}` : "FREE"}</b></div>
          <div className="summary-total"><span>Total</span><strong>₹{total}</strong></div>
          <p className="secure-note">🔒 Your payment details are handled by the payment gateway in online test mode.</p>
        </aside>
      </div>
    </main>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/orders/my")
      .then(r => setOrders(r.data))
      .catch(err => setError(err.response?.data?.message || "Unable to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const steps = ["placed", "confirmed", "packing", "out_for_delivery", "delivered"];

  const progress = status => {
    if (status === "cancelled") return 0;
    return Math.max(0, steps.indexOf(status));
  };

  return (
    <main className="orders-page">
      <div className="orders-heading">
        <div>
          <p className="eyebrow">QUICKER</p>
          <h1>My Orders</h1>
          <p>Track your grocery orders and payment status.</p>
        </div>
        <Link className="button" to="/">Shop Groceries</Link>
      </div>

      {loading && <div className="panel">Loading your orders...</div>}
      {error && <div className="error-box">{error}</div>}
      {!loading && !orders.length && !error && (
        <div className="panel empty-orders"><h2>No orders yet</h2><p>Your placed orders will appear here.</p><Link className="button" to="/">Start shopping</Link></div>
      )}

      {orders.map(o => {
        const current = progress(o.status);
        return (
          <article className="order-card" key={o._id}>
            <div className="order-card-head">
              <div>
                <span className="order-id">Order #{o._id.slice(-8).toUpperCase()}</span>
                <small>{new Date(o.createdAt).toLocaleString()}</small>
              </div>
              <div className="order-total">₹{o.total}</div>
            </div>

            <div className="order-meta">
              <span>Payment: <b>{o.paymentMethod === "RAZORPAY" ? "Online" : "Cash on Delivery"}</b></span>
              <span>Payment status: <b className={`payment-${o.paymentStatus}`}>{o.paymentStatus}</b></span>
              <span>Status: <b className="status">{o.status.replaceAll("_", " ")}</b></span>
            </div>

            {o.status !== "cancelled" && (
              <div className="order-progress">
                {steps.map((step, index) => (
                  <div className={`progress-step ${index <= current ? "done" : ""}`} key={step}>
                    <span>{index + 1}</span><small>{step.replaceAll("_", " ")}</small>
                  </div>
                ))}
              </div>
            )}

            <div className="ordered-items">
              {o.items.map(item => (
                <div className="ordered-item" key={`${o._id}-${item.product}`}>
                  <img src={item.image || "/products/generic-grocery.svg"} alt="" />
                  <span>{item.name} × {item.quantity}</span>
                  <b>₹{item.price * item.quantity}</b>
                </div>
              ))}
            </div>

            <div className="delivery-address"><b>Deliver to:</b> {o.address} · {o.contactPhone}</div>
          </article>
        );
      })}
    </main>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/admin/stats"), api.get("/orders")]).then(([a, b]) => {
      setStats(a.data);
      setOrders(b.data);
    }).catch(console.error);
  }, []);

  const status = async (id, s) => {
    await api.patch(`/orders/${id}/status`, { status: s });
    setOrders(orders.map(o => o._id === id ? { ...o, status: s } : o));
  };

  return (
    <main>
      <h2>Manager Dashboard</h2>
      {stats && (
        <div className="stats">
          {Object.entries(stats).map(([k, v]) => (
            <div className="stat" key={k}>
              <small>{k}</small>
              <b>{k === "revenue" ? "₹" + v : v}</b>
            </div>
          ))}
        </div>
      )}
      <h3>Recent Orders</h3>
      {orders.slice(0, 10).map(o => (
        <article className="order" key={o._id}>
          <span>#{o._id.slice(-6)} · {o.customer?.name}</span>
          <b>₹{o.total}</b>
          <select value={o.status} onChange={e => status(o._id, e.target.value)}>
            <option>placed</option>
            <option>confirmed</option>
            <option>packing</option>
            <option>out_for_delivery</option>
            <option>delivered</option>
            <option>cancelled</option>
          </select>
        </article>
      ))}
    </main>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}
