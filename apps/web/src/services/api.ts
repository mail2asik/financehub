import axios, { type AxiosResponse } from 'axios';

export const api = axios.create({
  baseURL: 'http://api-financehub.asik.local',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to extract API error messages from response payloads
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