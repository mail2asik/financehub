import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'http://api-financehub.asik.local';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper variables to manage token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor: Attach Authorization Header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Prevent infinite loops if authentication/refresh endpoints fail with 401
    const isAuthEndpoint = originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue pending requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint using raw axios to avoid interceptor loop
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

        if (response.data.success) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Utility function to parse standard API error responses
 */
export const parseApiError = (error: unknown): string[] => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data;
    if (Array.isArray(data.message)) {
      return data.message;
    }
    if (typeof data.message === 'string') {
      return [data.message];
    }
  }
  return ['An unexpected error occurred. Please try again.'];
};

/**
 * Helper to download files (blobs) using authenticated AJAX request
 * @param url The API endpoint for the download
 * @param filename Default filename if the server doesn't provide one
 */
export const downloadFile = async (url: string, filename = 'download'): Promise<void> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response: AxiosResponse<Blob> = await api.get(url, {
      responseType: 'blob', // **CRITICAL**: Tells Axios to handle the response as a Blob, not JSON
    });

    // 1. Create a dynamic, temporary link element
    const link = document.createElement('a');
    // 2. Create a special URL from our Blob data
    link.href = window.URL.createObjectURL(new Blob([response.data]));

    // 3. Optional: Extract filename from Content-Disposition header if possible
    let finalFilename = filename;
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        finalFilename = fileNameMatch[1];
      }
    }
    
    // Set the browser's download filename
    link.setAttribute('download', finalFilename);

    // 4. Append to document, trigger the download, then remove
    document.body.appendChild(link);
    link.click();
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  } catch (error) {
    // Pass errors through parseApiError for consistency
    throw error;
  }
};