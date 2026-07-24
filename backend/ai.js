import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

export async function getTripPlan(destination, days, budget, language = "en") {
  try {
    if (groq) {
      const prompt = `Act as a professional travel architect. Generate a highly detailed and REALISTIC ${days}-day safety-first trip plan for ${destination} with a ${budget} budget.
      
      CRITICAL INSTRUCTIONS:
      1. You MUST generate exactly ${days} days in the "itinerary" array.
      2. For each day, include 3-4 activities with REAL names and precise GPS coordinates.
      3. Language: ${language === "hi" ? "Hindi" : "English"}.
      4. Return ONLY valid JSON matching this schema:
      {
        "destination": "${destination}",
        "summary": "A brief safety-aware overview of the trip",
        "itinerary": [
          {
            "day": 1,
            "theme": "Exploration",
            "activities": [
              { "name": "Place Name", "lat": 12.34, "lon": 56.78, "description": "Detailed info", "time": "09:00 AM" }
            ]
          }
        ]
      }`;

      const res = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return JSON.parse(res.choices[0].message.content);
    }
    return null; // Let the server handle fallback
  } catch (err) {
    console.log("AI error:", err);
    return null;
  }
}

/**
 * FEATURE 1: AI Scam Check
 */
export async function getScamCheck(query) {
  try {
    if (groq) {
      const prompt = `Act as an expert tourist safety officer and scam investigator. Analyze the following traveler query/situation for potential tourist scams, overcharging, fraud, or traps:
      
      Traveler Query: "${query}"
      
      CRITICAL INSTRUCTIONS:
      1. Return ONLY valid JSON matching this schema:
      {
        "riskScore": 85,
        "riskLevel": "HIGH",
        "analysis": "A detailed explanation of why this is a scam risk, local typical rates if relevant, and the mechanics of the scam.",
        "recommendation": "Practical action items for the tourist to stay safe, avoid overpaying, or exit the situation."
      }
      2. Keep it practical, safety-focused, tourism-oriented, and explainable. Never give legal advice. Ensure no hallucinated facts. Do not write markdown blocks or text around the JSON.`;

      const res = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return JSON.parse(res.choices[0].message.content);
    }
    return getScamFallback(query);
  } catch (err) {
    console.log("Scam AI error:", err);
    return getScamFallback(query);
  }
}

function getScamFallback(query) {
  const lowercaseQuery = query.toLowerCase();
  if (lowercaseQuery.includes("taxi") || lowercaseQuery.includes("ride") || lowercaseQuery.includes("driver") || lowercaseQuery.includes("cab") || lowercaseQuery.includes("km")) {
    return {
      riskScore: 85,
      riskLevel: "HIGH",
      analysis: "Taxi driver fares that deviate from local pre-paid structures are a major scam risk. ₹1500 for a short distance (e.g., 5 km) is extremely high.",
      recommendation: "Refuse the ride. Use official pre-paid counters, registered taxi services, or ridesharing apps like Ola, Uber, or Rapido."
    };
  }
  if (lowercaseQuery.includes("guide") || lowercaseQuery.includes("monument") || lowercaseQuery.includes("charge")) {
    return {
      riskScore: 75,
      riskLevel: "HIGH",
      analysis: "Unlicensed tourist guides operating near popular monuments often charge exorbitant prices (e.g., ₹5000) and redirect tourists to expensive commission-based shops.",
      recommendation: "Only hire guides verified by the Ministry of Tourism, displaying an official badge, or book guides from official ticketing counters."
    };
  }
  if (lowercaseQuery.includes("hotel") || lowercaseQuery.includes("offer") || lowercaseQuery.includes("deal") || lowercaseQuery.includes("room")) {
    return {
      riskScore: 60,
      riskLevel: "MEDIUM",
      analysis: "Unbelievable hotel offers or last-minute redirects are common tactics. Fraudsters advertise properties that do not exist or demand booking fees in advance.",
      recommendation: "Always book through certified platforms. Verify the hotel address on maps and check independent reviews. Do not pay outside the platform."
    };
  }
  return {
    riskScore: 40,
    riskLevel: "MEDIUM",
    analysis: "This situation requires caution. Verify details independently as tourist prices are often inflated compared to local rates.",
    recommendation: "Politely decline, ask for a printed bill, consult tourist information, or ask a local helper for verified prices."
  };
}

/**
 * FEATURE 2: Connectivity Prediction
 */
