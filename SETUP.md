# BookNest - Quick Start Guide

## 1. Clone & Setup

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

## 2. MongoDB Setup

### Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up and create a free cluster
3. Create a database user (note username and password)
4. Get connection string: Cluster → Connect → Copy Connection String

### Update Backend .env
```bash
cd server
cp .env.example .env
# Edit .env and add:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/booknest?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_12345
```

## 3. Email Setup (Gmail)

### Generate Gmail App Password
1. Enable 2-Factor Authentication: myaccount.google.com/security
2. Go to App passwords: myaccount.google.com/apppasswords
3. Select Mail and Windows Computer
4. Copy the 16-character password

### Update Backend .env
```bash
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-char app password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

## 4. Razorpay Setup

### Create Razorpay Account
1. Go to https://razorpay.com
2. Sign up and verify
3. Go to Settings → API Keys
4. Copy Key ID and Key Secret

### Update Configs
**Backend .env:**
```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

**Frontend .env:**
```bash
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

## 5. Start Application

### Terminal 1 - Backend
```bash
cd server
npm run dev
# Server will run on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd client
npm run dev
# Frontend will run on http://localhost:5173
```

Open browser: `http://localhost:5173`

## 6. Test the Application

### Create Test Account
1. Click "Register"
2. Fill in details:
   - Name: Test User
   - Email: test@example.com
   - Password: test123456

### Test Purchase Flow
1. Browse books on homepage
2. Click a book
3. Try "Buy with Razorpay" (use Razorpay test card)
4. Check email for PDF

### Test Wallet
1. When you're seller, earn money
2. View wallet balance in navbar
3. Go to profile → Wallet → Withdraw

## 7. Razorpay Test Cards

Use these for testing:

| Card Number | Expiry | CVV |
|---|---|---|
| 4111 1111 1111 1111 | 12/25 | 123 |

## 8. File Upload (PDF Storage)

For production, set up:
- AWS S3 or similar cloud storage
- Update `pdfFile` field in Book model
- Handle file upload in SellPage

## Environment Variables Checklist

### Backend (.env)
- [ ] MONGODB_URI
- [ ] JWT_SECRET (change to strong secret)
- [ ] EMAIL_USER
- [ ] EMAIL_PASSWORD
- [ ] EMAIL_HOST
- [ ] EMAIL_PORT
- [ ] RAZORPAY_KEY_ID
- [ ] RAZORPAY_KEY_SECRET
- [ ] PORT (default 5000)
- [ ] CLIENT_URL (http://localhost:5173)

### Frontend (.env)
- [ ] VITE_API_URL (http://localhost:5000/api)
- [ ] VITE_RAZORPAY_KEY_ID

## API Testing

### Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","confirmPassword":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' \
  -c cookies.txt

# Get Profile (use cookies from login)
curl http://localhost:5000/api/auth/profile -b cookies.txt
```

## Troubleshooting

### MongoDB Connection Error
- Verify connection string format
- Check IP whitelist: Cluster → Security → IP Whitelist (add 0.0.0.0/0)
- Test connection string in MongoDB Compass

### Email Not Sending
- Check Gmail App Password (not regular password)
- Verify EMAIL_USER is your Gmail address
- Check spam/promotions folder

### Razorpay Payment Error
- Use test keys, not live keys
- Use test card: 4111 1111 1111 1111
- Check browser console for errors

### CORS Error
- Verify CLIENT_URL in backend .env
- Restart backend server
- Clear browser cookies

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

## Next Steps

1. Explore the codebase
2. Customize branding and colors
3. Add more book categories
4. Implement additional features
5. Deploy to production

## Support

For issues:
1. Check error messages in console
2. Review README.md
3. Check backend logs
4. Verify environment variables

## Production Deployment

### Backend (Heroku/Railway/Render)
```bash
# Set production environment variables
# Deploy your server code
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist folder
```

Good luck! 🚀
