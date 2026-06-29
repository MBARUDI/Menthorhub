
import { GoogleGenAI } from "@google/genai";
import { GroundingSource } from "../types";

const apiKey = process.env.API_KEY;

export interface PriceResult {
  price: number;
  sources: GroundingSource[];
}

export const estimateProductPrice = async (productName: string): Promise<PriceResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Pesquise o preço médio atual do produto "${productName}" em supermercados no Brasil (varejo comum). 
  Seja realista e conservador. Ignore promoções extremas ou preços de atacado.
  Retorne APENAS o valor numérico (ex: 15.90). Não use símbolo de moeda. Não escreva texto explicativo.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const cleanText = text.replace(/[^\d.,]/g, '').replace(',', '.');
    const price = parseFloat(cleanText);

    // Extract grounding sources
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({
            title: chunk.web.title || 'Fonte de pesquisa',
            uri: chunk.web.uri
          });
        }
      });
    }

    if (isNaN(price)) {
        return { price: 0, sources }; 
    }
    
    return { price, sources };
  } catch (error) {
    console.error("Error estimating price:", error);
    return { price: 0, sources: [] };
  }
};