export async function getConnectivityPrediction(lat, lon, signalQuality, networkType, logs = []) {
  try {
    if (groq) {
      const logSummary = logs.map(l => `Lat:${l.latitude}, Lon:${l.longitude}, Type:${l.network_type}, Quality:${l.signal_quality}%`).join("\n");
      const prompt = `Act as a geospatial connectivity analyst. Predict the likelihood of entering a network dead-zone or experiencing signal drop-off within 1.5 km based on the following current state and history:
      Current Coordinates: Lat:${lat}, Lon:${lon}
      Current Signal Quality: ${signalQuality}%
      Current Network Type: ${networkType}
      Historical nearby logs:
      ${logSummary || "No nearby logs available."}
      
      CRITICAL INSTRUCTIONS:
      1. Return ONLY valid JSON matching this schema:
      {
        "score": 25,
        "risk": "HIGH",
        "distance": "1.2 km",
        "recommendations": [
          "Download offline maps",
          "Enable Offline Emergency Kit",
          "Inform emergency contacts"
        ]
      }
      2. Base it on remote terrain rules, distance to empty signals, and signal quality trends. Do not include markdown blocks or text around the JSON.`;

      const res = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return JSON.parse(res.choices[0].message.content);
    }
    return getConnectivityFallback(lat, lon, signalQuality, networkType, logs);
  } catch (err) {
    console.log("Connectivity AI error:", err);
    return getConnectivityFallback(lat, lon, signalQuality, networkType, logs);
  }
}

function getConnectivityFallback(lat, lon, signalQuality, networkType, logs) {
  // Check proximity to known remote areas (from server.js: Restricted Forest Zone near 18.5204, 73.8567)
  const forestLat = 18.5204;
  const forestLon = 73.8567;
  const rad = 6371e3; // Earth radius in meters
  const dLat = (forestLat - lat) * Math.PI / 180;
  const dLon = (forestLon - lon) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat * Math.PI / 180) * Math.cos(forestLat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distToForest = rad * c;

  if (distToForest < 5000) {
    return {
      score: 18,
      risk: "HIGH",
      distance: `${(distToForest / 1000).toFixed(1)} km`,
      recommendations: [
        "Entering Restricted Forest/Wilderness Area.",
        "Download offline maps now.",
        "Synchronize emergency offline contact details.",
        "Keep battery saver mode active."
      ]
    };
  }

  if (signalQuality < 30) {
    return {
      score: 25,
      risk: "HIGH",
      distance: "0.8 km",
      recommendations: [
        "Signal quality is degrading rapidly.",
        "Download offline maps.",
        "Keep emergency contact list active.",
        "Move towards elevated points."
      ]
    };
  }

  if (signalQuality < 60) {
    return {
      score: 55,
      risk: "MEDIUM",
      distance: "2.5 km",
      recommendations: [
        "Moderate connectivity expected ahead.",
        "Pre-load maps for destination.",
        "Notify family of travel status."
      ]
    };
  }

  return {
    score: 90,
    risk: "LOW",
    distance: "N/A",
    recommendations: [
      "Stable network coverage expected.",
      "Safe to proceed."
    ]
  };
}

/**
 * FEATURE 3: Lost Item Recovery Guide
 */
export async function getLostItemRecovery(itemType, country) {
  try {
    if (groq) {
      const prompt = `Act as an international tourist emergency assistance coordinator. Provide a structured, step-by-step, item-specific recovery guide for a tourist who lost their ${itemType} in ${country}.
      
      CRITICAL INSTRUCTIONS:
      1. Return ONLY valid JSON matching this schema:
      {
        "steps": [
          { "stepNumber": 1, "title": "Step title", "description": "Specific action to take right now" }
        ],
        "nearestPoliceStation": "Search/Contact local tourist police helpline.",
        "recommendedActions": [
          "Register a complaint immediately",
          "Inform your embassy"
        ]
      }
      2. Ensure steps are specific to the item type (${itemType}) and the country (${country}). Do not write markdown blocks or text around the JSON.`;

      const res = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return JSON.parse(res.choices[0].message.content);
    }
    return getLostItemFallback(itemType, country);
  } catch (err) {
    console.log("Lost Item AI error:", err);
    return getLostItemFallback(itemType, country);
  }
}

