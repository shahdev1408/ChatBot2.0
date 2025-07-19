// index.js (Final Version with Corrected Function Calling)

// 1. Import necessary packages
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI, FunctionDeclarationSchemaType } from "@google/generative-ai";
import fetch from 'node-fetch';

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

// 4. Define the "Tools" (Functions) the AI can use
const tools = [
  {
    functionDeclarations: [
      {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            location: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "The city and state, e.g. San Francisco, CA",
            },
          },
          required: ["location"],
        },
      },
    ],
  },
];

// Initialize the model with the tools
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", tools });

// We will create a chat session that persists on the server
const chat = model.startChat();

// 5. Configure Middleware
app.use(cors());
app.use(express.json());

// 6. Define the API Endpoint
app.post("/chat", async (req, res) => {
  const userInput = req.body.message;
  if (!userInput) {
    return res.status(400).json({ error: "No message provided." });
  }

  console.log(`👉 Received request for: "${userInput}"`);

  try {
    const result = await chat.sendMessageStream(userInput);

    // Set headers for a streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    let accumulatedText = ""; // To check for function calls

    for await (const chunk of result.stream) {
        accumulatedText += chunk.text();
        // Check if the model is trying to call a function
        if (chunk.functionCalls && chunk.functionCalls().length > 0) {
            const functionCall = chunk.functionCalls()[0];
            
            if (functionCall.name === "get_current_weather") {
                console.log("🤖 AI wants to call the weather tool...");
                const { location } = functionCall.args;
                const weatherData = await get_current_weather(location);
                
                // Send the weather data back to the model in a new stream
                const result2 = await chat.sendMessageStream([
                    {
                        functionResponse: {
                            name: "get_current_weather",
                            response: weatherData,
                        },
                    },
                ]);

                // Stream the final response from the second call
                for await (const chunk2 of result2.stream) {
                    res.write(chunk2.text());
                }
                res.end();
                return; // Exit after handling the function call
            }
        } else {
            // If it's a regular text chunk, just send it
            res.write(chunk.text());
        }
    }
    
    // End the response if it was a simple text response
    res.end();
    console.log("✅ Stream finished.");

  } catch (error) {
    console.error("❌ API error:", error.message);
    res.status(500).end("Failed to get a response from the AI.");
  }
});


// 7. Helper function to call the weather API
async function get_current_weather(location) {
    const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
    if (!WEATHER_API_KEY) {
        return { error: "Weather API key is not configured on the server." };
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod !== 200) {
            return { error: data.message || "Could not retrieve weather data." };
        }
        // Return a simplified JSON object for the model
        return {
            location: data.name,
            temperature: `${data.main.temp}°C`,
            description: data.weather[0].description,
        };
    } catch (error) {
        return { error: "Failed to fetch weather data." };
    }
}


// 8. Start the Server
app.listen(port, () => {
  console.log(`✅ Server is running successfully on port ${port}`);
});
