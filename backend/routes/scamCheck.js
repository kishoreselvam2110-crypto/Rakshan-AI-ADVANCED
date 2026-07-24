// backend/routes/scamCheck.js
import express from 'express';
import { getScamCheck } from '../ai.js';
import { supabase } from '../supabase.js';
import rateLimit from 'express-rate-limit';
import { logSafetyEvent } from '../logSafetyEvent.js';

const router = express.Router();

// Rate limiting: max 30 requests per minute per IP
const scamLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many scam checks, please slow down.' }
});
router.use(scamLimiter);

router.post('/', async (req, res) => {
  try {
    let { location, description, userId, message } = req.body;
    if (!description && message) {
      description = message;
    }
    if (!location) {
      location = "General / Dynamic";
    }
    if (!description) {
      return res.status(400).json({ error: 'description or message is required.' });
    }
    
    // Combine location and description into a single query for the AI engine
    const query = `Location: ${location}. Scenario: ${description}`;
    const result = await getScamCheck(query);
    
    const uId = userId || 'Anonymous';

    // 1. Insert check record into tourist_scam_checks database matching schema in migrations.sql
    if (supabase) {
      const { error } = await supabase.from('tourist_scam_checks').insert({
        user_id: uId,
        query: query,
        risk_score: result.riskScore || 0,
        risk_level: result.riskLevel || 'LOW',
        analysis: result.analysis || 'No analysis provided',
        recommendation: result.recommendation || 'No recommendation provided',
        created_at: new Date().toISOString()
      });
      if (error) console.error('Supabase scam insert error:', error.message);
    }

    // 2. Automatically log safety event for Scam Detection
    await logSafetyEvent({
      userId: uId,
      eventType: 'Scam Alert',
      eventSource: 'Scam Detection',
      riskScore: result.riskScore || 0,
      metadata: {
        location,
        description,
        riskLevel: result.riskLevel
      }
    });

    res.json({ success: true, ...result });
  } catch (e) {
    console.error('Scam check error:', e);
    res.status(500).json({ error: 'Scam check failed.' });
  }
});

export default router;
