// backend/routes/offlineKit.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { logSafetyEvent } from '../logSafetyEvent.js';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

const DATA_FILE = path.join(process.cwd(), 'data_store.json');

// Rate limiting: max 45 requests per minute per IP
const kitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 45,
  message: { error: 'Too many requests for offline kit, please slow down.' }
});
router.use(kitLimiter);

// Load helper for ID store and medical/custom kit settings
const getStores = () => {
  let touristIdStore = {};
  let offlineKitSettings = {};
  if (fs.existsSync(DATA_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      // The server.js stores ID in root or under a key
      // Let's check if the root is just IDs or if it has namespaces.
      // We will handle if it's the root.
      touristIdStore = parsed;
      // We will look for a special key for offline settings inside the parsed object
      if (parsed.__offlineKitSettings) {
        offlineKitSettings = parsed.__offlineKitSettings;
      }
    } catch (e) {
      console.error('Offline Kit: Failed to read data_store.json:', e.message);
    }
  }
  return { touristIdStore, offlineKitSettings };
};

const saveOfflineSettings = (settings) => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      parsed.__offlineKitSettings = {
        ...parsed.__offlineKitSettings,
        ...settings
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.error('Offline Kit: Failed to save settings to data_store.json:', e.message);
    }
  } else {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ __offlineKitSettings: settings }, null, 2));
    } catch (e) {
      console.error('Offline Kit: Failed to create and save data_store.json:', e.message);
    }
  }
};

/**
 * GET /api/offline-kit
 * Query params: userId, lat, lon
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'Anonymous';
    const lat = req.query.lat ? parseFloat(req.query.lat) : null;
    const lon = req.query.lon ? parseFloat(req.query.lon) : null;

    const { touristIdStore, offlineKitSettings } = getStores();

    // 1. Digital Traveler ID lookup
    let travelerIdData = null;
    if (touristIdStore[userId]) {
      travelerIdData = touristIdStore[userId];
    } else {
      // Find inside the values
      const found = Object.values(touristIdStore).find(
        (item) => item?.data?.id === userId || item?.data?.name === userId
      );
      if (found) {
        travelerIdData = found;
      }
    }

    // 2. Fetch last known coordinates from Supabase if not provided
    let finalLat = lat || 12.9716;
    let finalLon = lon || 77.5946;
    if (supabase && (!lat || !lon) && userId !== 'Anonymous') {
      const { data, error } = await supabase
        .from('connectivity_logs')
        .select('latitude, longitude')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        finalLat = data.latitude;
        finalLon = data.longitude;
      }
    }

    // 3. Structured Emergency Contacts
    const userSettings = offlineKitSettings[userId] || {};
    const emergencyContacts = [
      { name: 'National Emergency', number: '112' },
      { name: 'Police Helpline', number: '100' },
      { name: 'Ambulance', number: '102' },
      { name: 'SHIELD SOS Helpline', number: '+91 80 2220 2220' }
    ];
    if (travelerIdData?.data?.emergencyContact) {
      emergencyContacts.push({
        name: `Traveler ID Emergency (${travelerIdData.data.name})`,
        number: travelerIdData.data.emergencyContact
      });
    }
    if (userSettings.customContacts && Array.isArray(userSettings.customContacts)) {
      emergencyContacts.push(...userSettings.customContacts);
    }

    // 4. Nearby Medical and Police Centers (standard fallback list based on lat/lon)
    const nearbyHospitals = [
      { name: 'Apollo Hospitals', address: 'Bannerghatta Road, Jayanagar', contact: '+91 80 2630 4050', lat: 12.8954, lon: 77.5979 },
      { name: 'Manipal Hospital', address: 'HAL Old Airport Road', contact: '+91 80 2502 4444', lat: 12.9562, lon: 77.6482 },
      { name: 'Fortis Hospital', address: 'Cunningham Road, Vasanth Nagar', contact: '+91 80 4019 4019', lat: 12.9892, lon: 77.5928 }
    ];
    const nearbyPoliceStations = [
      { name: 'Cubbon Park Police Station', address: 'Kasturba Road', contact: '+91 80 2294 2581', lat: 12.9754, lon: 77.5962 },
      { name: 'Halasuru Police Station', address: 'Old Madras Road', contact: '+91 80 2294 2526', lat: 12.9788, lon: 77.6254 }
    ];

    // 5. Emergency Action Instructions
    const emergencyInstructions = [
      {
        scenario: 'Geofence Breach',
        steps: [
          'Turn back immediately. Do not venture further into marked danger zones.',
          'Open offline routes to navigate back to the designated safe zone.',
          'Keep your phone battery saved; turn down screen brightness.'
        ]
      },
      {
        scenario: 'Medical Emergency',
        steps: [
          'Locate the nearest hospital from the Offline Kit list.',
          'If unable to move, activate the physical SOS beacon or trigger SHIELD SOS via app.',
          'Prepare your digital medical card details for first responders.'
        ]
      },
      {
        scenario: 'Scam & Threat',
        steps: [
          'Do not agree to unauthorized payments. Politely refuse and walk away.',
          'If followed or threatened, head directly to the nearest police station on the list.',
          'State clearly that you have a registered SHIELD Digital Traveler ID.'
        ]
      },
      {
        scenario: 'Dead Zone/No signal',
        steps: [
          'Avoid entering unknown wilderness zones.',
          'Stay in open areas to improve chances of GPS connection.',
          'Rely on cached emergency documents and instructions.'
        ]
      }
    ];

    // 6. Medical Info
    const medicalInformation = {
      bloodType: userSettings.bloodType || 'Unknown',
      allergies: userSettings.allergies || 'None declared',
      conditions: userSettings.conditions || 'None declared',
      insurancePolicy: userSettings.insurancePolicy || 'None declared'
    };

    res.json({
      success: true,
      digitalId: travelerIdData || {
        data: {
          id: 'GUEST-' + userId.slice(0, 5),
          name: 'Anonymous Traveler',
          emergencyContact: '112'
        },
        qrCode: ''
      },
      emergencyContacts,
      lastKnownLocation: { lat: finalLat, lon: finalLon },
      nearbyHospitals,
      nearbyPoliceStations,
      emergencyInstructions,
      medicalInformation,
      queuedSOS: []
    });
  } catch (e) {
    console.error('Offline kit fetch error:', e);
    res.status(500).json({ error: 'Failed to retrieve Offline Emergency Kit' });
  }
});

/**
 * POST /api/offline-kit/activate
 * Logs an activation safety event.
 */
