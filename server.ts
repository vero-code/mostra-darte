import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize GoogleGenAI client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({ status: "ok", aiConfigured: hasKey });
});

// Chat Endpoint
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { messages, currentArtwork, userCoordQuery } = req.body;

    const artworkContext = currentArtwork
      ? `CURRENTLY EXHIBITED MASTERPIECE:
Title: "${currentArtwork.title}" (${currentArtwork.year}) by ${currentArtwork.artist}
Period: ${currentArtwork.period}, Medium: ${currentArtwork.medium}
Museum: ${currentArtwork.location}
Curator Overview: ${currentArtwork.curatorOverview}
Known Master Focal Points for this painting:
${(currentArtwork.focalPoints || [])
  .map(
    (fp: { name: string; x: number; y: number; zoom: number; curatorInsight: string }) =>
      `- ${fp.name}: coordinates {x: ${fp.x}, y: ${fp.y}, zoom: ${fp.zoom}}. Insight: "${fp.curatorInsight}"`
  )
  .join("\n")}`
      : "No specific artwork context provided.";

    const systemInstruction = `You are the esteemed Head Curator and Virtual Docent at "Mostra d'Arte", an immersive digital art gallery. Your goal is to guide visitors through masterpieces of art history, making the experience deeply engaging, educational, and intellectually captivating.
### Persona & Style:
1. Tone: Eloquent, aristocratic, passionate, and welcoming. You speak with the authority and poetic flair of a world-class museum director (Louvre, Uffizi, MoMA).
2. Art Historical Depth: Provide vivid commentary on brushstrokes, compositional tension, chiaroscuro, symbolism, historical context, and the emotional aura of the painting.
3. Engaging Phrases to use naturally:
   - "Allow me to direct your gaze to..."
   - "Notice the miraculous subtlety with which the artist..."
   - "Observe how the light dances across..."
   - "Here lies one of the most intriguing mysteries of the Renaissance..."
4. Format:
   - Keep responses concise yet rich (2–3 short, beautifully written paragraphs).
   - Use subtle Markdown formatting (**bold** for key concepts or names, *italics* for visual nuances).
   - Conclude each response with an intriguing thought or a question that invites the visitor to explore another angle or detail.
${artworkContext}
${userCoordQuery ? `Note: The visitor has tapped/focused on canvas coordinate {x: ${userCoordQuery.x}%, y: ${userCoordQuery.y}%} and is asking about that specific visual area.` : ""}`;

    const ai = getGeminiClient();

    if (!ai) {
      // Intelligent fallback docent response if API key is not configured
      const fallback = generateCuratedDocentResponse(messages, currentArtwork, userCoordQuery);
      return res.json(fallback);
    }

    // Convert messages to Gemini format
    const contents = (messages || []).map((msg: { role: string; content: string }) => {
      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "";

    return res.json({
      content: text,
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({
      error: "The docent was temporarily indisposed.",
      content: "Forgive me, dear visitor. The gallery acoustics seem momentarily disturbed. Allow me to redirect your attention to the canvas.",
    });
  }
});

// Fallback response engine for curated masterpieces
function generateCuratedDocentResponse(
  messages: Array<{ role: string; content: string }>,
  currentArtwork: { id: string; title: string; artist: string; focalPoints?: Array<{ id: string; name: string; x: number; y: number; zoom: number; curatorInsight: string }> },
  userCoordQuery?: { x: number; y: number }
) {
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
  const fps = currentArtwork?.focalPoints || [];

  // Match closest focal point if user clicked
  if (userCoordQuery) {
    let closestFp = fps[0];
    let minDist = 999999;
    fps.forEach((fp) => {
      const dist = Math.hypot(fp.x - userCoordQuery.x, fp.y - userCoordQuery.y);
      if (dist < minDist) {
        minDist = dist;
        closestFp = fp;
      }
    });

    if (closestFp) {
      return {
        content: `Ah, an exquisite detail to question! Let me direct your attention to precisely this point ({x: ${userCoordQuery.x}%, y: ${userCoordQuery.y}%})—what we curators revere as **${closestFp.name}**.\n\n${closestFp.curatorInsight}\n\nNotice how the artist creates depth and psychological resonance right at this focal intersection.`,
      };
    }
  }

  // Keyword match to focal points
  for (const fp of fps) {
    const keywords = fp.name.toLowerCase().split(" ").concat(fp.id.split("-"));
    if (keywords.some((kw) => kw.length > 3 && lastUserMsg.includes(kw))) {
      return {
        content: `Let me direct your attention immediately to **${fp.name}**!\n\n${fp.curatorInsight}\n\nObserve how the harmony of tone and deliberate placement draws our human gaze irresistibly inward.`,
      };
    }
  }

  // General questions or greetings
  if (lastUserMsg.includes("moon") || lastUserMsg.includes("sun")) {
    return {
      content: `Let me direct your attention to the blazing celestial orb in the upper right quadrant!\n\nVan Gogh fuses the waxing crescent moon and radiant solar corona into a single vortex of pulsating light. Notice how the rhythmic impasto strokes of chrome yellow and zinc white radiate outwards, dissolving the boundary between day and night.`,
    };
  }

  if (lastUserMsg.includes("cypress") || lastUserMsg.includes("tree")) {
    return {
      content: `Let me direct your attention to the soaring, flame-like cypress on the left foreground.\n\nNotice how its dark vertical mass acts as an emotional obelisk, connecting the earthly cemetery below to the boundless starry vortex above. Van Gogh saw the cypress as a symbol of eternity and spiritual transcendence.`,
    };
  }

  if (lastUserMsg.includes("church") || lastUserMsg.includes("steeple") || lastUserMsg.includes("village")) {
    return {
      content: `If we look closely here at the center of the sleeping village, notice the church steeple piercing the horizon.\n\nThis spire did not actually exist in the French town of Saint-Rémy; Van Gogh drew it from his nostalgic memories of his homeland in the Netherlands.`,
    };
  }

  if (lastUserMsg.includes("pearl") || lastUserMsg.includes("earring")) {
    return {
      content: `Let me direct your attention to the miraculous pearl earring.\n\nObserve closely: Vermeer never drew an outline, nor did he paint a metal hook! The entire jewel is an optical miracle composed of just two swift strokes of lead-white—a bright top highlight catching direct studio light, and a soft bottom curve catching reflection from the collar.`,
    };
  }

  if (lastUserMsg.includes("smile") || lastUserMsg.includes("mouth") || lastUserMsg.includes("mona")) {
    return {
      content: `Let me direct your attention to the legendary, elusive smile of Lisa Gherardini.\n\nNotice how Leonardo applied over thirty microscopic glazes of smoky umber (sfumato). Because he softened the corners of the mouth and eyes, her expression changes dynamically depending on whether you look directly at her lips or into her eyes!`,
    };
  }

  if (lastUserMsg.includes("finger") || lastUserMsg.includes("spark") || lastUserMsg.includes("adam") || lastUserMsg.includes("god")) {
    return {
      content: `Let me direct your attention to the greatest millimeter in the history of art—the infinitesimal gap between the fingertips of God and Adam.\n\nNotice the electric tension: God's finger is taut with creative omnipotence, while Adam's languid hand awakens with nascent consciousness. The universe hangs upon this tiny void.`,
    };
  }

  // Default fallback
  const firstFp = fps[0] || { x: 50, y: 50, zoom: 2.5, name: "Central Composition" };
  return {
    content: `Welcome, discerning patron. As Head Curator of Mostra d'Arte, I invite you to delve beneath the surface of this masterpiece.\n\nLet me direct your attention to **${firstFp.name}**. Notice how the artist’s compositional mastery balances tension and harmony across the canvas. What element captures your curiosity? Ask me any detail, or click directly onto the canvas to direct our inquiry!`,
  };
}

async function startServer() {
  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mostra d'Arte server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
