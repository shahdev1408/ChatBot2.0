// index.js (Final Version with Function Calling)

// 1. Import necessary packages
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI, FunctionDeclarationSchemaType } from "@google/generative-ai";

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
    // Start a new chat session for each request to handle function calls correctly
    const chat = model.startChat();
    const result = await chat.sendMessage(userInput);
    const response = result.response;

    // Check if the model wants to call a function
    if (response.functionCalls) {
      const functionCall = response.functionCalls[0];
      
      if (functionCall.name === "get_current_weather") {
        console.log("🤖 AI wants to call the weather tool...");
        const { location } = functionCall.args;

        // Call your weather function
        const weatherData = await get_current_weather(location);
        
        // Send the weather data back to the model
        const result2 = await chat.sendMessage([
          {
            functionResponse: {
              name: "get_current_weather",
              response: weatherData,
            },
          },
        ]);

        // Get the final, natural language response
        const finalResponse = result2.response.text();
        res.json({ reply: finalResponse });
      }
    } else {
      // If no function call, just send the regular text response
      res.json({ reply: response.text() });
    }

  } catch (error) {
    console.error("❌ API error:", error.message);
    res.status(500).json({ error: "Failed to get a response from the AI." });
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
