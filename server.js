// SAROJ Bridge Server
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const HF_URL = "https://api-inference.huggingface.co/models/gpt2-large";

app.post("/chat", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message" });

    try {
        const hfRes = await fetch(HF_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputs: message })
        });
        const data = await hfRes.json();
        const aiReply = data[0]?.generated_text || "Hmm... I couldn't think of anything.";
        res.json({ reply: aiReply });
    } catch (err) {
        res.json({ reply: "Error connecting to AI server." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SAROJ Bridge running on port ${PORT}`));
                         
