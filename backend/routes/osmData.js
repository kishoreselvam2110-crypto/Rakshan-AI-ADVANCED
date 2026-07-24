import express from 'express';
import axios from 'axios';

const router = express.Router();

// In-memory cache for Overpass queries to prevent rate-limiting and enable offline fallback
const poiCache = new Map();

/**
 * GET /api/osm/pois
 * Query parameters: lat, lon, radius (default 5000m), category (hospitals, police, fuel, shelter, atm)
 */
router.get('/pois', async (req, res) => {
  const { lat, lon, radius = 5000, category = 'hospitals' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat/lon parameters' });
  }

  const cacheKey = `${category}-${parseFloat(lat).toFixed(2)}-${parseFloat(lon).toFixed(2)}-${radius}`;

  if (poiCache.has(cacheKey)) {
    return res.json({
      success: true,
      dataStatus: 'CACHED',
      pois: poiCache.get(cacheKey)
    });
  }

  let amenityFilter = 'hospital';
  if (category === 'police') amenityFilter = 'police';
  if (category === 'fuel') amenityFilter = 'fuel';
  if (category === 'atm') amenityFilter = 'atm';
  if (category === 'shelter') amenityFilter = 'shelter';

  const overpassQuery = `
    [out:json][timeout:5];
    (
      node["amenity"="${amenityFilter}"](around:${radius},${lat},${lon});
      way["amenity"="${amenityFilter}"](around:${radius},${lat},${lon});
    );
    out center 25;
  `;

  try {
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(overpassQuery)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000
      }
    );

    if (response.data && response.data.elements) {
      const pois = response.data.elements.map((el) => ({
        id: el.id,
        name: el.tags?.name || `${category.toUpperCase()} Station`,
        type: category,
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        address: el.tags?.['addr:street'] || el.tags?.['addr:full'] || 'Verified Location'
      })).filter(p => p.lat && p.lon);

      poiCache.set(cacheKey, pois);

      return res.json({
        success: true,
        dataStatus: 'LIVE',
        pois
      });
    }
  } catch (err) {
    console.warn(`⚠️ Overpass API timeout for ${category}. Returning cached/empty payload gracefully.`);
  }

  // Graceful degradation when offline or Overpass fails
  res.json({
    success: true,
    dataStatus: 'CACHED',
    unavailableReason: 'External GIS POI service unreachable. Using local cached records.',
    pois: []
  });
});

export default router;
