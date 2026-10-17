# ☕ Kaldi & Co. — Ethiopian Specialty Coffee & Roastery Platform

[![Live Website](https://img.shields.io/badge/Live_Website-kaldi--coffee.onrender.com-success?style=for-the-badge&logo=render&logoColor=white)](https://kaldi-coffee.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/webbyfan/kaldi-coffee)

🌐 **Live Website**: [https://kaldi-coffee.onrender.com](https://kaldi-coffee.onrender.com)

A full-stack specialty coffee e-commerce and roastery management platform built for Ethiopian specialty beans (Yirgacheffe, Sidama, Guji, Harrar, Limu, and Kaffa). Includes real-time Ethiopian payment integrations (Telebirr, CBE Mobile, Chapa), automated order routing, customer receipts, and an administrative order fulfillment dashboard.

---

## 🌟 Key Platform Features

1. **Specialty Coffee Shop & Cart**
   - Single-origin coffees with customizable grind options (Whole Bean, Pour-Over, French Press, Espresso) and package sizes (250g, 500g, 1kg).
   - Interactive slide-out cart drawer, coupon codes, and dynamic delivery fee calculations for Addis Ababa sub-cities and regional Ethiopia.

2. **Real Ethiopian Payment & Verification System**
   - **Chapa Automated Gateway**: Direct real-time bank verification supporting Telebirr, CBE Birr, Awash Birr, and Visa/Mastercard.
   - **Direct Telebirr Transfer**: Requires customers to input their unique Telebirr Transaction ID / SMS confirmation code before order submission.
   - **Direct CBE Mobile Transfer**: Displays store account details and requires customers to submit their CBE bank transfer reference code.
   - **Cash on Delivery**: Doorstep payment support for Addis Ababa.

3. **Automated Email Notifications & Turnkey Handover**
   - **Store Order Alerts**: Every order automatically dispatches a complete packing list, customer address, and payment transaction reference to `STORE_EMAIL`.
   - **Configurable `STORE_EMAIL`**: Easily configured in environment variables. When the website is transferred to a new owner, changing `STORE_EMAIL` automatically routes all notifications to the new owner's inbox.
   - **Customer Receipts**: Customers receive branded receipts with order reference numbers, itemized prices, and direct roastery WhatsApp support.
   - **Inquiry Forwarding**: Contact and Wholesale partnership applications forward directly to the store manager with one-click reply headers.

4. **Secured Admin Management Portal (`/admin`)**
   - Restricted to authorized administrators with secure authentication.
   - Order fulfillment tracking with one-click **"Confirm Paid"** (verifies customer's submitted Telebirr/CBE Transaction ID) and **"Mark Delivered"**.
   - Dual-mode data persistence: Saves to MongoDB if connected, and seamlessly synchronizes with client local storage when running in lightweight mode.

5. **Customer "My Orders" Dashboard (`/my-orders`)**
   - Real-time status indicators: `✓ Payment Verified`, `⏳ Payment Pending Verification`, `🚚 Out for Delivery`, and `✓ Delivered`.

---

## 🚀 Running Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- Optional: MongoDB running on `mongodb://localhost:27017` (the platform automatically falls back if MongoDB is offline)

### 2. Install Dependencies
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Environment Variables
Create a file named `.env` in the `server/` directory (see `server/.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kaldicoffee
JWT_SECRET=your_jwt_secret_key

# Email Dispatcher (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
STORE_EMAIL=orders@kaldicoffee.com

# Ethiopian Payment Accounts
CHAPA_SECRET_KEY=CHASECK_TEST-your-key
TELEBIRR_RECEIVER_PHONE=+251911XXXXXX
TELEBIRR_RECEIVER_NAME=Kaldi Specialty Coffee
CBE_ACCOUNT_NUMBER=1000XXXXXXXXX
CBE_ACCOUNT_NAME=Kaldi & Co Specialty Coffee
```

### 4. Start Development Servers
In two separate terminals:
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Cloud Deployment (Render.com)

This repository is unified for **single-service fullstack deployment**:
1. Connect your GitHub repository to [Render.com](https://render.com) (New Web Service).
2. Configure settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Add the environment variables listed in `server/.env.example`.
4. Deploy! Render builds the React frontend and serves it alongside the Express backend under a single secure `https://` domain.
