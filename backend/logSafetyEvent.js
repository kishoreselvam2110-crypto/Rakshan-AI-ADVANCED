import pool from './db/db.js';
import { supabase } from './supabase.js';

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
  // 1. Log to Supabase if available
  if (supabase) {
    try {
      const { error } = await supabase.from("safety_events").insert([
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
      if (error) {
        console.error("Supabase safety event logging error:", error.message);
      }
    } catch (e) {
      console.error("Error logging safety event to Supabase:", e.message);
    }
  }

  // 2. Log to MySQL as fallback or secondary store
  try {
    const query = `
      INSERT INTO safety_events (user_id, event_type, event_source, risk_score, latitude, longitude, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(query, [
      userId || "Anonymous",
      eventType,
      eventSource,
      riskScore,
      latitude || null,
      longitude || null,
      JSON.stringify(metadata)
    ]);
  } catch (e) {
    // MySQL logging failed (could be offline or table doesn't exist)
    console.warn("⚠️ MySQL safety event logging skipped:", e.message);
  }
}
