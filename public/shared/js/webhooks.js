// Shared webhook notification system

function showWebhookNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `webhook-notification webhook-${type}`;
  notification.innerHTML = `
    <div class="webhook-notification-content">
      <span class="webhook-message">${message}</span>
      <button class="webhook-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Add styles if not already present
  if (!document.getElementById('webhook-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'webhook-notification-styles';
    style.textContent = `
      .webhook-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
      }
      
      .webhook-notification.webhook-success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
      }
      
      .webhook-notification.webhook-error {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
      }
      
      .webhook-notification.webhook-info {
        background: #d1ecf1;
        border: 1px solid #bee5eb;
        color: #0c5460;
      }
      
      .webhook-notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        gap: 12px;
      }
      
      .webhook-message {
        flex: 1;
        font-weight: 500;
      }
      
      .webhook-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: inherit;
        opacity: 0.7;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .webhook-close:hover {
        opacity: 1;
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Helper function to handle webhook results from API responses
function handleWebhookResult(response) {
  if (response && response.webhook) {
    if (response.webhook.success) {
      showWebhookNotification('✅ Webhook inviato con successo', 'success');
    } else {
      showWebhookNotification('❌ Webhook fallito: ' + (response.webhook.error || 'Errore sconosciuto'), 'error');
    }
  }
}

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { showWebhookNotification, handleWebhookResult };
}