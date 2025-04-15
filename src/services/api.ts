import axios from 'axios';

// Environment-based configuration
const getApiUrl = () => {
  // Check if we're in production by looking at the current URL
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1';
  
  if (isProduction) {
    // If we're accessing via IP address directly, use that IP
    // This allows the app to work when accessed from other devices on the network
    return `http://${window.location.hostname}:8000/api`;
  } else {
    // Return development API URL (for local development)
    return 'http://localhost:8000/api';
  }
};

const getAuthUrl = () => {
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1';
  
  if (isProduction) {
    return `http://${window.location.hostname}:8000/auth`;
  } else {
    return 'http://localhost:8000/auth';
  }
};

// Set dynamic API URLs
const API_URL = getApiUrl();
const AUTH_URL = getAuthUrl();

// Create an axios instance with dynamic baseURL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Create auth client instance with dynamic baseURL
const authClient = axios.create({
  baseURL: AUTH_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include the token in all API requests
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add request interceptor for authClient too
authClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Authentication functions
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await authClient.post('/jwt/create/', { username, password });
    const { access, refresh } = response.data;
    
    // Store tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    return { success: true, token: access };
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Try a different approach for the problematic endpoint
    const response = await axios.get(`${AUTH_URL}/users/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Try Bearer format instead of JWT
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    // Try alternative format if first attempt fails
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${AUTH_URL}/users/me/`, {
        headers: {
          'Authorization': `JWT ${token}`, // Try JWT format as fallback
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (secondError) {
      console.error('Second attempt failed:', secondError);
      // Don't throw the error - just return an empty profile instead
      return { username: localStorage.getItem('user_name') || 'User' };
    }
  }
};

export const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    
    if (!refresh) {
      throw new Error('No refresh token found');
    }
    
    const response = await authClient.post('/jwt/refresh/', { refresh });
    const { access } = response.data;
    
    // Store new access token
    localStorage.setItem('access_token', access);
    
    return { success: true, token: access };
  } catch (error) {
    // Clear tokens on refresh failure
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_name');
  
  // Dispatch event to notify App.vue about logout
  window.dispatchEvent(new CustomEvent('auth-event', { 
    detail: { action: 'logout' } 
  }));
  
  return { success: true };
};

// Add a console.log to debug the API URL
console.log('API URL:', API_URL);

// College data interface
export interface College {
  id: number;
  name: string;
  state: string | null;
  city: string | null;
  website: string | null;
  description: string | null;
  acceptance_rate: number | null;
  cost_of_attendance: number | null;
  external_id: string | null;
}

// College list response with pagination
export interface CollegeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: College[];
}

// Get colleges with pagination and sorting
export const getColleges = async (
  page = 1, 
  ordering = 'name',
  pageSize = 25
): Promise<CollegeListResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    
    if (ordering) {
      params.append('ordering', ordering);
    }
    
    // Log the request details
    console.log(`Fetching colleges from ${API_URL}/colleges/ with params:`, params.toString());
    
    const response = await apiClient.get('/colleges/', { params });
    console.log('College API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

// Get college statistics
export const getCollegeStats = async (): Promise<{ 
  total_colleges: number;
  states_represented: number;
}> => {
  try {
    const response = await apiClient.get('/colleges/stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching college stats:', error);
    return { total_colleges: 0, states_represented: 0 };
  }
};