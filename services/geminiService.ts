
import { GoogleGenAI } from "@google/genai";

export const generateThankYouMessage = async (clientName: string, shopName: string): Promise<string> => {
    const defaultMessage = `Thank you for your business, ${clientName}! We at ${shopName} appreciate your prompt payment and look forward to working with you again.`;
    
    if (!process.env.API_KEY) {
        console.warn("Gemini API key not found. Using default message.");
        return defaultMessage;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a short, warm, and professional thank you message for a client named "${clientName}" for their payment to our shop, "${shopName}". Keep it under 25 words and sound friendly.`,
            config: {
                temperature: 0.8,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating thank you message with Gemini:", error);
        return defaultMessage;
    }
};
