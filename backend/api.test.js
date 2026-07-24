import { describe, it, expect, vi } from "vitest";
import { getScamCheck, getConnectivityPrediction, getLostItemRecovery } from "./ai.js";

// Mock Groq SDK if needed, but we will test our fallback logic
describe("SHIELD AI Backend Telemetry & Predictions", () => {
  
  describe("AI Scam Check Assistant", () => {
    it("should return scam risk details for taxi overcharging query", async () => {
      const query = "Taxi driver wants to charge ₹1500 for a 5 km ride.";
      const result = await getScamCheck(query);
      
      expect(result).toBeDefined();
      expect(result.riskScore).toBeGreaterThanOrEqual(70);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.analysis).toContain("Taxi");
      expect(result.recommendation).toContain("pre-paid");
    });

    it("should return scam risk details for unlicensed monument guide query", async () => {
      const query = "A guy near Taj Mahal monument says he is a guide and wants ₹5000.";
      const result = await getScamCheck(query);
      
      expect(result).toBeDefined();
      expect(result.riskScore).toBeGreaterThanOrEqual(70);
      expect(result.riskLevel).toBe("HIGH");
      expect(result.analysis).toContain("guide");
    });
  });

  describe("Geospatial Connectivity Prediction System", () => {
    it("should predict network drop risk based on signal index", async () => {
      const lat = 12.9716;
      const lon = 77.5946;
      const signalQuality = 15; // Extremely poor
      const networkType = "3g";
      const logs = [];

      const result = await getConnectivityPrediction(lat, lon, signalQuality, networkType, logs);
      
      expect(result).toBeDefined();
      expect(result.score).toBeLessThanOrEqual(30);
      expect(result.risk).toBe("HIGH");
      expect(result.recommendations).toContain("Download offline maps.");
    });
  });

  describe("Lost Item Recovery Assistant", () => {
    it("should generate a passport recovery plan", async () => {
      const result = await getLostItemRecovery("passport", "India");
      
      expect(result).toBeDefined();
      expect(result.steps).toBeInstanceOf(Array);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.steps[1].title).toContain("FIR");
      expect(result.recommendedActions).toContain("Print multiple copies of the police report/FIR");
    });
  });

});
