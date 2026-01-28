# BookNest - Start Here

Welcome to **BookNest**, a complete full-stack book marketplace application built with modern web technologies.

## What You Have

A **production-ready** book marketplace with:
- ✅ Professional React + Vite frontend
- ✅ Secure Node.js + Express backend
- ✅ MongoDB database integration
- ✅ Razorpay payment processing
- ✅ Email-based PDF delivery
- ✅ Wallet system with withdrawals
- ✅ Complete authentication system
- ✅ Dark/Light mode
- ✅ Responsive design
- ✅ Full documentation

## Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (in another terminal)
cd client
npm install
```

### Step 2: Setup Environment Variables

**Backend (`/server/.env`)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/booknest
JWT_SECRET=your_secret_key_here
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Frontend (`/client/.env`)**
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxx
```

Need help getting these keys? → See `SETUP.md`

### Step 3: Start Services

```bash
# Terminal 1: Backend
cd server
npm run dev
# Runs on http://localhost:5000

# Terminal 2: Frontend
cd client
npm run dev
# Runs on http://localhost:5173
```

### Step 4: Test It

1. Open http://localhost:5173
2. Click "Register" and create an account
3. Browse books on homepage
4. Click a book to view details
5. Try buying with Razorpay (use test card: 4111 1111 1111 1111)
6. Check your email for the PDF

**Done!** You now have a working book marketplace.

## Documentation Guide

Read these in order based on your needs:

### For Getting Started
- **This file** - Overview and quick start
- **`SETUP.md`** - Detailed setup instructions with all credentials
- **`QUICK_REFERENCE.md`** - Quick lookup for common tasks

### For Development
- **`README.md`** - Complete feature documentation
- **`IMPLEMENTATION.md`** - Technical architecture details
- **Code comments** - Inline documentation in source files

### For Understanding the Project
- **`PROJECT_SUMMARY.md`** - What was built and why

## Project Structure

```
BookNest/
├── server/                # Backend (Node + Express + MongoDB)
│   ├── src/
│   │   ├── models/       # Database schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth & error handling
│   │   └── utils/        # Email service
│   └── .env.example
│
├── client/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # State management
│   │   └── services/     # API client
│   └── .env.example
│
└── Documentation files
```

## Key Features

### For Buyers
- Browse and search books by category
- Buy with Razorpay (secure payment)
- Buy with wallet (store credit)
- Receive PDF via email instantly
- View purchase history
- Manage account

### For Sellers
- List books for sale
- Set prices
- Track sales
- Earn money in wallet
- Withdraw to bank/UPI
- View seller profile
- Track withdrawals

### Platform Features
- Secure authentication (JWT + cookies)
- Professional dark/light mode
- Mobile responsive
- Real-time wallet updates
- Email notifications
- Search functionality
- Public seller profiles

## Technology Used

**Backend:**
- Node.js + Express.js
- MongoDB (with Mongoose)
- JWT (authentication)
- bcryptjs (password hashing)
- Nodemailer (emails)
- Razorpay (payments)

**Frontend:**
- React 18
- Vite (build tool)
- React Router (navigation)
- Axios (API calls)
- React Context (state)
- Plain CSS (styling)

## Common Tasks

### Want to understand the architecture?
→ Read `IMPLEMENTATION.md`

### Need help setting up?
→ Follow `SETUP.md` step by step

### Want a quick lookup?
→ Use `QUICK_REFERENCE.md`

### Need complete feature list?
→ Check `README.md`

### Want to see what was built?
→ Read `PROJECT_SUMMARY.md`

## File Checklist

After setup, you should have:

```
✅ /server
   ✅ /src
      ✅ /models (4 files)
      ✅ /routes (5 files)
      ✅ /middleware (2 files)
      ✅ /config (1 file)
      ✅ /utils (1 file)
   ✅ /package.json
   ✅ /.env.example

✅ /client
   ✅ /src
      ✅ /components (3+ files)
      ✅ /pages (8+ files)
      ✅ /context (2 files)
      ✅ /services (1 file)
   ✅ /package.json
   ✅ /.env.example

✅ Documentation
   ✅ README.md
   ✅ SETUP.md
   ✅ IMPLEMENTATION.md
   ✅ PROJECT_SUMMARY.md
   ✅ QUICK_REFERENCE.md
   ✅ 00_START_HERE.md (this file)
```

