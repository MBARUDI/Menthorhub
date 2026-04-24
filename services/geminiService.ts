import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ChatMessage, SafetyQuizResponse } from '../types';

// Initialize Gemini API Client
// Note: process.env.API_KEY is assumed to be available per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FLASH = 'gemini-2.5-flash';

export const generateChatResponse = async (
  history: ChatMessage[],
  systemInstruction: string
): Promise<string> => {
  try {
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Network error or API limit reached. Please try again.";
  }
};

export const generateSafetyQuiz = async (topic: string): Promise<SafetyQuizResponse | null> => {
  try {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      },
      required: ["questions"]
    };

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Generate a 3-question safety training quiz about: ${topic}. Ensure questions are practical and related to workplace safety standards (like OSHA or NR-10).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as SafetyQuizResponse;
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return null;
  }
};

export const fetchNewsWithGrounding = async (topic: string): Promise<{ text: string, sources: Array<{title: string, uri: string}> }> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Pesquise na internet e forneça um resumo atualizado (estilo boletim de notícias) sobre: ${topic}. 
      Liste as 3-5 notícias ou vagas mais relevantes encontradas. 
      Use formatação Markdown para títulos e listas. 
      Seja direto e informativo.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3, // Lower temperature for more factual reporting
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter((s: any) => s !== null) || [];

    // Deduplicate sources
    const uniqueSources = sources.filter((v: any, i: number, a: any) => a.findIndex((t: any) => (t.uri === v.uri)) === i);

    return {
      text: response.text || "Não foi possível encontrar notícias no momento.",
      sources: uniqueSources
    };
  } catch (error) {
    console.error("Gemini News Error:", error);
    return { text: "Erro ao buscar notícias. Verifique sua conexão.", sources: [] };
  }
};