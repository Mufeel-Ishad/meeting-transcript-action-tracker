const express = require('express');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../services/emailService');

const router = express.Router();

// In-memory store for shared results (in production, use a database)
const sharedResults = new Map();

/**
 * POST /api/share/email
 * Share action items via email
 */
router.post('/email', async (req, res, next) => {
  try {
    const { actions, recipients, subject, message } = req.body;

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return res.status(400).json({ error: 'Actions are required' });
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'At least one recipient email is required' });
    }

    if (!emailService.isServiceAvailable()) {
      return res.status(503).json({
        error: 'Email service is not configured. Please set SENDGRID_API_KEY in your environment variables.'
      });
    }

    // Check daily email limit
    if (!emailService.canSendEmail()) {
      return res.status(429).json({
        error: `Daily email limit reached (100 emails/day). Please try again tomorrow.`
      });
    }

    const remainingEmails = emailService.getRemainingEmails();
    if (recipients.length > remainingEmails) {
      return res.status(429).json({
        error: `Cannot send to ${recipients.length} recipients. Only ${remainingEmails} emails remaining today.`
      });
    }

    // Format actions as HTML table
    const actionsHtml = `
      <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>Owner</th>
            <th>Task</th>
          </tr>
        </thead>
        <tbody>
          ${actions.map(action => `
            <tr>
              <td>${action.owner || 'Unassigned'}</td>
              <td>${action.task || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const htmlContent = `
      <html>
        <body>
          <h2>Meeting Action Items</h2>
          ${message ? `<p>${message}</p>` : ''}
          <p>Total actions: ${actions.length}</p>
          ${actionsHtml}
        </body>
      </html>
    `;

    const textContent = actions.map(a => `${a.owner || 'Unassigned'}: ${a.task || ''}`).join('\n');

    // Send email using SendGrid
    await emailService.sendEmail(
      recipients,
      subject || 'Meeting Action Items',
      htmlContent,
      textContent
    );

    res.json({
      success: true,
      message: 'Email sent successfully',
      recipients: recipients
    });
  } catch (error) {
    console.error('Error sending email:', error);
    next(error);
  }
});

/**
 * POST /api/share/link
 * Create a shareable link for action items
 */
router.post('/link', (req, res, next) => {
  try {
    const { actions } = req.body;

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return res.status(400).json({ error: 'Actions are required' });
    }

    // Generate unique ID
    const shareId = uuidv4();

    // Store in memory (in production, use a database)
    sharedResults.set(shareId, {
      actions: actions,
      createdAt: new Date().toISOString()
    });

    // Generate shareable link
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const shareLink = `${baseUrl}/api/share/${shareId}`;

    res.json({
      success: true,
      shareId: shareId,
      shareLink: shareLink
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/share/email/quota
 * Get email quota information
 */
router.get('/email/quota', (req, res, next) => {
  try {
    if (!emailService.isServiceAvailable()) {
      return res.json({
        available: false,
        message: 'Email service is not configured'
      });
    }

    const remaining = emailService.getRemainingEmails();
    const limit = emailService.FREE_TIER_LIMIT;
    const used = limit - remaining;

    res.json({
      available: true,
      limit: limit,
      used: used,
      remaining: remaining,
      resetDate: emailService.lastResetDate
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/share/:shareId
 * Retrieve shared action items by share ID
 */
router.get('/:shareId', (req, res, next) => {
  try {
    const { shareId } = req.params;

    const sharedData = sharedResults.get(shareId);

    if (!sharedData) {
      return res.status(404).json({ error: 'Shared link not found or expired' });
    }

    res.json({
      success: true,
      actions: sharedData.actions,
      createdAt: sharedData.createdAt
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

