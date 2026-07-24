import express from 'express';
import { supabase } from '../supabase.js';
import { getScamAnalyticsPrompt } from '../ai.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    let scamLogs = [];
    if (supabase) {
      const { data, error } = await supabase
        .from('tourist_scam_checks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Last 100 logs for analytics
      if (!error && data) {
        scamLogs = data;
      }
    }

    const analytics = await getScamAnalyticsPrompt(scamLogs);

    res.json({ success: true, ...analytics });
  } catch (e) {
    console.error('Scam analytics API error:', e);
    res.status(500).json({ error: 'Failed to generate scam analytics' });
  }
});

export default router;
