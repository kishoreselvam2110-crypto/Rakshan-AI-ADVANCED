// Standalone Offline / Client-side Fallback Generator for Rakshan AI Frontend

export function generateFallbackItinerary(destination, days = 3, budget = "Medium") {
  const destName = destination ? destination.trim() : "Destination";
  const numDays = parseInt(days, 10) || 3;

  // Base coordinates mapping for common cities or fallback
  const cityCoords = {
    kolkata: { lat: 22.5726, lon: 88.3639 },
    delhi: { lat: 28.6139, lon: 77.2090 },
    mumbai: { lat: 19.0760, lon: 72.8777 },
    chennai: { lat: 13.0827, lon: 80.2707 },
    bengaluru: { lat: 12.9716, lon: 77.5946 },
    goa: { lat: 15.2993, lon: 74.1240 },
    jaipur: { lat: 26.9124, lon: 75.7873 },
    hyderabad: { lat: 17.3850, lon: 78.4867 }
  };

  const key = destName.toLowerCase().split(",")[0].trim();
  const baseCoords = cityCoords[key] || { lat: 22.5726, lon: 88.3639 };

  const itinerary = [];

  for (let i = 1; i <= Math.min(numDays, 7); i++) {
    const lat1 = baseCoords.lat + (i * 0.01);
    const lon1 = baseCoords.lon + (i * 0.01);
    const lat2 = baseCoords.lat + (i * 0.015);
    const lon2 = baseCoords.lon + (i * 0.015);

    itinerary.push({
      day: i,
      title: `Day ${i}: Exploring Key Safe Locations in ${destName}`,
      activities: [
        {
          name: `${destName} Heritage Landmark & Cultural Hub`,
          time: "09:00 AM - 01:00 PM",
          safetyScore: 94,
          crowdDensity: "Moderate",
          lat: lat1,
          lon: lon1,
          notes: "Monitored tourist zone with police patrol and verified safe entry."
        },
        {
          name: `Central ${destName} Promenade & Local Market`,
          time: "03:00 PM - 07:00 PM",
          safetyScore: 88,
          crowdDensity: "High",
          lat: lat2,
          lon: lon2,
          notes: "High footfall commercial sector. Exercise standard wallet security."
        }
      ]
    });
  }

  return {
    destination: destName,
    overallSafetyScore: 92,
    threatLevel: "LOW",
    emergencyContacts: [
      { name: "Police Patrol Helpline", phone: "112" },
      { name: "Tourist Safety Line", phone: "1363" },
      { name: "Medical Emergency", phone: "102" }
    ],
    itinerary
  };
}

export function generateFallbackScamCheck(query) {
  const text = (query || "").toLowerCase();
  let riskScore = 45;
  let riskLevel = "MEDIUM";
  let analysis = "The reported scenario contains pricing elements that require verification against official tariff boards.";
  let recommendation = "Always demand official metered rates or pre-paid counters before agreeing to service.";

  if (text.includes("taxi") || text.includes("cab") || text.includes("ride") || text.includes("auto") || text.includes("1500")) {
    riskScore = 88;
    riskLevel = "HIGH";
    analysis = "Significantly inflated transport fare detected! Standard local fares for 5 km range between ₹100 - ₹300.";
    recommendation = "Reject unmetered offers. Use pre-paid taxi booths or ride-hailing apps like Uber/Ola.";
  } else if (text.includes("guide") || text.includes("unlicensed") || text.includes("5000")) {
    riskScore = 92;
    riskLevel = "HIGH";
    analysis = "Unauthorized monument guide solicitation detected. Official government guides display certified ID badges.";
    recommendation = "Do not engage. Hire official Ministry of Tourism certified guides at monument entrance booths.";
  }

  return {
    success: true,
    query,
    riskScore,
    riskLevel,
    analysis,
    recommendation
  };
}

export function generateFallbackConnectivity(lat, lon) {
  return {
    success: true,
    score: 85,
    risk: "LOW",
    distance: "1.2 km to nearest cell tower",
    recommendations: [
      "Signal coverage is strong. 4G/5G data services active.",
      "Pre-download offline map vectors if planning to travel into forested outskirt areas."
    ]
  };
}

export function generateFallbackLostItem(itemType) {
  return {
    success: true,
    reportId: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
    steps: [
      "File an immediate missing report with local precinct / transit authority.",
      "Notify national tourist helpline (1363) and register emergency reference ID.",
      "Lock associated accounts, SIM cards, or credit lines via bank customer care.",
      "Upload digital back-up credentials to Rakshan Vault for quick verification."
    ],
    nearestPoliceStation: {
      name: "Central District Police Precinct",
      address: "Main Government Corridor",
      phone: "+91 112"
    },
    recommendedActions: [
      "Contact Embassy / Consulate for emergency travel document issuance if passport is lost.",
      "Keep digital copy of Rakshan Decentralized ID accessible offline."
    ]
  };
}
