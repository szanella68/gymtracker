// Using native fetch (Node.js 18+)

class WebhookService {
  constructor() {
    this.n8nEndpoint = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
    this.timeout = 5000; // 5 seconds timeout
  }

  // Standardize data structure for all webhooks
  standardizeWebhookData(eventType, rawData) {
    const standardData = {
      utente: {
        nome: rawData.name || rawData.utente?.nome || null,
        email: rawData.email || rawData.utente?.email || null,
        telefono: rawData.phone || rawData.utente?.telefono || null,
        altezza: rawData.height || rawData.utente?.altezza || null,
        peso: rawData.weight || rawData.utente?.peso || null,
        data_nascita: rawData.dateOfBirth || rawData.utente?.data_nascita || null
      },
      profilo: {
        genere: rawData.gender || rawData.profilo?.genere || null,
        livello: rawData.experienceLevel || rawData.profilo?.livello || null,
        obiettivo: rawData.fitnessGoal || rawData.profilo?.obiettivo || null,
        tipo_utente: rawData.userType || rawData.profilo?.tipo_utente || 'standard',
        attivo: rawData.active !== undefined ? rawData.active : (rawData.profilo?.attivo !== undefined ? rawData.profilo.attivo : null)
      },
      scheda: {
        titolo: rawData.planTitle || rawData.scheda?.titolo || null,
        descrizione: rawData.planDescription || rawData.scheda?.descrizione || null,
        creata_il: rawData.planCreatedAt || rawData.scheda?.creata_il || null,
        durata_settimane: rawData.planDurationWeeks || rawData.scheda?.durata_settimane || null,
        sessioni_per_settimana: rawData.sessionsPerWeek || rawData.scheda?.sessioni_per_settimana || null,
        sessioni: rawData.sessions || rawData.scheda?.sessioni || null
      },
      metadata: {
        userId: rawData.userId || null,
        registrationDate: rawData.registrationDate || null,
        activatedAt: rawData.activatedAt || null,
        deactivatedAt: rawData.deactivatedAt || null
      }
    };

    // For existing scheda webhooks, preserve the full data structure
    if (eventType === 'event.newscheda' && rawData.utente && rawData.profilo && rawData.scheda) {
      return {
        ...rawData,
        metadata: standardData.metadata
      };
    }

    return standardData;
  }

  async sendWebhook(eventType, data) {
    try {
      const standardizedData = this.standardizeWebhookData(eventType, data);
      const payload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: standardizedData
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

  async sendNewScheda(schedaData) {
    return this.sendWebhook('event.newscheda', schedaData);
  }

  // Debug function to test webhook structure
  async testWebhookStructures() {
    console.log('\n=== TESTING WEBHOOK STRUCTURES ===\n');
    
    // Test user.registered
    const registeredTest = this.standardizeWebhookData('user.registered', {
      userId: 'test-123',
      email: 'test@example.com',
      name: 'Test User',
      phone: '+1234567890',
      dateOfBirth: '1990-01-01',
      gender: 'M',
      fitnessGoal: 'muscle_gain',
      experienceLevel: 'beginner',
      height: '180 cm',
      weight: '75 kg',
      userType: 'registered',
      active: true,
      registrationDate: '2025-01-01T00:00:00Z'
    });
    console.log('user.registered structure:', JSON.stringify(registeredTest, null, 2));
    
    // Test user.activated
    const activatedTest = this.standardizeWebhookData('user.activated', {
      userId: 'test-456',
      email: 'test2@example.com',
      name: 'Another User',
      activatedAt: '2025-01-01T12:00:00Z'
    });
    console.log('\nuser.activated structure:', JSON.stringify(activatedTest, null, 2));
    
    // Test event.newscheda (existing structure)
    const schedaTest = this.standardizeWebhookData('event.newscheda', {
      utente: { nome: 'User Name', email: 'user@test.com' },
      profilo: { genere: 'F', attivo: true },
      scheda: { titolo: 'Test Plan', sessioni: [] },
      metadata: { userId: 'test-789' }
    });
    console.log('\nevent.newscheda structure:', JSON.stringify(schedaTest, null, 2));
    
    console.log('\n=== END WEBHOOK STRUCTURE TEST ===\n');
  }
}

module.exports = new WebhookService();