// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true, // Send cookies with requests
// });

// // Add token to requests if available
// api.interceptors.request.use((config) => {
//   // Token is automatically sent via cookies
//   return config;
// });

// // Handle errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Clear auth and redirect to login
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// // Auth APIs
// export const authAPI = {
//   register: (data) => api.post('/auth/register', data),
//   login: (email, password) => api.post('/auth/login', { email, password }),
//   logout: () => api.post('/auth/logout'),
//   getProfile: () => api.get('/auth/profile'),
//   refreshToken: () => api.post('/auth/refresh'),
// };

// // Books APIs
// export const booksAPI = {
//   getAll: (category, search) =>
//     api.get('/books', { params: { category, search } }),
//   getById: (id) => api.get(`/books/${id}`),
//   create: (data) => api.post('/books', data),
//   update: (id, data) => api.put(`/books/${id}`, data),
//   delete: (id) => api.delete(`/books/${id}`),
//   getSellerBooks: (sellerId) => api.get(`/books/seller/${sellerId}`),
//   search: (query) => api.get('/books/search/query', { params: { q: query } }),
// };

// // User APIs
// export const userAPI = {
//   getProfile: () => api.get('/user/profile'),
//   updateProfile: (data) => api.put('/user/profile', data),
//   getWallet: () => api.get('/wallet/balance'),
//   getPurchases: () => api.get('/user/purchases'),
//   getSales: () => api.get('/user/sales'),
//   getPublicProfile: (userId) => api.get(`/user/public/${userId}`),
//   ownsBook: (bookId) => api.get(`/user/owns/${bookId}`),
// };

// // Purchase APIs
// export const purchaseAPI = {
//   createOrder: (bookId) => api.post('/purchase/create-order', { bookId }),
//   verifyPayment: (data) => api.post('/purchase/verify-payment', data),
//   buyWithWallet: (bookId) => api.post('/purchase/buy-with-wallet', { bookId }),
//   resendPDF: (purchaseId) => api.post(`/purchase/resend-pdf/${purchaseId}`),
//   getPurchase: (purchaseId) => api.get(`/purchase/${purchaseId}`),
// };

// // Wallet APIs
// export const walletAPI = {
//   getBalance: () => api.get('/wallet/balance'),
//   withdraw: (data) => api.post('/wallet/withdraw', data),
//   getWithdrawals: () => api.get('/wallet/requests'),
//   getWithdrawal: (withdrawalId) => api.get(`/wallet/requests/${withdrawalId}`),
//   cancelWithdrawal: (withdrawalId) =>
//     api.post(`/wallet/requests/${withdrawalId}/cancel`),
// };

// export default api;


import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  // Token is automatically sent via cookies
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if:
    // 1. It's a 401 error
    // 2. We're NOT on the login or register page already
    // 3. We're NOT checking the profile (initial auth check)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthCheck = error.config?.url?.includes('/auth/profile');
      
      // Don't redirect if we're already on auth pages or just checking auth status
      if (!isAuthCheck && currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Books APIs
export const booksAPI = {
  getAll: (category, search) =>
    api.get('/books', { params: { category, search } }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
  getSellerBooks: (sellerId) => api.get(`/books/seller/${sellerId}`),
  search: (query) => api.get('/books/search/query', { params: { q: query } }),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getWallet: () => api.get('/wallet/balance'),
  getPurchases: () => api.get('/user/purchases'),
  getSales: () => api.get('/user/sales'),
  getPublicProfile: (userId) => api.get(`/user/public/${userId}`),
  ownsBook: (bookId) => api.get(`/user/owns/${bookId}`),
};

// Purchase APIs
export const purchaseAPI = {
  createOrder: (bookId) => api.post('/purchase/create-order', { bookId }),
  verifyPayment: (data) => api.post('/purchase/verify-payment', data),
  buyWithWallet: (bookId) => api.post('/purchase/buy-with-wallet', { bookId }),
  resendPDF: (purchaseId) => api.post(`/purchase/resend-pdf/${purchaseId}`),
  getPurchase: (purchaseId) => api.get(`/purchase/${purchaseId}`),
};

// Wallet APIs
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  withdraw: (data) => api.post('/wallet/withdraw', data),
  getWithdrawals: () => api.get('/wallet/requests'),
  getWithdrawal: (withdrawalId) => api.get(`/wallet/requests/${withdrawalId}`),
  cancelWithdrawal: (withdrawalId) =>
    api.post(`/wallet/requests/${withdrawalId}/cancel`),
};

export default api;