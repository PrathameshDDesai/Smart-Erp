const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inject the API key provided by the user
const genAI = new GoogleGenerativeAI("AIzaSyDD7H8lloMZpqw1pgbpPfN5Vldsm8j8Fvc");

router.post('/chat', async (req, res) => {
    const { message } = req.body;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: "You are EduERP Guide, a highly enthusiastic and motivating AI counselor for a college. Your job is to encourage students, recommend extracurriculars, give study tips, and answer questions like 'What is Java?' or 'How much are fees?'. Keep responses friendly, optimistic, and relatively short (2-3 sentences max). Do NOT use markdown like asterisks or bolding, just plain text so the voice synthesizer can read it naturally."
        });

        const result = await model.generateContent(message);
        const reply = result.response.text();

        res.json({ reply });
    } catch (err) {
        console.error("Gemini AI Error:", err);
        res.status(500).json({ reply: "I'm having a little trouble connecting to my brain right now! Please try again later." });
    }
});

module.exports = router;
