import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getApiKey = () => {
  return process.env.API_KEY || "";
};

const callOpenRouter = async (
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.7
): Promise<string> => {
  const apiKey = getApiKey();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      max_tokens: 500,
      messages,
      temperature
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

export const generateInspirationMessage = async (): Promise<string> => {
  const apiKey = getApiKey();
  const prompt = `Atue como um mentor sábio e cristão. Gere uma única mensagem curta, poderosa e direta (máximo de 35 palavras) em Português do Brasil. 
  
  A mensagem DEVE sintetizar harmoniosamente estes três pilares:
  1. Desenvolvimento Pessoal (caráter, disciplina)
  2. Visão Empresarial (liderança, trabalho duro, sucesso)
  3. Fé Católica (confiança na Providência, ética cristã, servir ao próximo)

  Exemplos de tom: "Trabalhe com excelência como se fosse para Deus, pois o sucesso nos negócios é consequência de um caráter forjado na virtude."
  
  Não use introduções, apenas a frase.`;

  if (apiKey.startsWith("sk-or-")) {
    try {
      const messages = [{ role: "user", content: prompt }];
      return await callOpenRouter(messages, 0.7);
    } catch (error) {
      console.error("Erro ao gerar mensagem via OpenRouter:", error);
      return "Mantenha a fé e trabalhe duro; a luz divina guia os passos de quem busca a excelência com o coração puro.";
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text?.trim() || "A perseverança no trabalho dignifica o homem e glorifica a Deus.";
  } catch (error) {
    console.error("Erro ao gerar mensagem:", error);
    return "Mantenha a fé e trabalhe duro; a luz divina guia os passos de quem busca a excelência com o coração puro.";
  }
};