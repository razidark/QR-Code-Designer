/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

  // Lazy Initialization of Gemini Google GenAI SDK
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI | null {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
         return null;
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // AI-Assisted Brand Style Suggestion
  app.post("/api/ai-suggest", async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ error: "Missing brand description." });
      }

      const client = getAiClient();
      if (!client) {
        // High quality offline heuristic preset generator
        const desc = description.toLowerCase();
        let preset = {
          dotStyle: "rounded",
          eyeFrameStyle: "rounded",
          eyeBallStyle: "rounded",
          fgColor1: "#6366f1",
          fgColor2: "#a855f7",
          fgType: "linear",
          bgColor: "#0f172a",
          useTransparentBg: false,
          logoPreset: "globe",
          rationale: "Vibrant modern gradient theme curated by local design engine."
        };

        if (desc.includes("cyber") || desc.includes("tech") || desc.includes("neon")) {
          preset = {
            dotStyle: "diamond",
            eyeFrameStyle: "shield",
            eyeBallStyle: "diamond",
            fgColor1: "#00f0ff",
            fgColor2: "#ff007f",
            fgType: "linear",
            bgColor: "#0a0a14",
            useTransparentBg: false,
            logoPreset: "github",
            rationale: "High-contrast neon cyberpunk palette with geometric accents."
          };
        } else if (desc.includes("eco") || desc.includes("nature") || desc.includes("green")) {
          preset = {
            dotStyle: "fluid",
            eyeFrameStyle: "leaf",
            eyeBallStyle: "leaf",
            fgColor1: "#10b981",
            fgColor2: "#059669",
            fgType: "linear",
            bgColor: "#f0fdf4",
            useTransparentBg: false,
            logoPreset: "globe",
            rationale: "Clean organic botanical aesthetic with soft fluid markers."
          };
        } else if (desc.includes("dark") || desc.includes("luxury") || desc.includes("gold")) {
          preset = {
            dotStyle: "star",
            eyeFrameStyle: "circle",
            eyeBallStyle: "diamond",
            fgColor1: "#f59e0b",
            fgColor2: "#d97706",
            fgType: "linear",
            bgColor: "#18181b",
            useTransparentBg: false,
            logoPreset: "none",
            rationale: "Premium obsidian and amber gold finish for executive luxury."
          };
        }

        return res.json(preset);
      }

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are an expert branding designer. Analyze this brand concept, mood, or aesthetic description: "${description}". Let's create an customized artistic QR code suited for them. Output color coordinates & patterns. Let's make sure the contrast is always very high (for example, if background is dark, make sure fgColor is extremely bright, e.g., neon or neon-pastel. If background is light, make foreground dark). Return ONLY a JSON object that matches the requested schema.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dotStyle: {
                type: Type.STRING,
                description: "The style of QR modules. Must be one of: 'square', 'circle', 'rounded', 'fluid', 'diamond', 'star'"
              },
              eyeFrameStyle: {
                type: Type.STRING,
                description: "Corner frame. Must be: 'square', 'rounded', 'circle', 'shield', 'leaf'"
              },
              eyeBallStyle: {
                type: Type.STRING,
                description: "Inner corner dot. Must be: 'square', 'rounded', 'circle', 'diamond', 'leaf'"
              },
              fgColor1: {
                type: Type.STRING,
                description: "Primary brand gradient color (e.g., #FF2E93)"
              },
              fgColor2: {
                type: Type.STRING,
                description: "Secondary gradient color. For high contrast solids, set identical to fgColor1."
              },
              fgType: {
                type: Type.STRING,
                description: "Must be: 'solid' or 'linear'"
              },
              bgColor: {
                type: Type.STRING,
                description: "Clean matching background hex (e.g. #000000 or #ffffff)"
              },
              useTransparentBg: {
                type: Type.BOOLEAN,
                description: "True/false on transparent suitability."
              },
              logoPreset: {
                type: Type.STRING,
                description: "Brand logo alignment. Must be: 'globe', 'wifi', 'google', 'github', 'mail', 'instagram', 'phone', 'none'"
              },
              rationale: {
                type: Type.STRING,
                description: "A short, professional 1-sentence design rationale."
              }
            },
            required: [
              "dotStyle", "eyeFrameStyle", "eyeBallStyle", "fgColor1", "fgColor2", "fgType", "bgColor", "useTransparentBg", "logoPreset", "rationale"
            ]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      res.json(result);
    } catch (err: any) {
      console.error("Gemini Suggestion error:", err);
      res.status(500).json({ error: err.message || "Failed to parse style suggestions." });
    }
  });

  // Vite development integration or server static bundle serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = __dirname;
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server launched on http://127.0.0.1:${PORT}`);
  });
}

startServer();
