// index.js (Now with Streaming Support)

// 1. Import necessary packages
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 2. Initial Setup
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// 3. Initialize the Google Gemini AI Client
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from your .env file.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 4. Configure Middleware
app.use(cors());
app.use(express.json());

// 5. Define the API Endpoint with Streaming
app.post("/chat", async (req, res) => {
  const userInput = req.body.message;
  if (!userInput) {
    return res.status(400).json({ error: "No message provided." });
  }

  console.log(`👉 Streaming request for: "${userInput}"`);

  try {
    // *** THIS IS THE KEY CHANGE ***
    // Use generateContentStream for a streaming response
    const result = await model.generateContentStream(userInput);

    // Set headers for a streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Stream the response chunk by chunk
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      // Write each chunk to the response stream
      res.write(chunkText);
    }
    
    // End the response stream when finished
    res.end();
    console.log("✅ Stream finished.");

  } catch (error) {
    console.error("❌ Gemini API stream error:", error.message);
    res.status(500).end("Failed to get a streaming response from the AI.");
  }
});

// 6. Start the Server
app.listen(port, () => {
  console.log(`✅ Server is running successfully on port ${port}`);
});
