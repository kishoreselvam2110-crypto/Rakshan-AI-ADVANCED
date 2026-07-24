// backend/routes/safetyEvents.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import { logSafetyEvent } from '../logSafetyEvent.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Rate limiting: max 60 requests per minute per IP
const safetyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many safety event logs, please slow down.' }
});
router.use(safetyLimiter);

/**
 * POST /api/safety-events
 * Body: {
 *   userId?: string,
 *   eventType: string,
 *   eventSource: string,
 *   riskScore?: number,
 *   latitude?: number,
 *   longitude?: number,
 *   metadata?: object
 * }
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      eventType,
      eventSource,
      riskScore = 0,
      latitude,
      longitude,
      metadata = {}
    } = req.body;
    await logSafetyEvent({
      userId,
      eventType,
      eventSource,
      riskScore,
      latitude,
      longitude,
      metadata
    });
    res.json({ success: true, message: 'Safety event logged' });
  } catch (e) {
    console.error('Log safety event API error:', e);
    res.status(500).json({ error: 'Failed to log safety event' });
  }
});

export default router;
