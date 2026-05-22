import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";
import express, { text } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer();
const ai = new GoogleGenAI({});
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const PORT = process.env.API_PORT || 3000;

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../Gemini Chatbot/public")));


app.listen(PORT, () => console.log(`Server is running on "http://localhost:${PORT}"`));

app.post('/api/singe-chat', async (req, res) => { 
    const { conversation } = req.body;
    let isValid = true

    try {
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

        contents.forEach(({ role, text }) => {
            if (!isValid) return;

            if (!['model', 'user'].includes(role)) {
                isValid = false;
            }

            if (!text || typeof text !== 'string') {
                isValid = false;
            }
        });

        if(!isValid) {
            return res.status(400).json({
                message: "Invalid Request"
            })
        };

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: "Jawab hanya menggunakan bahasa Indonesia."
            },
        });
        res.status(200).json({ result: response.text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/conversation', async (req, res) => {
    let { message, history, conversation } = req.body;

    try {
        // Support payload in { conversation: [{ role, text }] } format
        if (conversation && Array.isArray(conversation)) {
            if (conversation.length === 0) {
                return res.status(400).json({ error: "Conversation array cannot be empty." });
            }
            const lastTurn = conversation[conversation.length - 1];
            message = lastTurn.text;
            history = conversation.slice(0, -1);
        }

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: "Message is required and must be a string." });
        }

        const formattedHistory = [];
        if (history) {
            if (!Array.isArray(history)) {
                return res.status(400).json({ error: "History must be an array." });
            }

            for (const turn of history) {
                if (turn.parts && Array.isArray(turn.parts)) {
                    formattedHistory.push({
                        role: turn.role,
                        parts: turn.parts
                    });
                } else if (turn.text && typeof turn.text === 'string') {
                    formattedHistory.push({
                        role: turn.role,
                        parts: [{ text: turn.text }]
                    });
                } else {
                    return res.status(400).json({ error: "Each history item must have either 'text' or 'parts'." });
                }
            }
        }

        const chat = ai.chats.create({
            model: GEMINI_MODEL,
            history: formattedHistory,
            config: {
                temperature: 0.9,
                systemInstruction: "Jawab hanya menggunakan bahasa Indonesia."
            }
        });

        const response = await chat.sendMessage({ message });
        const updatedHistory = await chat.getHistory();

        // Build a simplified history for client convenience
        const simpleHistory = updatedHistory.map(turn => ({
            role: turn.role,
            text: turn.parts?.[0]?.text || ""
        }));

        res.status(200).json({
            result: response.text,
            history: updatedHistory,
            simpleHistory
        });
    } catch (error) {
        console.error("Gemini API Error:", error);
        
        // Detect rate limit or quota exhaustion from Gemini API
        const isRateLimit = error.message && (
            error.message.includes("429") || 
            error.message.toLowerCase().includes("resource_exhausted") || 
            error.message.toLowerCase().includes("quota") ||
            error.message.toLowerCase().includes("limit")
        );

        if (isRateLimit) {
            return res.status(429).json({
                error: "Rate limit exceeded (Quota limit reached). Please wait a moment before sending another message."
            });
        }

        res.status(500).json({ error: error.message });
    }
});