/**
 * AI Routes
 * All routes are protected — require authentication.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generatePresentation, slideAction, suggestSlide } = require('../controllers/aiController');

// All AI routes require authentication
router.use(protect);

// POST   /api/ai/generate       — generate a full presentation from a topic
router.post('/generate', generatePresentation);

// POST   /api/ai/slide-action   — perform AI action on a single slide (polish, expand, etc.)
router.post('/slide-action', slideAction);

// POST   /api/ai/suggest-slide  — suggest the next slide based on context
router.post('/suggest-slide', suggestSlide);

module.exports = router;
