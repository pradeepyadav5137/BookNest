# BookNest - Quick Reference Guide

## File Organization

### Backend Server (`/server`)
```
src/
├── index.js                 # Start here - main server file
├── config/database.js       # MongoDB connection
├── middleware/
│   ├── auth.js             # JWT verification
│   └── errorHandler.js     # Error handling
├── models/                 # Database schemas
│   ├── User.js
│   ├── Book.js
│   ├── Purchase.js
│   └── Withdrawal.js
├── routes/                 # API endpoints
│   ├── auth.js
│   ├── books.js
│   ├── user.js
│   ├── purchase.js
│   └── wallet.js
└── utils/email.js          # Email service
```

### Frontend (`/client`)
```
src/
├── App.jsx                 # Main app component
├── main.jsx                # Entry point
├── index.css               # Global styles
├── components/
│   ├── Navbar.jsx
│   ├── BookCard.jsx
│   └── ProtectedRoute.jsx
├── context/
│   ├── AuthContext.jsx     # Auth state
│   └── ThemeContext.jsx    # Theme state
├── pages/
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── BookDetailPage.jsx  # Main purchase flow
│   ├── ProfilePage.jsx
│   ├── SellPage.jsx
│   ├── SearchPage.jsx
│   └── SellerProfilePage.jsx
└── services/api.js         # API client
```

## Common Tasks

### Add a New API Endpoint

1. **Create route in backend** (`/server/src/routes/*.js`)
```javascript
router.post('/endpoint', verifyToken, async (req, res) => {
  try {
    // Your logic
    res.json({ data: result });
  } catch (error) {
    throw error;
  }
});
```

2. **Add API method** (`/client/src/services/api.js`)
```javascript
export const apiName = {
  endpoint: (data) => api.post('/endpoint', data),
};
```

3. **Use in component** (`/client/src/pages/*.jsx`)
```javascript
import { apiName } from '../services/api';
const response = await apiName.endpoint(data);
```

### Protect a Route

```javascript
// In App.jsx
<Route
  path="/protected"
  element={
    <ProtectedRoute>
      <ComponentName />
    </ProtectedRoute>
  }
/>
```

### Add Authentication Check

```javascript
import { useAuth } from '../context/AuthContext';

function Component() {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Hello, {user.name}!</div>;
}
```

### Style Components

1. **Create CSS file** with same name as component
2. **Import in component**: `import './ComponentName.css'`
3. **Use classes**: `<div className="component-class">`

Example:
```css
.my-button {
  background: #00d4ff;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
}
```

## Environment Setup Checklist

### Backend (.env)
- [ ] `MONGODB_URI` - From MongoDB Atlas
- [ ] `JWT_SECRET` - Your secret (min 32 chars)
- [ ] `EMAIL_USER` - Your Gmail
- [ ] `EMAIL_PASSWORD` - Gmail App Password (16 chars)
- [ ] `RAZORPAY_KEY_ID` - From Razorpay
- [ ] `RAZORPAY_KEY_SECRET` - From Razorpay
- [ ] `PORT` - 5000
- [ ] `CLIENT_URL` - http://localhost:5173

### Frontend (.env)
- [ ] `VITE_API_URL` - http://localhost:5000/api
- [ ] `VITE_RAZORPAY_KEY_ID` - Razorpay test key

## Running Locally

### Terminal 1 - Backend
```bash
cd server
npm install
cp .env.example .env          # Edit with your keys
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd client
npm install
cp .env.example .env          # Edit with your keys
npm run dev
# Runs on http://localhost:5173
```

## API Quick Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /auth/register | No | Create account |
| POST | /auth/login | No | Login |
| GET | /auth/profile | Yes | Get user |
| GET | /books | No | List books |
| GET | /books/:id | No | Book details |
| POST | /books | Yes | Create book |
| POST | /purchase/create-order | Yes | Razorpay order |
| POST | /purchase/verify-payment | Yes | Confirm payment |
| POST | /purchase/buy-with-wallet | Yes | Wallet purchase |
| GET | /wallet/balance | Yes | Check balance |
| POST | /wallet/withdraw | Yes | Request withdrawal |
| POST | /purchase/resend-pdf/:id | Yes | Resend PDF |

## Database Quick Reference

### User Document
```javascript
{
  _id, name, email, password (hashed),
  walletBalance, booksOwned[], booksSold[],
  profilePicture, bio, isActive,
  createdAt, updatedAt
}
```

### Book Document
```javascript
{
  _id, title, author, description, price, category,
  coverImage, pdfFile, isbn, pages,
  rating, reviews[], seller (ref),
  salesCount, isAvailable,
  createdAt, updatedAt
}
```

### Purchase Document
```javascript
{
  _id, buyer (ref), book (ref), seller (ref),
  amount, paymentMethod,
  razorpayOrderId, razorpayPaymentId, razorpaySignature,
  status, pdfDelivered, pdfDeliveryAttempts,
  lastDeliveryAttempt, createdAt, updatedAt
}
```

## Testing Credentials

### Test Razorpay Card
- Card: 4111 1111 1111 1111
- Expiry: 12/25
- CVV: 123
- OTP: 123456 (if prompted)

### Test Gmail
- Use your Gmail account with App Password
- Not your regular Gmail password
- Get it from myaccount.google.com/apppasswords

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| ECONNREFUSED 5000 | Backend not running | Run `npm run dev` in /server |
| 401 Unauthorized | No valid token | Login first |
| CORS error | URL mismatch | Check CLIENT_URL in .env |
| MongoDB error | Connection failed | Check MONGODB_URI format |
| Email not sending | Wrong password | Use App Password, not Gmail password |
| Razorpay error | Using live keys | Use test keys in dev mode |
| 404 not found | Wrong API path | Check route spelling |

## Code Examples

### Fetch Books
```javascript
const { booksAPI } = require('../services/api');
const books = await booksAPI.getAll('fiction');
```

### Login User
```javascript
const { useAuth } = require('../context/AuthContext');
const { login } = useAuth();
await login(email, password);
```

### Make Purchase
```javascript
const { purchaseAPI } = require('../services/api');
const order = await purchaseAPI.createOrder(bookId);
// Then handle Razorpay payment
```

### Get User Wallet
```javascript
const { walletAPI } = require('../services/api');
const { walletBalance } = await walletAPI.getBalance();
```

## Deployment Commands

### Build Backend
```bash
cd server
# No special build needed - deploy src folder
```

### Build Frontend
```bash
cd client
npm run build
# Creates /dist folder for deployment
```

## Resources

- **MongoDB**: https://www.mongodb.com/cloud/atlas
- **Razorpay**: https://razorpay.com
- **Nodemailer**: https://nodemailer.com
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Express**: https://expressjs.com
- **Mongoose**: https://mongoosejs.com

## Key Features

✅ **Authentication** - JWT + HTTP-only cookies  
✅ **Payments** - Razorpay integration  
✅ **PDF Delivery** - Email with attachments  
✅ **Wallet** - Seller earnings & withdrawals  
✅ **Search** - Find books by title/author  
✅ **Profiles** - Seller pages & history  
✅ **Dark Mode** - Theme toggle  
✅ **Responsive** - Mobile-friendly design  
✅ **Secure** - Password hashing & validation  
✅ **Professional** - Production-ready code  

## Next Steps

1. ��� Set up environment variables
2. ✅ Start backend & frontend
3. ✅ Register account
4. ✅ Browse books
5. ✅ Test payment
6. ✅ Check email for PDF
7. ✅ Explore all features
8. ✅ Customize for production

---

For detailed documentation, see `README.md`, `SETUP.md`, and `IMPLEMENTATION.md`
