// backend/routes/safetyScore.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import { computeSafetyScore } from '../computeSafetyScore.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Rate limiting: max 30 requests per minute per IP
const scoreLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests for safety score, please slow down.' }
});
router.use(scoreLimiter);

/**
 * GET /api/safety-score
 * Query parameters:
 *   userId?: string (defaults to 'Anonymous')
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'Anonymous';
    const result = await computeSafetyScore(userId);
    res.json({
      success: true,
      ...result
    });
  } catch (e) {
    console.error('Compute safety score API error:', e);
    res.status(500).json({ error: 'Failed to compute safety score' });
  }
});

export default router;
