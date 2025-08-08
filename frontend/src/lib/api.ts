import axios from 'axios';

// Configure base API URL - you can update this to match your ASP.NET API
const API_BASE_URL = 'https://localhost:7205/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Customer API calls
export const customerAPI = {
  // Get all customers
  getAll: () => api.get('/Musteriler'),
  
  // Get customer by ID
  getById: (musteriNo: number) => api.get(`/Musteriler/${musteriNo}`),
  
  // Get customers by branch
  getByBranch: (subeAdi: string) => api.get(`/Musteriler/sube/${encodeURIComponent(subeAdi)}`),
  
  // Update customer
  update: (musteriNo: number, data: any) => api.put(`/Musteriler/${musteriNo}`, data),
  
  // Create customer
  create: (data: any) => api.post('/Musteriler', data),
  
  // Delete customer
  delete: (musteriNo: number) => api.delete(`/Musteriler/${musteriNo}`),
};

// Payment API calls
export const paymentAPI = {
  // Get all payments
  getAll: () => api.get('/Odemeler'),
  
  // Get payment by ID
  getById: (odemeId: number) => api.get(`/Odemeler/${odemeId}`),
  
  // Create payment
  create: (data: any) => api.post('/Odemeler', data),
  
  // Update payment
  update: (odemeId: number, data: any) => api.put(`/Odemeler/${odemeId}`, data),
  
  // Delete payment
  delete: (odemeId: number) => api.delete(`/Odemeler/${odemeId}`),
};

export default api;