function getLostItemFallback(itemType, country) {
  const steps = [];
  const recommendedActions = [];
  
  if (itemType.toLowerCase() === "passport") {
    steps.push(
      { stepNumber: 1, title: "Stay Calm & Verify", description: "Search your room, travel bags, hotel lobby, and vehicles thoroughly. Make sure it is truly lost." },
      { stepNumber: 2, title: "File an E-FIR or Local Police Report", description: "Report the loss immediately. Visit the nearest local police station or use our E-FIR module. Get a copy of the official report." },
      { stepNumber: 3, title: "Contact Your Embassy / Consulate", description: `Locate the embassy of your home country in ${country}. Book an emergency appointment for an Emergency Certificate (EC) or replacement passport.` },
      { stepNumber: 4, title: "Upload Supporting Documents", description: "Securely upload digital copies of your visa, old passport pages, and hotel details to the SHIELD Vault." },
      { stepNumber: 5, title: "Report to Immigration Bureau", description: "For exit clearance, report the passport loss to the local registration office (FRRO in India) to get an exit visa." }
    );
    recommendedActions.push(
      "Block your credit cards if lost with passport",
      "Print multiple copies of the police report/FIR",
      "Do not travel between cities until you have exit clearance documents"
    );
  } else if (itemType.toLowerCase() === "wallet" || itemType.toLowerCase() === "phone") {
    steps.push(
      { stepNumber: 1, title: "Freeze All Financial Cards", description: "Immediately block your debit and credit cards using your banking apps or phone customer care." },
      { stepNumber: 2, title: "Track Device (For Phones)", description: "Use Google 'Find My Device' or Apple 'Find My' to lock, track, or wipe your phone if active online." },
      { stepNumber: 3, title: "Block SIM Card", description: "Contact your network operator to block your SIM card to prevent unauthorized calls or verification OTP hacks." },
      { stepNumber: 4, title: "Report Loss & Create E-FIR", description: "Register an E-FIR with IMEI number (for phones) or listing contents (for wallets) using the SHIELD app." }
    );
    recommendedActions.push(
      "Change passwords for email, banking, and social accounts immediately",
      "Contact emergency contact to inform them you might be unreachable by phone"
    );
  } else {
    steps.push(
      { stepNumber: 1, title: "Double Check Last Known Location", description: "Return to the place you last saw the item, check transit hubs, baggage claims, or taxis." },
      { stepNumber: 2, title: "Register Lost Property Report", description: "Submit details to airline desk, railway master, or transit managers. File a report using the SHIELD E-FIR module." },
      { stepNumber: 3, title: "Upload Purchase Proof / Identifiers", description: "Upload serial numbers, receipts, or photos of the lost item to assist local recovery squads." }
    );
    recommendedActions.push(
      "Inquire at local Lost and Found counters",
      "Inform tourist help desks or local guards"
    );
  }

  return {
    steps,
    nearestPoliceStation: `Contact local Tourist Police desk or visit nearest city police headquarters.`,
    recommendedActions
  };
}

/**
 * FEATURE 4: AI Scam Analytics
 */
export async function getScamAnalyticsPrompt(scamLogs) {
  try {
    if (groq) {
      const prompt = `Act as a global tourism safety analyst. Analyze the following aggregated scam logs to identify trends and high-risk categories:
      ${JSON.stringify(scamLogs)}
      
      CRITICAL INSTRUCTIONS:
      Return ONLY valid JSON matching this schema:
      {
        "topScamTypes": [{ "type": "string", "frequency": 10, "trend": "UP" }],
        "highRiskAreas": ["Area 1", "Area 2"],
        "summary": "Brief 2 sentence analytical summary of the risk landscape."
      }
      Do not include markdown blocks or text around the JSON.`;

      const res = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return JSON.parse(res.choices[0].message.content);
    }
    return getScamAnalyticsFallback(scamLogs);
  } catch (err) {
    return getScamAnalyticsFallback(scamLogs);
  }
}

function getScamAnalyticsFallback(scamLogs) {
  return {
    topScamTypes: [
      { type: "Overcharging Taxi", frequency: scamLogs.length > 0 ? 15 : 0, trend: "UP" },
      { type: "Fake Guides", frequency: 8, trend: "STABLE" }
    ],
    highRiskAreas: ["City Center", "Main Station"],
    summary: "Consistent reports of transport overcharging. Tourists should use pre-paid apps."
  };
}

/**
 * FEATURE 5: Guardian Recommendation
 */
export async function getGuardianRecommendationPrompt(safetyEvents) {
  try {
    if (groq) {
      const prompt = `Act as an emergency intelligence system. A tourist has generated the following recent safety events:
      ${JSON.stringify(safetyEvents)}
      
      CRITICAL INSTRUCTIONS:
      Determine if their emergency guardians should be notified proactively.
      Return ONLY valid JSON matching this schema:
      {
        "shouldNotify": true/false,
        "urgency": "HIGH/MEDIUM/LOW",
        "recommendedMessage": "Text message to send to the guardian",
        "reasoning": "Why this notification is recommended"
      }
      Do not include markdown blocks or text around the JSON.`;

      const res = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return JSON.parse(res.choices[0].message.content);
    }
    return getGuardianRecommendationFallback(safetyEvents);
  } catch (err) {
    return getGuardianRecommendationFallback(safetyEvents);
  }
}

function getGuardianRecommendationFallback(safetyEvents) {
  const hasCritical = safetyEvents.some(e => e.risk_score >= 80 || e.event_type === "SOS");
  if (hasCritical) {
    return {
      shouldNotify: true,
      urgency: "HIGH",
      recommendedMessage: "URGENT: Tourist has encountered a high-risk safety event (SOS or Geofence Breach). Please check their location immediately.",
      reasoning: "Critical risk score or SOS trigger detected."
    };
  }
  return {
    shouldNotify: false,
    urgency: "LOW",
    recommendedMessage: "",
    reasoning: "No critical events detected recently."
  };
}
