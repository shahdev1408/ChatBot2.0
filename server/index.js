// index.js (Your Node.js Backend Server)

// 1. Import necessary packages
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 2. Initial Setup
// Load environment variables from your .env file
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// 3. Initialize the Google Gemini AI Client
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from your .env file.");
  process.exit(1); // Stop the server if the key is missing
}
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const chat = model.startChat();


// 4. Configure Middleware
// Enable CORS to allow your Vercel frontend to communicate with this Render backend
app.use(cors());
// Enable the server to understand JSON formatted request bodies
app.use(express.json());
// Serve all static files (like your html, images, etc.) from the 'public' folder
app.use(express.static('public'));


// 5. Define the API Endpoint
// This is where your frontend will send chat messages
app.post("/chat", async (req, res) => {
  // Extract the user's message from the incoming request
  const userInput = req.body.message;

  // Check if a message was provided
  if (!userInput) {
    return res.status(400).json({ error: "No message provided." });
  }

  console.log(`👉 Received message: "${userInput}"`);

  try {
    // Send the user's message to the Gemini model
    const result = await chat.sendMessage(userInput);
    // Get the text response from the model
    const response = result.response.text();
    
    console.log(`✅ Gemini replied: "${response}"`);
    
    // Send the model's reply back to the frontend
    res.json({ reply: response });

  } catch (error) {
    // Log any errors that occur during the API call
    console.error("❌ Gemini API error:", error.message);
    // Send a generic error message back to the frontend
    res.status(500).json({ error: "Failed to get a response from the AI." });
  }
});


// 6. Start the Server
app.listen(port, () => {
  console.log(`✅ Server is running successfully on port ${port}`);
});
