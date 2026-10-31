require("dotenv").config();
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(promptText) {
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
        contents: [
            {
                parts: [{ text: promptText }]
            }
        ]
    };

    try {
        const response = await axios.post(endpoint, payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        return result || "❌ Gemini returned an empty response.";
    } catch (error) {
        console.error("❌ Gemini API error:", error.response?.data || error.message);
        return "❌ Failed to get a response from Gemini.";
    }
}

// Example usage
(async () => {
    const reply = await callGemini("What is the capital of Zimbabwe?");
    console.log("🧠 Gemini says:", reply);
})();
