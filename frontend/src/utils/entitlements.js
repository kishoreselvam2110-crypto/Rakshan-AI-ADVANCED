// Entitlement engine for Rakshan AI
// Tiers: FREE (default), PRO, ENTERPRISE

export const TIERS = {
  FREE: 'FREE',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE'
};

const FEATURE_ENTITLEMENTS = {
  OFFLINE_DIGITAL_ID: [TIERS.FREE, TIERS.PRO, TIERS.ENTERPRISE],
  RPPG_VITALS_BASIC: [TIERS.FREE, TIERS.PRO, TIERS.ENTERPRISE],
  DEADZONE_MAPS_BASIC: [TIERS.FREE, TIERS.PRO, TIERS.ENTERPRISE],
  PANIC_DURESS_SIGNATURE: [TIERS.FREE, TIERS.PRO, TIERS.ENTERPRISE],
  ON_DEVICE_VOICE_FALLBACK: [TIERS.FREE, TIERS.PRO, TIERS.ENTERPRISE],
  
  // Pro Tier Features
  FULL_AI_VOICE_ASSISTANT: [TIERS.PRO, TIERS.ENTERPRISE],
  RPPG_VITALS_ADVANCED: [TIERS.PRO, TIERS.ENTERPRISE],
  ANOMALY_DETECTION: [TIERS.PRO, TIERS.ENTERPRISE],
  SCAM_RISK_ADVISOR: [TIERS.PRO, TIERS.ENTERPRISE],
  EXTENDED_MAP_CACHING: [TIERS.PRO, TIERS.ENTERPRISE],
  MESH_RELAY_NETWORK: [TIERS.PRO, TIERS.ENTERPRISE],

  // Enterprise Tier Features
  ADMIN_CONTROL_ROOM: [TIERS.ENTERPRISE],
  ORG_WIDE_TELEMETRY: [TIERS.ENTERPRISE],
  ENTERPRISE_API_ACCESS: [TIERS.ENTERPRISE]
};

export const getStoredTier = () => {
  try {
    return localStorage.getItem('rakshan_user_tier') || TIERS.FREE;
  } catch (e) {
    return TIERS.FREE;
  }
};

export const setStoredTier = (tier) => {
  if (Object.values(TIERS).includes(tier)) {
    localStorage.setItem('rakshan_user_tier', tier);
    window.dispatchEvent(new CustomEvent('rakshan_tier_changed', { detail: tier }));
    return true;
  }
  return false;
};

export const hasEntitlement = (featureKey, userTier = getStoredTier()) => {
  const allowedTiers = FEATURE_ENTITLEMENTS[featureKey];
  if (!allowedTiers) return false;
  return allowedTiers.includes(userTier);
};
