// New MySQL way
import pool from './db/db.js'; // Adjust the path to your db.js file

await pool.query('INSERT INTO safety_events (event) VALUES (?)', [event]);

/**
 * Log a safety‑related event.
 * @param {{userId?:string, eventType:string, eventSource:string, riskScore?:number, latitude?:number, longitude?:number, metadata?:object}} params
 */
export async function logSafetyEvent({
  userId,
  eventType,
  eventSource,
  riskScore = 0,
  latitude,
  longitude,
  metadata = {}
}) {
  if (!supabase) return;
  try {
    await supabase.from("safety_events").insert([
      {
        user_id: userId || "Anonymous",
        event_type: eventType,
        event_source: eventSource,
        risk_score: riskScore,
        latitude,
        longitude,
        metadata
      }
    ]);
  } catch (e) {
    console.error("Error logging safety event:", e.message);
  }
}
