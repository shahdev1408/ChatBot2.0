import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables from .env file
dotenv.config();

// Retrieve the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

// Log whether the API key was successfully loaded
console.log("✅ Loaded API KEY?", !!API_KEY);

// Initialize the GoogleGenerativeAI client with your API key
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the generative model instance.
// IMPORTANT: 'gemini-pro' is no longer the correct model identifier for this API version.
// We are now using 'gemini-1.5-flash' for general text generation.
// You can also use 'gemini-1.5-pro' for more complex tasks.
// To see all available models and their capabilities, you can use genAI.listModels().
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Create an Express application
const app = express();
const port = process.env.PORT || 3000;
// Enable CORS for all routes, allowing requests from different origins
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Start a new chat session with the model.
// This maintains the conversation history.
const chat = model.startChat({
  // You can optionally provide an initial history here if needed
  // history: [
  //   {
  //     role: "user",
  //     parts: [{ text: "Hello!" }],
  //   },
  //   {
  //     role: "model",
  //     parts: [{ text: "Hi there! How can I help you today?" }],
  //   },
  // ],
  // generationConfig: {
  //   maxOutputTokens: 100, // Example: Limit response length
  // },
});

// Define a POST endpoint for chat messages
app.post("/chat", async (req, res) => {
  // Extract the user's message from the request body
  const userInput = req.body.message;
  console.log("👉 Received:", userInput);

  try {
    // Send the user's message to the Gemini model and await the response
    const result = await chat.sendMessage(userInput);
    // Extract the text content from the model's response
    const response = result.response.text();
    console.log("✅ Gemini replied:", response);
    // Send the model's reply back to the client as JSON
    res.json({ reply: response });
  } catch (error) {
    // Log any errors that occur during the API call
    console.error("❌ Gemini API error:", error.message);
    // Send a 500 Internal Server Error response with the error message
    res.status(500).json({ error: error.message });
  }
});

// Start the Express server and listen on the specified port
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});