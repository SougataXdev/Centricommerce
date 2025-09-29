import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true, // always send cookies
});

const REFRESH_URL = '/renew-access-token-users';

let isRefreshing = false;
type Subscriber = { resolve: () => void; reject: (err: unknown) => void };
let refreshSubscribers: Subscriber[] = [];

const subscribeTokenRefresh = (subscriber: Subscriber) => {
  refreshSubscribers.push(subscriber);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach(({ resolve }) => resolve());
  refreshSubscribers = [];
};

const onRefreshFailure = (err: unknown) => {
  refreshSubscribers.forEach(({ reject }) => reject(err));
  refreshSubscribers = [];
};

const AUTH_ROUTES = ['/login', '/register'];
const handleLogout = () => {
  // Avoid redirect loops if we're already on an auth route
  if (!AUTH_ROUTES.includes(window.location.pathname)) {
    window.location.href = '/login';
  }
};

// ✅ Request interceptor (reserved for future request customizations)
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ✅ Response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (
    error: AxiosError & { config?: AxiosRequestConfig & { _retry?: boolean } }
  ) => {
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const isRefreshCall = (originalRequest.url || '').includes(REFRESH_URL);

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      if (isRefreshing) {
        // Queue this request until refresh finishes
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh({
            resolve: () => resolve(axiosInstance(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use global axios (not axiosInstance) to avoid recursion
        await axios.post(
          `${axiosInstance.defaults.baseURL}${REFRESH_URL}`,
          {},
          { withCredentials: true }
        );

        isRefreshing = false;
        onRefreshSuccess();

        return axiosInstance(originalRequest); // retry original request
      } catch (err) {
        isRefreshing = false;
        onRefreshFailure(err);
        handleLogout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
