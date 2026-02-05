# Setup Guide - BookNest

Follow these instructions to set up and run the BookNest project locally.

## Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB account (or local MongoDB instance)
- Razorpay account (for testing payments)
- SMTP credentials (e.g., Gmail App Password for email delivery)

## 1. Backend Setup (Server)

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    Create a `.env` file in the `server` directory and populate it with the following:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_gmail_app_password
    RAZORPAY_KEY_ID=your_razorpay_key
    RAZORPAY_KEY_SECRET=your_razorpay_secret
    PORT=5000
    CLIENT_URL=http://localhost:5173
    COOKIE_SECURE=false
    COOKIE_HTTP_ONLY=true
    COOKIE_SAME_SITE=lax
    ```
4.  **Start the server:**
    ```bash
    npm run dev
    ```

## 2. Frontend Setup (Client)

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    Create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```

## 3. Creating an Admin User

To access the admin panel, you need to promote a registered user to the `admin` role.

1.  Register a new account through the website.
2.  Use the provided utility script in the `server` directory:
    ```bash
    cd server
    node promote_admin.js your_email@example.com
    ```

## 4. Usage Tips
- **Testing Purchases:** Use Razorpay's test card details.
- **Uploads:** Files are stored in `server/uploads/`. Ensure this directory is writable.
- **Admin Dashboard:** Access it at `http://localhost:5173/admin` after logging in as an admin.