## Testing the Full Flow

### Complete Purchase Test

1. **Register**
   - Go to `/register`
   - Create test account
   - Verify you're logged in

2. **Browse Books**
   - See books on homepage
   - Filter by category
   - Search for specific book

3. **View Book Details**
   - Click any book
   - See details, author, price
   - View seller info

4. **Make Purchase**
   - Click "Buy with Razorpay"
   - Use test card: 4111 1111 1111 1111
   - Enter any expiry (12/25) and CVV (123)
   - Complete payment

5. **Get PDF**
   - Check your email
   - Download PDF attachment
   - Book added to library

6. **View Profile**
   - Go to `/profile`
   - See purchased books
   - Check wallet balance

7. **Sell a Book**
   - Go to `/sell`
   - Fill in book details
   - List for sale
   - See in profile

## Troubleshooting Quick Guide

### Backend won't start
```bash
# Make sure .env is set up
# Check MongoDB connection
# Try different port: PORT=5001 npm run dev
```

### Frontend won't load
```bash
# Make sure backend is running
# Check VITE_API_URL in .env
# Clear browser cache
```

### Payment fails
```bash
# Use test card: 4111 1111 1111 1111
# Check RAZORPAY_KEY_ID format
# Ensure test mode enabled
```

### Email not arriving
```bash
# Use Gmail App Password (not regular password)
# Check spam folder
# Verify EMAIL_USER is correct
```

For more help → See `SETUP.md` Troubleshooting section

## Next Steps

### Immediate (Get it running)
1. ✅ Follow the Quick Start above
2. ✅ Test creating account
3. ✅ Test making purchase

### Short Term (Understand code)
1. ✅ Read `README.md` for features
2. ✅ Review `IMPLEMENTATION.md` for architecture
3. ✅ Explore key files (routes, models, pages)

### Medium Term (Customize)
1. ✅ Change colors/theme in CSS
2. ✅ Add your branding
3. ✅ Customize email templates
4. ✅ Add more categories

### Long Term (Deploy)
1. ✅ Prepare production credentials
2. ✅ Deploy backend (Railway, Render, Heroku)
3. ✅ Deploy frontend (Vercel, Netlify)
4. ✅ Configure production database
5. ✅ Set up monitoring

## Support Resources

### Learning Resources
- **MongoDB**: https://www.mongodb.com
- **React**: https://react.dev
- **Express**: https://expressjs.com
- **Vite**: https://vitejs.dev

### Problem Solving
- Check console error messages
- Review `SETUP.md` troubleshooting
- Read code comments
- Review `IMPLEMENTATION.md` for architecture

## Key Strengths

✨ **Security**
- Password hashing
- JWT authentication
- HTTP-only cookies
- CORS protection

⚡ **Performance**
- Vite for fast dev
- Async/await patterns
- Efficient queries
- CSS-only styling

🎨 **User Experience**
- Dark/Light mode
- Responsive design
- Professional UI
- Smooth navigation

🔒 **Production Ready**
- Error handling
- Input validation
- Database schemas
- Scalable architecture

## What Makes This Special

Unlike typical tutorials, this is a **complete, production-ready application** with:
- Real payment processing (not fake)
- Email delivery system
- Wallet management
- Professional authentication
- Complete API
- Full documentation

Everything is implemented, tested, and ready to use.

## You're All Set!

You now have a professional book marketplace platform. Start by following the Quick Start above, then explore the documentation as needed.

**Questions?** Check the relevant documentation file:
- Setup issues → `SETUP.md`
- How to do X → `QUICK_REFERENCE.md`
- How it works → `IMPLEMENTATION.md`
- What exists → `README.md` or `PROJECT_SUMMARY.md`

Happy coding! 🚀

---

**Next:** Follow the Quick Start section above, then come back to these docs as needed.
