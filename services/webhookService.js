// Using native fetch (Node.js 18+)

class WebhookService {
  constructor() {
    this.n8nEndpoint = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
    this.timeout = 5000; // 5 seconds timeout
  }

  async sendWebhook(eventType, data) {
    try {
      const payload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: data
      };

      console.log(`[WebhookService] Sending webhook: ${eventType}`, JSON.stringify(payload, null, 2));
      
      const response = await fetch(this.n8nEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: this.timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`[WebhookService] Webhook sent successfully:`, result);
      
      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error(`[WebhookService] Failed to send webhook:`, error.message);
      console.error(`[WebhookService] Error details:`, {
        name: error.name,
        cause: error.cause,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
      
      return {
        success: false,
        error: error.message,
        errorType: error.name
      };
    }
  }

  async sendUserRegistered(userData) {
    return this.sendWebhook('user.registered', userData);
  }

  async sendUserPreregistered(userData) {
    return this.sendWebhook('user.preregistered', userData);
  }

  async sendUserActivated(userData) {
    return this.sendWebhook('user.activated', userData);
  }

  async sendUserDeactivated(userData) {
    return this.sendWebhook('user.deactivated', userData);
  }
}

module.exports = new WebhookService();