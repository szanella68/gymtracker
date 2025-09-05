// GymTracker Utility Functions

class Utils {
  // Format date for display
  static formatDate(dateString, options = {}) {
    const date = new Date(dateString);
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    return date.toLocaleDateString('it-IT', defaultOptions);
  }
  
  // Format date and time
  static formatDateTime(dateString, options = {}) {
    const date = new Date(dateString);
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    return date.toLocaleString('it-IT', defaultOptions);
  }
  
  // Get relative time (e.g., "2 giorni fa")
  static getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    const intervals = [
      { label: 'anno', seconds: 31536000 },
      { label: 'mese', seconds: 2592000 },
      { label: 'giorno', seconds: 86400 },
      { label: 'ora', seconds: 3600 },
      { label: 'minuto', seconds: 60 }
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        const plural = count > 1 ? (interval.label === 'mese' ? 'mesi' : interval.label + 'i') : interval.label;
        return `${count} ${plural} fa`;
      }
    }
    
    return 'Adesso';
  }
  
  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Show loading state
  static showLoading(element, text = 'Caricamento...') {
    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;
    element.innerHTML = `<div class="loading-spinner"></div> ${text}`;
    element.disabled = true;
  }
  
  // Hide loading state
  static hideLoading(element) {
    const originalContent = element.dataset.originalContent;
    if (originalContent) {
      element.innerHTML = originalContent;
      delete element.dataset.originalContent;
    }
    element.disabled = false;
  }
  
  // Show error message
  static showError(container, message) {
    container.innerHTML = `<div class="error-message">${message}</div>`;
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  // Show success message
  static showSuccess(container, message) {
    container.innerHTML = `<div class="success-message">${message}</div>`;
    setTimeout(() => {
      container.innerHTML = '';
    }, 5000);
  }
  
  // Clear message
  static clearMessage(container) {
    container.innerHTML = '';
  }
  
  // Debounce function for search inputs
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Get query parameters from URL
  static getQueryParams() {
    return new URLSearchParams(window.location.search);
  }
  
  // Update query parameter without reload
  static updateQueryParam(key, value) {
    const url = new URL(window.location);
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    window.history.replaceState({}, '', url);
  }
  
  // Copy text to clipboard
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }
  
  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Generate unique ID
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // Capitalize first letter
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  // Escape HTML to prevent XSS
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Scroll to element smoothly
  static scrollTo(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
  
  // Check if element is in viewport
  static isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  // Local storage helpers with error handling
  static setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }
  
  static getLocalStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  }
  
  static removeLocalStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }
}

// Export for global use
window.Utils = Utils;