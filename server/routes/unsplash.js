/**
 * Unsplash Routes
 * Provides search endpoint for finding landscape presentation images.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { fetchSlideImage } = require('../utils/unsplash');

// GET /api/unsplash/search?query=...
router.get('/search', protect, async (req, res, next) => {
  try {
    const query = req.query.query || 'minimalist abstract';
    const image = await fetchSlideImage(query);
    res.json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
