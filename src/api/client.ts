import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/dashboard',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Response interceptor — unwrap data and normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? 'Unknown error';
    console.error('[API Error]', message);
    return Promise.reject(error);
  },
);

export default apiClient;
