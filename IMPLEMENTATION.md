# BookNest Implementation Details

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Vite + React)            │
│          http://localhost:5173                       │
├─────────────────────────────────────────────────────┤
│  - React Context for Auth & Theme Management        │
│  - Axios HTTP Client with Interceptors              │
│  - React Router for Navigation                      │
│  - Dark/Light Mode Support                          │
└──────────────────────┬──────────────────────────────┘
                       │ API Calls (withCredentials)
┌──────────────────────┴──────────────────────────────┐
│              Backend (Express + Node.js)             │
│          http://localhost:5000/api                  │
├─────────────────────────────────────────────────────┤
│  - JWT Authentication (HTTP-only Cookies)           │
│  - MongoDB with Mongoose ODM                        │
│  - Razorpay Payment Integration                     │
│  - Nodemailer Email Service                         │
│  - Error Handling Middleware                        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────┐
│           External Services & Databases              │
├─────────────────────────────────────────────────────┤
│  - MongoDB Atlas (Database)                         │
│  - Razorpay (Payment Processing)                    │
│  - Gmail SMTP (Email Delivery)                      │
└─────────────────────────────────────────────────────┘
```

## Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  walletBalance: Number (default: 0),
  booksOwned: [BookId],        // Books user purchased
  booksSold: [BookId],          // Books user listed
  profilePicture: String,
  bio: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Book Schema
```javascript
{
  _id: ObjectId,
  title: String,
  author: String,
  description: String,
  price: Number,
  category: String (enum),
  coverImage: String (URL),
  pdfFile: String (path/URL),
  isbn: String,
  pages: Number,
  rating: Number (0-5),
  reviews: [{userId, rating, comment, createdAt}],
  seller: UserId (ref),
  salesCount: Number,
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Purchase Schema
```javascript
{
  _id: ObjectId,
  buyer: UserId (ref),
  book: BookId (ref),
  seller: UserId (ref),
  amount: Number,
  paymentMethod: 'razorpay' | 'wallet',
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: 'pending' | 'completed' | 'failed' | 'cancelled',
  pdfDelivered: Boolean,
  pdfDeliveryAttempts: Number,
  lastDeliveryAttempt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Withdrawal Schema
```javascript
{
  _id: ObjectId,
  user: UserId (ref),
  amount: Number,
  bankAccount: {
    accountNumber: String,
    accountHolder: String,
    bankName: String,
    ifscCode: String
  },
  upiId: String,
  paymentMethod: 'bank_transfer' | 'upi',
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
  notes: String,
  processedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication Flow

```
┌─────────────┐
│   Register  │ → POST /api/auth/register
└─────┬───────┘    {name, email, password, confirmPassword}
      │
      ▼
┌──────────────────────────────────┐
│  Validate Input & Hash Password  │
│  Create User in MongoDB          │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│   Generate JWT Token             │
│   Set HTTP-only Secure Cookie    │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│   Return User & Token to Client  │
└──────────────────────────────────┘

Login Flow:
┌─────────┐
│ Login   │ → POST /api/auth/login {email, password}
└────┬────┘
     │
     ▼
┌──────────────────────────────────┐
│  Find User & Verify Password     │
│  Compare with bcrypt Hash        │
└────────────┬─────────────────────┘
             │ (Success)
             ▼
┌──────────────────────────────────┐
│   Generate JWT Token             │
│   Set HTTP-only Secure Cookie    │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│   Return User & Token to Client  │
└──────────────────────────────────┘
```

## Purchase & Payment Flow

```
┌──────────────────┐
│ User Selects Book│
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ POST /api/purchase/create-order      │
│ - Validate book exists              │
│ - Check if user is seller           │
│ - Check if already owned            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Create Razorpay Order               │
│ - Amount in paise (price * 100)     │
│ - Return orderId to frontend        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Razorpay Checkout Modal             │
│ - User enters card details          │
│ - Payment processed on Razorpay     │
└────────────┬────────────────────────┘
             │ (Success)
             ▼
┌─────────────────────────────────────┐
│ POST /api/purchase/verify-payment   │
│ - Verify Razorpay signature         │
│ - Update Purchase status to completed
│ - Add book to buyer's library       │
│ - Add money to seller's wallet      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Send PDF Email via Nodemailer       │
│ - Email with PDF attachment         │
│ - Book details & seller info        │
└─────────────────────────────────────┘
```

## Cookie-Based Authentication

### How It Works

1. **Server sends JWT token as HTTP-only cookie:**
```javascript
res.cookie('authToken', token, {
  httpOnly: true,        // Not accessible via JavaScript
  secure: true,          // Only sent over HTTPS in production
  sameSite: 'lax',       // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

2. **Frontend sends cookies automatically:**
```javascript
// Axios configured with withCredentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true  // Send cookies with every request
});
```

3. **Backend extracts token from cookie:**
```javascript
export const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken || 
                req.headers.authorization?.replace('Bearer ', '');
  // Verify JWT
};
```

## Email Service (Nodemailer)

### PDF Delivery Email

```javascript
sendPdfEmail(purchase) {
  - Gets PDF file from book.pdfFile
  - Creates formatted HTML email
  - Attaches PDF to email
  - Sends to buyer email
  - Updates pdfDelivered flag
}
```

### Email Features
- Professional HTML formatting
- Book details in email body
- PDF as attachment (downloadable)
- Seller information
- Link to user library
- Resend option in profile

## Security Measures

### 1. Password Security
```javascript
// bcryptjs hashing with 10 salt rounds
const salt = await bcryptjs.genSalt(10);
this.password = await bcryptjs.hash(this.password, salt);
```

### 2. JWT Security
- Token expires in 7 days
- Secret key stored in environment variable
- Token payload contains only userId and email
- Never store sensitive data in token

### 3. Cookie Security
- HTTP-only flag prevents JavaScript access
- Secure flag (HTTPS only in production)
- SameSite=lax prevents CSRF attacks
- Automatic sending with credentials

### 4. Input Validation
- Email format validation
- Password minimum length (6 chars)
- Required field checks
- Server-side validation on all endpoints

### 5. Database Security
- MongoDB connection via connection string
- User passwords never logged
- Sensitive fields excluded from responses
- Proper error messages (no data leakage)

## Razorpay Integration

### Payment Flow
1. Create order on backend
2. Display Razorpay modal on frontend
3. User completes payment
4. Verify signature on backend
5. Update database with payment details

### Test Mode
```javascript
// Use test keys from Razorpay Dashboard
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx

