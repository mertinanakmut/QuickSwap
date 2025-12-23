
import { GoogleGenAI, Type } from "@google/genai";
import { MarketAnalysis, VisualAnalysis } from "../types";

// Ürün görsellerini analiz ederek marka, durum ve tutarlılık raporu döndürür.
export async function analyzeListingVisuals(base64Image: string, title?: string): Promise<VisualAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1],
    },
  };
  const prompt = `Analyze this product image for a general P2P marketplace. ${title ? `The user titled it "${title}".` : ''} 
  Determine the likely brand or model, condition (new, like_new, used, or worn), and look for any visual inconsistencies or damage. Return a JSON object.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brand: { type: Type.STRING },
            detectedCondition: { type: Type.STRING },
            authenticityConfidence: { type: Type.NUMBER },
            visualRedFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            descriptionMatch: { type: Type.BOOLEAN }
          },
          required: ["detectedCondition", "authenticityConfidence", "visualRedFlags", "descriptionMatch"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Visual Analysis Error:", error);
    throw error;
  }
}

// Ürün başlığı ve açıklamasına göre pazar fiyatı analizi yapar.
export async function analyzeItemPrice(title: string, description: string): Promise<MarketAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze market value for: ${title}. Description: ${description}. Return JSON with suggestedPrice, confidence, reasoning, and competitorPrices.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPrice: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            competitorPrices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  price: { type: Type.NUMBER }
                },
                required: ["source", "price"]
              }
            }
          },
          required: ["suggestedPrice", "confidence", "reasoning", "competitorPrices"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Price Analysis Error:", error);
    throw error;
  }
}

// Ürün başlığı ve kategorisine göre profesyonel ilan açıklaması üretir.
export async function generateListingDescription(title: string, category: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a marketplace description for "${title}" in category "${category}". Bullet points, under 120 words.`,
  });
  return response.text || "";
}

/**
 * Admin için profesyonel bildirim metni üretir.
 */
export async function generateAdminNotification(topic: string, tone: 'professional' | 'urgent' | 'friendly' = 'professional'): Promise<{title: string, message: string}> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Create a marketplace notification for the topic: "${topic}". Tone: ${tone}. Return JSON with "title" (short) and "message" (max 200 chars). Language: Turkish.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["title", "message"]
        }
      }
    });
    return JSON.parse(response.text || '{"title": "Duyuru", "message": ""}');
  } catch (error) {
    console.error("Notification Generation Error:", error);
    return { title: "Duyuru", message: topic };
  }
}

/**
 * Kullanıcı için profil biyografisi üretir.
 */
export async function generateUserBio(name: string, interests: string[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Create a short, catchy, and professional marketplace biography for a user named "${name}" who is interested in ${interests.join(', ')}. Max 150 chars. Language: Turkish.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Bio Generation Error:", error);
    return "";
  }
}
