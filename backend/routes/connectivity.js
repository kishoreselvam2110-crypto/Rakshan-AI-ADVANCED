// backend/routes/connectivity.js
import express from 'express';
import { getConnectivityPrediction } from '../ai.js';
import { supabase } from '../supabase.js';
import rateLimit from 'express-rate-limit';
import { logSafetyEvent } from '../logSafetyEvent.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Rate limiting: max 60 requests per minute per IP
const connLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many connectivity requests, please slow down.' }
});
router.use(connLimiter);

// GET connectivity status (simple ping)
router.get('/status', (req, res) => {
  res.json({ success: true, online: true, timestamp: new Date().toISOString() });
});

// GET prediction endpoint
router.get('/prediction', async (req, res) => {
  try {
    const { lat, lon, signalQuality, networkType, userId } = req.query;
    const uId = userId || 'Anonymous';
    const logs = [];
    
    if (supabase) {
      const { data, error } = await supabase
        .from('connectivity_logs')
        .select('*')
        .eq('user_id', uId)
        .order('timestamp', { ascending: false })
        .limit(20);
      if (!error && data) logs.push(...data);
    }
    
    const parsedLat = parseFloat(lat) || 12.9716;
    const parsedLon = parseFloat(lon) || 77.5946;
    const parsedSignal = parseFloat(signalQuality) || 50;

    const result = await getConnectivityPrediction(
      parsedLat,
      parsedLon,
      parsedSignal,
      networkType || '4g',
      logs
    );
    
    // Log the connectivity telemetry data into database
    if (supabase) {
      await supabase.from('connectivity_logs').insert({
        user_id: uId,
        latitude: parsedLat,
        longitude: parsedLon,
        signal_quality: parsedSignal,
        network_type: networkType || '4g',
        timestamp: new Date().toISOString()
      });
    }

    // Automatically log safety event if connectivity drops or warning risk is high
    const isPoorSignal = parsedSignal < 30 || result.risk === 'HIGH';
    if (isPoorSignal) {
      await logSafetyEvent({
        userId: uId,
        eventType: 'Connectivity Alert',
        eventSource: 'Connectivity Prediction',
        riskScore: result.score !== undefined ? (100 - result.score) : 75,
        latitude: parsedLat,
        longitude: parsedLon,
        metadata: {
          networkType: networkType || '4g',
          signalQuality: parsedSignal,
          riskLevel: result.risk,
          recommendations: result.recommendations
        }
      });
    }

    res.json({ success: true, ...result });
  } catch (e) {
    console.error('Connectivity prediction error:', e);
    res.status(500).json({ error: 'Connectivity prediction failed.' });
  }
});

// GET heatmap data
router.get('/heatmap', async (req, res) => {
  try {
    const { timeFilter } = req.query; // '24h' or '7d'
    const limitDate = new Date();
    if (timeFilter === '7d') limitDate.setDate(limitDate.getDate() - 7);
    else limitDate.setDate(limitDate.getDate() - 1); // default 24h

    let query = supabase.from('connectivity_logs').select('latitude, longitude, signal_quality');
    if (timeFilter) {
      query = query.gte('timestamp', limitDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (e) {
    console.error('Heatmap fetch error:', e);
    res.status(500).json({ error: 'Failed to retrieve heatmap data.' });
  }
});

export default router;
