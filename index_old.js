import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";
import express, { text } from "express";
import multer from "multer";

const app = express();
const upload = multer();
const ai = new GoogleGenAI({});
const GEMINI_MODEL = 'gemini-3.5-flash';
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => console.log(`Server is running on "http://localhost:${PORT}"`));

app.post("/generate-content", upload.none(), async (req, res) => {
    const { prompt } = req.body || {};

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });

        res.status(200).json({ result: response.text });
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: error.message });
    }
})

app.post("/generate-image", upload.single('image'), async (req, res) => {
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString('base64');

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                prompt,
                { inlineData: { data: base64Image, mimeType: req.file.mimetype }}
            ],
        });

        res.status(200).json({ result: response.text });
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: error.message });
    }
})

app.post("/generate-document", upload.single('document'), async (req, res) => {
    const { prompt } = req.body;
    const base64Doc = req.file.buffer.toString('base64');

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                prompt,
                { inlineData: { data: base64Doc, mimeType: req.file.mimetype }}
            ],
        });

        res.status(200).json({ result: response.text });
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: error.message });
    }
})

app.post("/generate-audio", upload.single('audio'), async (req, res) => {
    const { prompt } = req.body;
    const base64Audio = req.file.buffer.toString('base64');

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                prompt,
                { inlineData: { data: base64Audio, mimeType: req.file.mimetype }}
            ],
        });

        res.status(200).json({ result: response.text });
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: error.message });
    }
})

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-3.5-flash",
//     contents: "Explain how AI works in a few words",
//   });

//   console.log(response.text);
// }

// main();