// Test card: 4111 1111 1111 1111
// Expiry: 12/25
// CVV: 123
```

## Frontend State Management

### AuthContext
```javascript
{
  user: { _id, name, email, walletBalance, ... },
  loading: boolean,
  error: string,
  isAuthenticated: boolean,
  register: (name, email, password, confirmPassword) => Promise,
  login: (email, password) => Promise,
  logout: () => Promise,
  refreshUser: () => Promise
}
```

### ThemeContext
```javascript
{
  isDarkMode: boolean,
  toggleTheme: () => void
}
```

## API Error Handling

### Server Side
```javascript
// Custom error class
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Error middleware
app.use((err, req, res, next) => {
  // Handle JWT errors, validation errors, etc.
  res.status(statusCode).json({ error: message });
});
```

### Client Side
```javascript
// Axios interceptors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Performance Optimizations

### Frontend
- Code splitting with React Router lazy loading
- Memoization of components
- Conditional rendering to prevent unnecessary renders
- CSS modules for scoped styling
- Image lazy loading with fallbacks

### Backend
- Database indexing on frequently queried fields
- Pagination for large datasets
- Request validation to prevent unnecessary processing
- Error handling to prevent crashes

## Scaling Considerations

### Current Limitations
- Single server instance
- MongoDB Atlas free tier limits
- Email delivery limited by Gmail quota
- No file storage (PDFs need separate service)

### Future Improvements
1. **Cloud Storage**: Implement AWS S3 for PDF files
2. **CDN**: Use Cloudflare or AWS CloudFront
3. **Caching**: Redis for session and data caching
4. **Load Balancing**: Multiple server instances
5. **Message Queue**: Bull queue for email delivery
6. **Search**: Elasticsearch for advanced search
7. **Analytics**: Track user behavior and sales

## Testing

### Unit Tests
- Model validations
- Authentication logic
- Payment verification

### Integration Tests
- Full purchase flow
- Email delivery
- Database operations

### E2E Tests
- Register and login flow
- Book browsing
- Payment process
- Profile management

## Environment-Specific Configuration

### Development
- Local MongoDB
- Test Razorpay keys
- Gmail test account
- CORS: http://localhost:5173

### Production
- MongoDB Atlas
- Production Razorpay keys
- Production email account
- HTTPS enforced
- Secure cookies enabled
- Environment variables from secrets manager

## Troubleshooting Guide

### Issue: "Database connection error"
**Solution**: Check MONGODB_URI format and IP whitelist

### Issue: "Email not sending"
**Solution**: Verify Gmail App Password (not regular password)

### Issue: "Payment fails"
**Solution**: Use test keys in test mode

### Issue: "CORS errors"
**Solution**: Verify CLIENT_URL matches frontend URL

### Issue: "Token not persisting"
**Solution**: Ensure cookies are enabled in browser

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Enable HTTPS
- [ ] Set secure cookies flag
- [ ] Update JWT secret to strong random key
- [ ] Set up MongoDB backups
- [ ] Configure email service
- [ ] Set up logging/monitoring
- [ ] Test payment flow with test keys
- [ ] Configure error tracking (Sentry)
- [ ] Set up CI/CD pipeline
