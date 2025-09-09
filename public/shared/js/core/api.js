// GymTracker API Client
class GymAPI {
  static baseURL = (() => {
    const isLocal = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
    // Locale: il backend espone /api direttamente
    // Proxy (zanserver): le API sono sotto /gymtracker/api
    const prefix = isLocal ? '/api' : '/gymtracker/api';
    return window.location.origin + prefix;
  })();
  
  // Get auth token from localStorage
 // Sostituisci questo metodo in shared/js/core/api.js

// Get auth token from localStorage (compatibilità sistemi multipli)
static getToken() {
  // Cerca nei diversi sistemi di storage
  
  // 1. Sistema nuovo: gymtracker_session
  try {
    const session = localStorage.getItem('gymtracker_session');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.access_token) {
        return parsed.access_token;
      }
    }
  } catch (e) {
    console.warn('[GymAPI] Error parsing gymtracker_session:', e);
  }
  
  // 2. Sistema diretto: gymtracker_token
  const directToken = localStorage.getItem('gymtracker_token');
  if (directToken) {
    return directToken;
  }
  
  // 3. Sistema vecchio: supabase_token (fallback)
  const supabaseToken = localStorage.getItem('supabase_token');
  if (supabaseToken) {
    return supabaseToken;
  }
  
  // 4. Sistema vecchio: supabase_access_token (fallback)
  const supabaseAccessToken = localStorage.getItem('supabase_access_token');
  if (supabaseAccessToken) {
    return supabaseAccessToken;
  }
  
  console.warn('[GymAPI] No auth token found in any storage system');
  return null;
}
  static getRefreshToken() {
    return localStorage.getItem('gymtracker_refresh');
  }

  // Sostituisci anche questi metodi in shared/js/core/api.js

// Set auth token to localStorage (salva in formato unificato)
static setToken(token) {
  if (token) {
    // Salva nel sistema principale
    localStorage.setItem('gymtracker_token', token);
    
    // Mantieni compatibilità con sistema vecchio per sicurezza
    localStorage.setItem('supabase_token', token);
    
    console.log('[GymAPI] Token saved in unified storage');
  }
}

// Set refresh token
static setRefreshToken(token) {
  if (token) {
    localStorage.setItem('gymtracker_refresh', token);
    localStorage.setItem('supabase_refresh_token', token); // compatibilità
  }
}

// Remove auth token from localStorage (pulisce tutti i sistemi)
static removeToken() {
  // Pulisci sistema principale
  localStorage.removeItem('gymtracker_token');
  localStorage.removeItem('gymtracker_user');
  localStorage.removeItem('gymtracker_refresh');
  localStorage.removeItem('gymtracker_session');
  
  // Pulisci sistema vecchio
  localStorage.removeItem('supabase_token');
  localStorage.removeItem('supabase_user');
  localStorage.removeItem('supabase_refresh_token');
  localStorage.removeItem('supabase_access_token');
  
  console.log('[GymAPI] All auth data cleared from storage');
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
      let response = await fetch(url, config);
      
      // Handle authentication errors globally
      if (response.status === 401) {
        // Try refresh once if we have refresh token
        const rt = this.getRefreshToken();
        if (rt) {
          try {
            const ref = await fetch(`${this.baseURL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: rt })
            });
            if (ref.ok) {
              const rj = await ref.json();
              const newToken = rj?.session?.access_token;
              if (newToken) {
                this.setToken(newToken);
                // retry original request once with new token
                config.headers['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(url, config);
              }
            }
          } catch {}
        }
        if (response.status === 401) {
          this.removeToken();
          window.location.href = '/gymtracker/utente/';
          throw new Error('Authentication required');
        }
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
      // store refresh token if present
      if (response.session.refresh_token) this.setRefreshToken(response.session.refresh_token);
    }
    return response;
  }
  
  static async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.session?.access_token) {
      this.setToken(response.session.access_token);
      localStorage.setItem('gymtracker_user', JSON.stringify(response.user));
      if (response.session.refresh_token) this.setRefreshToken(response.session.refresh_token);
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
