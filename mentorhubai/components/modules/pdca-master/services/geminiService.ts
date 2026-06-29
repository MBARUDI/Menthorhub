import { GoogleGenAI, Type } from "@google/genai";
import { Cycle, Task } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
// Initialize conditionally to prevent crashes if key is missing during dev, 
// though the prompt implies it's available.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MODEL_NAME = 'gemini-2.5-flash';

export const generateTasksForGoal = async (goal: string): Promise<string[]> => {
  if (!ai) return ["Configure sua API Key para usar a IA."];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Eu tenho um objetivo de gestão pessoal: "${goal}". Gere uma lista de 5 a 8 tarefas práticas e acionáveis para alcançar este objetivo.`,
      config: {
        systemInstruction: "Você é um especialista em produtividade e método PDCA. Seja direto e prático.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de tarefas sugeridas"
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    const parsed = JSON.parse(jsonText);
    return parsed.tasks || [];
  } catch (error) {
    console.error("Erro ao gerar tarefas:", error);
    return [];
  }
};

export const analyzePerformance = async (cycle: Cycle): Promise<string> => {
  if (!ai) return "API Key não configurada.";

  const completedCount = cycle.tasks.filter(t => t.completed).length;
  const totalCount = cycle.tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const prompt = `
    Estou na fase 'CHECK' do meu ciclo PDCA.
    Objetivo: ${cycle.goal}
    Progresso: ${completedCount} de ${totalCount} tarefas completadas (${percentage}%).
    Minhas observações: "${cycle.checkObservations || 'Nenhuma observação informada'}"
    
    Analise meu desempenho. Seja construtivo, aponte possíveis falhas se a taxa for baixa, ou parabenize se for alta. Dê 1 conselho curto para a fase de 'AGIR'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor PDCA amigável e perspicaz.",
      }
    });
    return response.text || "Não foi possível gerar análise.";
  } catch (error) {
    console.error("Erro na análise IA:", error);
    return "Erro ao conectar com o serviço de IA.";
  }
};

export const suggestImprovements = async (cycle: Cycle): Promise<string> => {
  if (!ai) return "API Key não configurada.";

  const prompt = `
    Estou na fase 'ACT' (Agir) do PDCA.
    Objetivo Anterior: ${cycle.goal}
    O que aprendi/Observações: ${cycle.checkObservations}
    Ações de Melhoria propostas por mim: ${cycle.actImprovements}
    
    Sugira 3 passos concretos para o próximo ciclo baseados nisso.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Erro ao sugerir melhorias:", error);
    return "Erro ao gerar sugestões.";
  }
};
