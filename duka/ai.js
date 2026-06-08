import "dotenv/config";
import express from "express";

const router = express.Router();

export async function generateThankYouMessageDirect(name, amount) {
    const prompt = `
Write a thank you message for ${name} who has just made a payment of ${amount} KES.
Use an appreciative tone and a touch of humour.
Max 40 words.
`;

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GOOGLE_API_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        }
    );

    const data = await response.json();

    return data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

// GEMINI route(update to reusable module for efficiency)
router.post("/thank-you", async (req, res) => {
    try {
        const { name, amount } = req.body;

        if (!name || !amount) {
            return res.status(400).json({
                message: "Name and amount are required"
            });
        }

        const prompt = `
            Write a thank you message for ${name} who has just made a payment of ${amount} KES.
            with an appreciative tone and a touch of humour.
        `;

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GOOGLE_API_KEY
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();

        const message = 
            data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return res.status(200).json({message});

    } catch (error) {
        console.error("Error generating thank you message:", error);
        
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

export default router;