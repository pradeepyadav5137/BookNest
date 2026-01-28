# BookNest - Complete Book Marketplace Platform

A full-stack book marketplace application built with React + Vite (frontend) and Node.js + Express + MongoDB (backend). Users can buy, sell, and trade books with integrated Razorpay payments and email delivery.

## Features

- **User Authentication**: JWT-based authentication with secure HTTP-only cookies
- **Book Marketplace**: Browse, search, and filter books by category
- **Purchase System**: Buy books using wallet or Razorpay payment gateway
- **PDF Delivery**: Automatic email delivery of PDFs upon purchase with resend option
- **Wallet System**: Seller wallet balance management and withdrawal functionality
- **User Profiles**: Seller profiles, purchase history, and sales tracking
- **Dark/Light Mode**: Theme toggle with localStorage persistence
- **Security**: 
  - Password hashing with bcryptjs
  - Secure JWT tokens in HTTP-only cookies
  - CORS protection
  - Input validation

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM library
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email delivery
- **Razorpay** - Payment gateway

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Plain CSS** - Styling (no Tailwind)

## Project Structure

```
/server                      # Backend
├── src/
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── errorHandler.js  # Error handling
│   ├── models/
│   │   ├── User.js          # User schema
│   │   ├── Book.js          # Book schema
│   │   ├── Purchase.js      # Purchase record
│   │   └── Withdrawal.js    # Withdrawal requests
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── books.js         # Book CRUD
│   │   ├── user.js          # User profile
│   │   ├── purchase.js      # Purchase & payment
│   │   └── wallet.js        # Wallet operations
│   ├── utils/
│   │   └── email.js         # Email service
│   └── index.js             # Server entry point
├── .env.example             # Environment template
└── package.json

/client                      # Frontend
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Navbar.css
│   │   ├── BookCard.jsx
│   │   ├── BookCard.css
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx  # Authentication context
│   │   └── ThemeContext.jsx # Theme management
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── BookDetailPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── SellPage.jsx
│   │   ├── SearchPage.jsx
│   │   ├── SellerProfilePage.jsx
│   │   └── pages.css
│   ├── services/
│   │   └── api.js           # API client
│   ├── App.jsx              # Root component
│   ├── index.css            # Global styles
│   └── main.jsx             # Entry point
├── index.html
├── vite.config.js
├── .env.example
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Razorpay account (for payments)
- Gmail account (for email service)

### Backend Setup

1. **Install dependencies**
```bash
cd server
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

Required environment variables:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/booknest
JWT_SECRET=your_secret_key_change_this
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

3. **Start the server**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**
```bash
cd client
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit with your Razorpay key
```

3. **Start the development server**
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user (protected)
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token

### Books
- `GET /api/books` - Get all books (with category filter)
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Create book (protected)
- `PUT /api/books/:id` - Update book (protected)
- `DELETE /api/books/:id` - Delete book (protected)
- `GET /api/books/seller/:sellerId` - Get seller's books

### Purchase
- `POST /api/purchase/create-order` - Create Razorpay order (protected)
- `POST /api/purchase/verify-payment` - Verify payment (protected)
- `POST /api/purchase/buy-with-wallet` - Buy with wallet (protected)
- `POST /api/purchase/resend-pdf/:purchaseId` - Resend PDF (protected)

### Wallet
- `GET /api/wallet/balance` - Get wallet balance (protected)
- `POST /api/wallet/withdraw` - Request withdrawal (protected)
- `GET /api/wallet/requests` - Get withdrawals (protected)

### User
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update profile (protected)
- `GET /api/user/purchases` - Get purchase history (protected)
- `GET /api/user/sales` - Get sales history (protected)
- `GET /api/user/public/:userId` - Get public profile

## Key Features Implementation

### 1. JWT Authentication with Cookies
```javascript
// Tokens stored in HTTP-only secure cookies
// Automatically sent with requests via axios withCredentials
// Protected routes verified via verifyToken middleware
```

### 2. Book Purchase Flow
- User selects book
- Choose payment method (Razorpay or Wallet)
- Payment processed
- PDF automatically emailed to buyer
- Book added to buyer's library
- Money added to seller's wallet

### 3. PDF Delivery
```javascript
// Automatic email with PDF attachment on purchase
// Resend option if email is missed
// Email includes book details and seller info
// Download link available in user profile
```

### 4. Wallet System
```javascript
// Sellers earn money from book sales
// Can withdraw to UPI or Bank Account
// Balance management and transaction history
// Withdrawal request tracking (pending/completed)
```

### 5. Security Features
- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens in HTTP-only cookies (7-day expiry)
- CORS protection with credentials
- Input validation on both client and server
- No sensitive data in token payload
- Protected routes for user-specific actions

## Running the Full Application

### Terminal 1 - Backend
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser

## Environment Variables Setup

### Gmail App Password
1. Enable 2-Factor Authentication on Google Account
2. Go to myaccount.google.com/apppasswords
3. Generate 16-character app password
4. Use this in EMAIL_PASSWORD

### Razorpay Keys
1. Login to Razorpay Dashboard
2. Get API Key ID and Secret from Settings
3. Add to environment variables

### MongoDB Connection
1. Create MongoDB Atlas cluster
2. Get connection string from "Connect" button
3. Add credentials to MONGODB_URI

## Testing the Application

### Register & Login
1. Go to `/register` and create account
2. Login at `/login`
3. JWT token stored in HTTP-only cookie

### Buy Books
1. Browse books on homepage
2. Click book to see details
3. Choose payment method (Razorpay/Wallet)
4. Check email for PDF

### Sell Books
1. Go to `/sell`
2. Fill book details
3. List for sale
4. Manage in profile

### Wallet
1. View balance in navbar
2. Money added when books are bought
3. Withdraw to UPI/Bank

## Troubleshooting

### Books not loading
- Check MongoDB connection in .env
- Verify MONGODB_URI format
- Check server console for errors

### Payment issues
- Verify Razorpay keys in .env
- Check Razorpay test mode settings
- Ensure CLIENT_URL matches frontend URL

### Email not sending
- Verify Gmail App Password (not regular password)
- Check EMAIL_USER and EMAIL_PASSWORD
- Enable "Less secure app access" if needed
- Check spam folder

### CORS errors
- Verify CLIENT_URL in backend .env
- Ensure frontend and backend URLs match
- Check axios withCredentials setting

## Production Deployment

### Backend (Heroku/Railway)
```bash
# Update .env with production values
# Push to git
git push
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy build folder
```

## Future Enhancements

- [ ] Book reviews and ratings
- [ ] Wishlist functionality
- [ ] Book recommendations
- [ ] Author dashboard
- [ ] Book bundles/collections
- [ ] Referral system
- [ ] Advanced search filters
- [ ] Mobile app (React Native)

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
