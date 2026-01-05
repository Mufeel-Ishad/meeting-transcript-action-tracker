const express = require('express');
const actionExtractor = require('../services/actionExtractor');

const router = express.Router();

/**
 * POST /api/actions/extract
 * Extract actions from provided text
 */
router.post('/extract', (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }

    const actions = actionExtractor.extractActionsEnhanced(text);

    res.json({
      success: true,
      actions: actions,
      actionCount: actions.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

