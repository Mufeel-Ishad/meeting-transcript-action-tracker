const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
    this.isAvailable = !!this.apiKey;
    
    // Daily email counter (in production, use a database)
    this.dailyEmailCount = 0;
    this.lastResetDate = new Date().toDateString();
    this.FREE_TIER_LIMIT = 100; // SendGrid free tier: 100 emails/day

    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    } else {
      console.warn('SendGrid API key not found. Email sharing will not be available.');
      console.warn('Please set SENDGRID_API_KEY in your environment variables.');
    }
  }

  /**
   * Reset daily counter if it's a new day
   */
  resetDailyCounterIfNeeded() {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailyEmailCount = 0;
      this.lastResetDate = today;
    }
  }

  /**
   * Check if we can send more emails today
   * @returns {boolean}
   */
  canSendEmail() {
    this.resetDailyCounterIfNeeded();
    return this.dailyEmailCount < this.FREE_TIER_LIMIT;
  }

  /**
   * Get remaining emails for today
   * @returns {number}
   */
  getRemainingEmails() {
    this.resetDailyCounterIfNeeded();
    return Math.max(0, this.FREE_TIER_LIMIT - this.dailyEmailCount);
  }

  /**
   * Send email using SendGrid
   * @param {Array<string>} recipients - Array of email addresses
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML email content
   * @param {string} textContent - Plain text email content
   * @returns {Promise<void>}
   */
  async sendEmail(recipients, subject, htmlContent, textContent) {
    if (!this.isAvailable) {
      throw new Error('SendGrid API key is not configured. Please set SENDGRID_API_KEY in your environment variables.');
    }

    this.resetDailyCounterIfNeeded();

    if (!this.canSendEmail()) {
      throw new Error(`Daily email limit reached (${this.FREE_TIER_LIMIT} emails/day). Please try again tomorrow.`);
    }

    if (recipients.length > this.getRemainingEmails()) {
      throw new Error(`Cannot send to ${recipients.length} recipients. Only ${this.getRemainingEmails()} emails remaining today.`);
    }

    try {
      const messages = recipients.map(recipient => ({
        to: recipient,
        from: this.fromEmail,
        subject: subject,
        html: htmlContent,
        text: textContent,
      }));

      // Send emails (SendGrid allows batch sending)
      await sgMail.send(messages);
      
      // Update counter
      this.dailyEmailCount += recipients.length;

      console.log(`Sent ${recipients.length} email(s). Daily count: ${this.dailyEmailCount}/${this.FREE_TIER_LIMIT}`);
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
      if (error.response) {
        throw new Error(`SendGrid API error: ${error.response.body?.errors?.[0]?.message || error.message}`);
      }
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Check if the service is available
   * @returns {boolean}
   */
  isServiceAvailable() {
    return this.isAvailable;
  }
}

module.exports = new EmailService();

