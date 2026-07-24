
import { logSafetyEvent } from "./logSafetyEvent.js";

/**
 * Compute the overall safety score for a user.
 * Uses weighting defined in the spec.
 */
export async function computeSafetyScore(userId) {
  // Default weights (must match spec)
  const weights = {
    connectivity: 0.3,
    activeRisks: 0.25,
    geofence: 0.15,
    scam: 0.1,
    sos: 0.1,
    lostItem: 0.05,
    offlineKit: 0.05
  };

  // Retrieve latest relevant data
  const { data: connectivityData, error: connErr } = await supabase
    .from("connectivity_logs")
    .select("signal_quality")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();

  const { data: events, error: evErr } = await supabase
    .from("safety_events")
    .select("event_type, event_source, risk_score")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  // Compute individual components
  const connectivityScore = connErr || !connectivityData ? 60 : connectivityData.signal_quality; // fallback medium

  // Count event types
  const counts = {
    activeRisks: 0,
    geofence: 0,
    scam: 0,
    sos: 0,
    lostItem: 0,
    offlineKit: 0
  };
  let riskSum = 0;
  if (!evErr && events) {
    for (const e of events) {
      riskSum += e.risk_score || 0;
      switch (e.event_type) {
        case "Geofence Breach":
          counts.geofence++;
          break;
        case "Scam Alert":
          counts.scam++;
          break;
        case "SOS":
          counts.sos++;
          break;
        case "Lost Item Report":
          counts.lostItem++;
          break;
        case "Offline Kit Activation":
          counts.offlineKit++;
          break;
        default:
          counts.activeRisks++;
      }
    }
  }

  // Normalise counts to a 0‑100 scale (simple linear; more sophisticated could be used)
  const maxCount = 10; // arbitrary cap for scaling
  const norm = (c) => Math.min((c / maxCount) * 100, 100);

  const componentScores = {
    connectivity: connectivityScore,
    activeRisks: norm(counts.activeRisks),
    geofence: norm(counts.geofence),
    scam: norm(counts.scam),
    sos: norm(counts.sos),
    lostItem: norm(counts.lostItem),
    offlineKit: norm(counts.offlineKit)
  };

  // Weighted aggregate (lower is better safety risk, so we invert where needed)
  const weightedSum =
    weights.connectivity * componentScores.connectivity +
    weights.activeRisks * (100 - componentScores.activeRisks) + // fewer risks = higher safety
    weights.geofence * (100 - componentScores.geofence) +
    weights.scam * (100 - componentScores.scam) +
    weights.sos * (100 - componentScores.sos) +
    weights.lostItem * (100 - componentScores.lostItem) +
    weights.offlineKit * (100 - componentScores.offlineKit);

  const finalScore = Math.round(weightedSum);
  const riskLevel = finalScore <= 30 ? "HIGH" : finalScore <= 60 ? "MEDIUM" : "LOW";

  // Persist the snapshot
  await supabase.from("safety_score_history").insert([
    {
      user_id: userId,
      score: finalScore,
      risk_level: riskLevel
    }
  ]);

  // Log a safety event for the computed score
  await logSafetyEvent({
    userId,
    eventType: "Safety Score Computed",
    eventSource: "Safety Engine",
    riskScore: finalScore
  });

  return { score: finalScore, riskLevel, componentScores };
}