router.post('/activate', async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;
    await logSafetyEvent({
      userId: userId || 'Anonymous',
      eventType: 'Offline Kit Activation',
      eventSource: 'Offline Emergency Kit',
      riskScore: 40, // Offline mode implies connection issues
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      metadata: { activatedAt: new Date().toISOString() }
    });
    res.json({ success: true, message: 'Offline mode activation logged.' });
  } catch (e) {
    console.error('Offline kit activation log error:', e);
    res.status(500).json({ error: 'Failed to log activation event' });
  }
});

/**
 * POST /api/offline-kit/settings
 * Updates medical information and custom emergency contacts.
 */
router.post('/settings', async (req, res) => {
  try {
    const { userId, bloodType, allergies, conditions, insurancePolicy, customContacts } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { offlineKitSettings } = getStores();
    const userSettings = offlineKitSettings[userId] || {};

    const newSettings = {
      ...offlineKitSettings,
      [userId]: {
        ...userSettings,
        bloodType: bloodType !== undefined ? bloodType : userSettings.bloodType,
        allergies: allergies !== undefined ? allergies : userSettings.allergies,
        conditions: conditions !== undefined ? conditions : userSettings.conditions,
        insurancePolicy: insurancePolicy !== undefined ? insurancePolicy : userSettings.insurancePolicy,
        customContacts: customContacts !== undefined ? customContacts : userSettings.customContacts
      }
    };

    saveOfflineSettings(newSettings);
    res.json({ success: true, message: 'Offline Kit preferences updated.' });
  } catch (e) {
    console.error('Update offline settings error:', e);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;
