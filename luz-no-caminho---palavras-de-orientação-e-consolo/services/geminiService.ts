import { GoogleGenAI, Type } from "@google/genai";
import { ReflectionResponse, Situation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const getApiKey = () => {
  return process.env.API_KEY || "";
};

const callOpenRouter = async (
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.7,
  responseFormat?: any
): Promise<string> => {
  const apiKey = getApiKey();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "openrouter/free",
      max_tokens: 900,
      messages,
      temperature,
      ...(responseFormat ? { response_format: responseFormat } : {})
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

export const generateReflection = async (situation: Situation): Promise<ReflectionResponse> => {
  const apiKey = getApiKey();
  const prompt = `Você é um mentor espiritual cristão empático e sábio. O usuário se sente: "${situation.title}". As referências bíblicas sugeridas são: ${situation.references}. 
  Com base nestas passagens, escreva: 
  1. Uma mensagem curta de reflexão e conforto.
  2. Uma breve mentoria/conselho prático baseado na sabedoria bíblica.
  3. Uma oração curta personalizada para este momento.
  Responda em Português do Brasil.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      message: {
        type: Type.STRING,
        description: "Uma mensagem curta de reflexão.",
      },
      mentorship: {
        type: Type.STRING,
        description: "Conselhos práticos e mentoria espiritual.",
      },
      prayer: {
        type: Type.STRING,
        description: "Uma oração curta.",
      },
    },
    required: ["message", "mentorship", "prayer"],
  };

  if (apiKey.startsWith("sk-or-")) {
    try {
      const messages = [
        {
          role: "user",
          content: `${prompt}\nRetorne obrigatoriamente no seguinte formato JSON:\n${JSON.stringify(schema)}`
        }
      ];
      const text = await callOpenRouter(messages, 0.4, { type: "json_object" });
      return JSON.parse(text) as ReflectionResponse;
    } catch (error: any) {
      console.error("OpenRouter Luz Reflection Error:", error);
      throw new Error(error.message || "Erro desconhecido ao carregar a reflexão do OpenRouter.");
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as ReflectionResponse;
  } catch (error) {
    console.error("Erro ao gerar reflexão:", error);
    throw new Error("Não foi possível carregar a reflexão. Tente novamente mais tarde.");
  }
};
