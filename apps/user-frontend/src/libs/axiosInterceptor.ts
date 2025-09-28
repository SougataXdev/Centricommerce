import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
});

const REFRESH_URL = '/renew-access-token-users';

let isRefreshing = false;
type Subscriber = {
  resolve: () => void;
  reject: (err: unknown) => void;
};
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

const handleLogout = () => {
  // Client-side cleanup and redirect. httpOnly cookies must be cleared server-side.
  window.location.href = '/login';
};

// Request: cookie-first, nothing to attach. Keep for future per-request tweaks (e.g., request IDs).
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: on 401, attempt refresh once, queue concurrent requests, guard against loops, and reject queued on failure
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (
    error: AxiosError & { config?: AxiosRequestConfig & { _retry?: boolean } }
  ) => {
    const originalRequest = error.config;

    // If no response or no config, just bubble up
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    // Do not try to refresh for the refresh endpoint itself
    const isRefreshCall = (originalRequest.url || '').includes(REFRESH_URL);

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      if (isRefreshing) {
        // Queue and wait for ongoing refresh
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
        // Use global axios to avoid this interceptor and prevent recursion
        await axios.post(
          `http://localhost:8080/api${REFRESH_URL}`,
          {},
          { withCredentials: true }
        );

        isRefreshing = false;
        onRefreshSuccess();

        // Retry original request (cookies now carry the refreshed access token)
        return axiosInstance(originalRequest);
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


//AI WRITES GOOD COMMENTS THAN ME 😆