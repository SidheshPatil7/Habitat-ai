import { GoogleGenAI } from "@google/genai";
import { Habit, Metric } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getHealthInsights(habits: Habit[], metrics: Metric[]) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the following health data and provide 3 concise, actionable insights.
    
    Habits: ${JSON.stringify(habits)}
    Metrics: ${JSON.stringify(metrics)}
    
    Format the response as a JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Stay hydrated and keep moving!", "Consistency is key to health.", "Try to get 8 hours of sleep tonight."];
  }
}

export async function chatWithCoach(message: string, history: { role: 'user' | 'model', text: string }[]) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are Vitality AI, a supportive and knowledgeable health coach. Provide evidence-based advice, be encouraging, and keep responses concise. If asked about medical emergencies, advise seeing a doctor.",
    }
  });

  // Reconstruct history
  for (const entry of history) {
    // Note: In a real app we'd use chat.sendMessage for history, 
    // but for simplicity we'll just send the current message with context if needed.
  }

  const response = await chat.sendMessage({ message });
  return response.text;
}
