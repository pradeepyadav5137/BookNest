# BookNest Project Documentation

## Project Overview
BookNest is a digital library marketplace where users can discover, buy, and sell books. The platform supports multiple categories, secure payments via Razorpay or internal wallet, and now features an administrative panel for content verification and platform management.

## Key Features

### 1. User Authentication
- Secure registration and login.
- Password reset functionality via email.
- Role-based access control (User and Admin).

### 2. Book Marketplace
- **Sell Books:** Users can list books, upload cover images, and provide the book PDF.
- **Copyright Marking:** Sellers can mark books as copyrighted and upload proof documents for admin verification.
- **Browse & Search:** Improved search functionality with multi-keyword matching. Home page "Browse" redirects to a comprehensive search/list page.
- **Book Details:** View detailed information about books, including seller info and category.

### 3. Transactions & Wallet
- **Dual Payment Methods:** Integrated Razorpay for external payments and an internal wallet system.
- **Automated Commissions:** The platform (Admin) receives a 10% commission on every sale, automatically credited to the admin's wallet.
- **Wallet Withdrawals:** Sellers can request withdrawals from their wallet balance.

### 4. Admin Panel
- **Dashboard:** Overview of platform stats (Total Users, Books, Revenue, and Admin Commission).
- **Verification System:** Admins manually verify copyrighted books and notes.
- **Copyright Claims:** A new system allowing any user to claim copyright ownership with proof, which admins can then verify and act upon by taking down the infringing content.
- **Content Management:** Admins can take down or restore any book on the platform.
- **Secure Access:** Only users with the `admin` role can access the dashboard, with a direct link provided in their profile page.

### 5. Automated Delivery
- **Email Integration:** Upon successful purchase, the buyer automatically receives an email with the book PDF attached.

## Technical Architecture

### Backend (Server)
- **Node.js & Express:** Robust API handling.
- **MongoDB & Mongoose:** Scalable NoSQL database with structured schemas.
- **Multer:** Handles multi-part form data for secure file uploads.
- **JWT & Cookies:** Secure session management.
- **Nodemailer:** Handles all outgoing transactional emails.

### Frontend (Client)
- **React:** Modern UI with component-based architecture.
- **React Router:** Handles client-side navigation and protected routes.
- **Axios:** Streamlined API communication.
- **Tailwind CSS:** Responsive and modern styling.

## Recent Updates & Improvements
- **File System Storage:** Transitioned from base64 encoding to efficient local file storage for PDFs and images.
- **Enhanced Search:** Replaced exact matching with flexible keyword-based regex search.
- **Admin Roles:** Implemented the infrastructure for platform governance.
- **Commission System:** Monetized the platform with a 10% transaction fee.
- **Global Footer:** Improved site navigation and professional appearance.
