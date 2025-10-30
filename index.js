// index.js
// Secure proxy server for Roblox → Gemini AI
// Works on Render, Replit, or any Node.js host

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔐 Load your Gemini API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY not set in environment variables!");
}

// Gemini API endpoint (you can change the model if needed)
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
?key=${GEMINI_API_KEY}`;

// 🧠 Main endpoint that Roblox calls
app.post("/generate", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body." });
    }

    // Prepare the payload for Gemini API
    const payload = {
      contents: [
        {
          parts: [{ text: userPrompt }],
        },
      ],
    };

    // Call Gemini
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Extract AI response text
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.error("Unexpected Gemini API response:", data);
      return res
        .status(500)
        .json({ error: "Failed to get response from Gemini API." });
    }

    // ✅ Send the AI’s response back to Roblox
    res.status(200).json({ response: aiText });
  } catch (error) {
    console.error("🔥 Internal Server Error:", error);
    res.status(500).json({ error: "Internal proxy server error." });
  }
});

// 🌐 Default route (for testing)
app.get("/", (req, res) => {
  res.send("✅ Roblox AI Proxy is running! Send POST requests to /generate");
});

// 🚀 Start server (Render requires dynamic port)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
