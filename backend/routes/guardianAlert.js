import express from 'express';
import { supabase } from '../supabase.js';
import { getGuardianRecommendationPrompt } from '../ai.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Abstraction layer for future API integrations (Twilio, WhatsApp, etc.)
class GuardianNotificationProvider {
  static async send(userId, message, urgency) {
    console.log(`[GuardianNotificationProvider] Simulating ${urgency} alert to contacts of ${userId}: ${message}`);
    // Future integration: Twilio.messages.create(...)
    
    // Log the alert to database
    if (supabase) {
      await supabase.from('guardian_alerts').insert({
        user_id: userId,
        alert_type: 'GUARDIAN_SUGGESTION',
        message: message,
        status: 'SENT',
        provider: 'SIMULATED'
      });
    }
    return true;
  }
}

router.post('/', async (req, res) => {
  try {
    const { userId } = req.body;
    let safetyEvents = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('safety_events')
        .select('*')
        .eq('user_id', userId || 'Anonymous')
        .order('created_at', { ascending: false })
        .limit(10);
      if (!error && data) {
        safetyEvents = data;
      }
    }

    const recommendation = await getGuardianRecommendationPrompt(safetyEvents);

    // If user explicitly triggers this route or the app automatically requests it based on score drop,
    // we return the recommendation to the frontend so the user can see the "GuardianPromptModal".
    res.json({ success: true, recommendation });
  } catch (e) {
    console.error('Guardian alert API error:', e);
    res.status(500).json({ error: 'Failed to process guardian alert' });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { userId, message, urgency } = req.body;
    await GuardianNotificationProvider.send(userId || 'Anonymous', message, urgency);
    res.json({ success: true, message: 'Guardian alert sent.' });
  } catch (e) {
    console.error('Send Guardian alert error:', e);
    res.status(500).json({ error: 'Failed to send alert' });
  }
});

export default router;
