// GymTracker API Client
class GymAPI {
  static baseURL = (() => {
    const p = window.location.pathname || '';
    const prefix = p.startsWith('/gymtracker') ? '/gymtracker/api' : '/api';
    return window.location.origin + prefix;
  })();
  
  // Get auth token from localStorage
  static getToken() {
    return localStorage.getItem('gymtracker_token');
  }
  
  // Set auth token to localStorage
  static setToken(token) {
    localStorage.setItem('gymtracker_token', token);
  }
  
  // Remove auth token from localStorage
  static removeToken() {
    localStorage.removeItem('gymtracker_token');
    localStorage.removeItem('gymtracker_user');
  }
  
  // Make authenticated request
  static async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    // Add auth token if available
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(url, config);
      
      // Handle authentication errors globally
      if (response.status === 401) {
        this.removeToken();
        window.location.href = '/gymtracker/utente/';
        throw new Error('Authentication required');
      }
      
      // Parse JSON response
      const data = await response.json();
      
      if (!response.ok) {
        throw new APIError(data.error || 'Request failed', response.status, data);
      }
      
      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Handle network errors
      console.error('API request failed:', error);
      throw new APIError('Network error or server unavailable', 0, { originalError: error.message });
    }
  }
  
  // GET request
  static async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }
  
  // POST request
  static async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : null
    });
  }
  
  // PUT request
  static async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : null
    });
  }
  
  // DELETE request
  static async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
  
  // Authentication methods
  static async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.session?.access_token) {
      this.setToken(response.session.access_token);
      localStorage.setItem('gymtracker_user', JSON.stringify(response.user));
    }
    return response;
  }
  
  static async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.session?.access_token) {
      this.setToken(response.session.access_token);
      localStorage.setItem('gymtracker_user', JSON.stringify(response.user));
    }
    return response;
  }
  
  static async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.removeToken();
      window.location.href = '/gymtracker/utente/';
    }
  }
  
  static async getCurrentUser() {
    return this.get('/users/me');
  }
  
  static async updateProfile(profileData) {
    return this.put('/users/me', profileData);
  }
  
  static async changePassword(currentPassword, newPassword) {
    return this.put('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword
    });
  }
  
  static async getUserStats() {
    return this.get('/users/me/stats');
  }
  
  // Check if user is authenticated
  static isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Basic JWT validation (check expiration)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
  
  // Get cached user data
  static getCachedUser() {
    const userStr = localStorage.getItem('gymtracker_user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Custom API Error class
class APIError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Export for global use
window.GymAPI = GymAPI;
window.APIError = APIError;
