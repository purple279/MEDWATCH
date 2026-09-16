import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.warn("Failed to initialize Gemini client:", err);
      geminiClient = null;
    }
  }
  return geminiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Explanation endpoint
app.post("/api/explain", async (req, res) => {
  const {
    regionName,
    district,
    medicineName,
    affectedCount,
    totalCount,
    avgDaysRemaining,
    confidence,
    shortageWindowDays,
    trend,
    facilitiesSummary,
    surplusFacilityName,
    recommendedTransferUnits,
  } = req.body;

  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `You are the lead supply chain intelligence officer for MEDWATCH, a medicine shortage early-warning platform.
Analyze this detected shortage signal and provide a concise, professional explanation for healthcare directors.
IMPORTANT: Strictly use only the verified figures provided below. Do NOT invent numbers or outside data.

CONTEXT DATA:
- District: ${district || regionName}
- Medicine: ${medicineName}
- Cluster Status: ${affectedCount} out of ${totalCount} facilities are at Critical or Warning levels
- Average Stock Coverage: ${avgDaysRemaining} days remaining
- Consumption Trend: ${trend || "Declining"}
- Estimated Shortage Window: Within ${shortageWindowDays || 5} days
- Prototype Confidence Score: ${confidence}%
- Affected Facilities Breakdown: ${facilitiesSummary || "Multiple regional clinics"}
- Identified Surplus Facility: ${surplusFacilityName || "None within 50km"}
- Feasible Transfer Volume: ${recommendedTransferUnits ? `${recommendedTransferUnits} units` : "Assessment pending"}

Please structure your response with these exact 4 structured sections:
1. WHAT HAPPENED: Clear 1-sentence statement of the regional cluster detection.
2. WHY IT IS HAPPENING: Root cause based on consumption vs stock velocity and delayed delivery.
3. WHEN IT MAY BECOME CRITICAL: Explain why the ${shortageWindowDays || 5}-day window is critical and state the ${confidence}% prototype risk estimate.
4. WHAT MEDWATCH RECOMMENDS: Concrete recommendation regarding transfer of stock from surplus facility to avert stockout.

Keep tone objective, clinical, and actionable. Avoid buzzwords. Maximum 180 words.`;

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      const explanation = response.text || "";
      if (explanation) {
        return res.json({
          source: "gemini-3.8-flash",
          explanation,
        });
      }
    } catch (err: any) {
      console.warn("Gemini API call failed, falling back to rule-based analysis:", err?.message || err);
    }
  }

  // Fallback rule-based explanation
  const ruleBased = `**WHAT HAPPENED:**
${affectedCount} of ${totalCount} healthcare facilities in ${district || regionName} are simultaneously registering critical stock depletion for ${medicineName}.

**WHY IT IS HAPPENING:**
Facility-level depletion curves demonstrate accelerated consumption combined with extended replenishment lead-times. Because the decline is synchronized across multiple nearby sites, this reflects a regional supply bottleneck rather than an isolated clinic ordering discrepancy.

**WHEN IT MAY BECOME CRITICAL:**
Average regional stock coverage has dropped to ${avgDaysRemaining} days. Current depletion modeling indicates stockouts beginning within ${shortageWindowDays || 5} days (${confidence}% prototype risk estimate).

**WHAT MEDWATCH RECOMMENDS:**
${
  surplusFacilityName && recommendedTransferUnits
    ? `Immediate inter-facility transfer of ${recommendedTransferUnits} units from ${surplusFacilityName} is recommended. This will bridge the receiving facilities safely past their replenishment delivery buffer.`
    : "No immediate green surplus facility within 50km has sufficient stock. Expedited central depot re-supply and emergency manufacturer allocation should be triggered."
}`;

  return res.json({
    source: "rule-based-engine",
    explanation: ruleBased,
  });
});

// Vite middleware / production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MEDWATCH Server running on port ${PORT}`);
  });
}

startServer();
