import { GoogleGenAI } from "@google/genai";
import { JournalEntry } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

export const generateCoachingFeedback = async (entry: JournalEntry): Promise<string> => {
  if (!apiKey) {
    return "Chave de API não configurada. Por favor, configure a API_KEY para receber feedback do coach IA.";
  }

  const model = "gemini-2.5-flash";

  const prompt = `
    Atue como um mentor de desenvolvimento pessoal experiente, empático e sábio.
    Analise o seguinte registro de diário de um usuário e forneça um feedback curto e inspirador (máximo de 150 palavras).
    
    Destaque um ponto forte observado nas respostas e ofereça uma sugestão gentil para as ações de amanhã.
    Termine com uma frase motivacional conectada ao tema do dia do usuário.

    Dados do Diário:
    - O que fez o dia valer a pena: "${entry.positiveHighlight}"
    - Contribuição para o mundo: "${entry.contributionIdea}"
    - O que faria diferente: "${entry.rewindChange}"
    - Ações para amanhã: ${entry.tomorrowActions.filter(a => a.trim() !== '').join(', ')}
    - Gratidão: ${entry.gratitudeList.filter(g => g.trim() !== '').join(', ')}
    - Aprendizado do dia: "${entry.learningConclusion}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Não foi possível gerar um feedback no momento.";
  } catch (error) {
    console.error("Erro ao conectar com Gemini:", error);
    return "Ocorreu um erro ao gerar o feedback do seu diário. Tente novamente mais tarde.";
  }
};