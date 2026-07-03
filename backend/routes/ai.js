const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

// Inject the API key provided by the user
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
    const { message, imageBase64 } = req.body;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: "You are EduERP Guide, a highly enthusiastic and motivating AI counselor for a college. Your job is to encourage students, recommend extracurriculars, give study tips, and answer questions like 'What is Java?' or 'How much are fees?'. Keep responses friendly, optimistic, and relatively short (2-3 sentences max). Do NOT use markdown like asterisks or bolding, just plain text so the voice synthesizer can read it naturally. If a photo of the user is provided, USE IT to read their emotional state and tailor your tone and response to comfort or encourage them accordingly!"
        });

        let result;
        if (imageBase64) {
             const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
             const imagePart = {
                 inlineData: { data: base64Data, mimeType: "image/jpeg" },
             };
             result = await model.generateContent([message, imagePart]);
        } else {
             result = await model.generateContent(message);
        }
        const reply = result.response.text();

        res.json({ reply });
    } catch (err) {
        console.error("Gemini AI Error:", err);
        res.status(500).json({ reply: "I'm having a little trouble connecting to my brain right now! Please try again later." });
    }
});

router.post('/analyze-stress', async (req, res) => {
    const { imageBase64, text, prn } = req.body;
    
    try {
        let predictedMood = null;
        let predictionConfidence = 0;

        // NEW: Call our local Python Flask Server first if we have an image
        if (imageBase64) {
             try {
                 const pythonRes = await fetch('http://127.0.0.1:5001/predict', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ imageBase64 })
                 });
                 if (pythonRes.ok) {
                     const pyData = await pythonRes.json();
                     predictedMood = pyData.emotion;
                     predictionConfidence = pyData.confidence;
                     console.log("Local Python Model Detected:", pyData);
                 }
             } catch(err) {
                 console.log("Failed to reach Local Emotion API, falling back to pure text analysis.", err.message);
             }
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        let prompt = `
          Analyze the student's emotional state by reading their text: "${text || 'No text provided'}".
          Return ONLY a raw JSON strictly adhering to this format (do not use markdown formatting like \`\`\`json):
          {
            "mood": "Happy" | "Sad" | "Stressed" | "Neutral",
            "confidence": <number between 0 and 100 representing confidence in your mood prediction>,
            "focus_score": <number between 0 and 100 representing the student's focus/attention level based on text>,
            "suggestions": ["Task 1", "Task 2"],
            "alertTeacher": false
          }
          Give helpful, tailored tasks in suggestions.
          Set alertTeacher to true if the mood is Happy, Sad, or Stressed (so the teacher can be kept in the loop).
        `;

        if (predictedMood) {
            prompt = `
              A local offline Keras Emotion Recognition model has analyzed the student's face and detected they are feeling "${predictedMood}" (Confidence: ${predictionConfidence}%).
              The student also wrote this text: "${text || 'No text provided'}".
              
              Return ONLY a raw JSON strictly adhering to this format (do not use markdown formatting like \`\`\`json):
              {
                "mood": "${predictedMood}",
                "confidence": ${predictionConfidence},
                "focus_score": <number between 0 and 100 representing the student's focus/attention level>,
                "suggestions": ["Task 1", "Task 2"],
                "alertTeacher": false
              }
              Make sure to keep the mood exactly as "${predictedMood}" and confidence as ${predictionConfidence}.
              Give helpful, tailored tasks in suggestions based on their mood and text.
              Set alertTeacher to true if the mood is Sad or Stressed.
            `;
        }

        let result;
        // Notice we NO LONGER send the image to Gemini! We only send the text prompt!
        try {
             // Simply pass the text prompt to Gemini
             result = await model.generateContent(prompt);
        } catch (apiError) {
             console.error("Gemini API Error (Likely invalid key):", apiError.message);
             if (predictedMood) {
                 // Hybrid Fallback: If Gemini is down, the ERP still works because our local Python ML model stepped in!
                 const fallbackResponse = {
                     mood: predictedMood,
                     confidence: predictionConfidence,
                     focus_score: 50,
                     suggestions: ["Focus on your breathing.", "Take a short break.", "Drink some water."],
                     alertTeacher: false
                 };
                 return res.json(fallbackResponse);
             } else {
                 throw apiError;
             }
        }

        let jsonString = result.response.text().trim();
        if (jsonString.startsWith('```json')) jsonString = jsonString.substring(7);
        if (jsonString.endsWith('```')) jsonString = jsonString.substring(0, jsonString.length - 3);
        
        const analysis = JSON.parse(jsonString);

        if (analysis.alertTeacher && prn) {
            await db.execute('INSERT INTO Faculty_Alerts (prn, mood, suggestions, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', 
                 [prn, analysis.mood, JSON.stringify(analysis.suggestions)]);
        }

        res.json(analysis);
    } catch (err) {
        console.error("Emotion Fusion Error:", err);
        res.status(500).json({ error: "Failed to analyze stress." });
    }
});

module.exports = router;
