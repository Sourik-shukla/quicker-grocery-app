# Quicker – MERN Grocery Delivery

A complete MERN grocery-delivery demo with authentication, local grocery images, cart, checkout, Cash on Delivery, Razorpay TEST-mode online payments, order history/tracking, inventory updates and manager dashboard.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcryptjs
- Online payments: Razorpay TEST mode
- API: REST
- Styling: plain CSS

## Features
- Login / Register
- Grocery catalog with product-specific local SVG images
- Search and category filters
- Cart with persistent local storage
- Checkout with delivery details
- Cash on Delivery
- Razorpay TEST-mode online payment (UPI/cards/test methods)
- Server-side payment signature verification
- MongoDB order creation
- Inventory/stock reduction after successful order
- My Orders page with payment status and delivery progress
- Manager/admin order dashboard

## Run

### 1. Backend
```powershell
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quicker
JWT_SECRET=change_this_secret
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

For COD only, Razorpay keys can be left out. Online payment requires Razorpay TEST keys.

Then:
```powershell
npm run seed
npm run dev
```

### 2. Frontend
Open another terminal:
```powershell
cd client
npm install
npm run dev
```

Open:
`http://localhost:5173`

## Payment
Select **Cash on Delivery** for a no-key demo.

For **Online Payment**, add your Razorpay TEST keys to `server/.env`. The frontend opens Razorpay Checkout and the backend verifies the payment signature before creating the order.

Never put `RAZORPAY_KEY_SECRET` in the client or commit it to GitHub.

## Main API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `POST /api/orders` – COD order
- `POST /api/orders/payment/create` – create Razorpay test order
- `POST /api/orders/payment/verify` – verify Razorpay payment and create order
- `GET /api/orders/my`
- `GET /api/orders`
- `PATCH /api/orders/:id/status`
- `GET /api/admin/stats`
