import { GoogleGenAI, Type, Schema } from "@google/genai";
import { INITIAL_SYSTEM_INSTRUCTION } from '../constants';
import { QuizData } from '../types';

export interface LessonContentResponse {
  summary: string;
  keyPoints: string[];
}

const getApiKey = () => {
  return process.env.API_KEY || "";
};

// Robust helper to parse JSON outputs, handling markdown blocks, literal newlines, and escaping issues
const safeParseJSON = (text: string): any => {
  let cleaned = text.trim();
  
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("Standard JSON parse failed, attempting escaping repair...", e);
  }

  try {
    // Repair literal newlines inside double quoted string values
    const repaired = cleaned.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, p1) => {
      return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
    });
    return JSON.parse(repaired);
  } catch (err: any) {
    console.error("JSON repair failed:", err);
    throw new Error(`Não foi possível decodificar o JSON retornado pela IA. Detalhes: ${err.message}`);
  }
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

export const generateLessonContent = async (lessonTitle: string): Promise<LessonContentResponse> => {
  const apiKey = getApiKey();

  if (apiKey.startsWith("sk-or-")) {
    try {
      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "Resumo executivo do conteúdo da aula, com limite estrito de 5 linhas.",
          },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exatamente 3 aprendizados práticos ou insights estratégicos.",
          },
        },
        required: ["summary", "keyPoints"],
      };

      const messages = [
        {
          role: "user",
          content: `Analise a aula de gestão empresarial: "${lessonTitle}". Generosamente resuma o conteúdo e liste 3 pontos chave práticos.
          Use a seguinte instrução de sistema: ${INITIAL_SYSTEM_INSTRUCTION}
          Retorne estritamente em formato JSON seguindo este esquema: ${JSON.stringify(schema)}`
        }
      ];

      const responseText = await callOpenRouter(messages, 0.5, { type: "json_object" });
      return safeParseJSON(responseText) as LessonContentResponse;
    } catch (error) {
      console.error("OpenRouter Lesson Content Error:", error);
      // Fallback in case of error
      return {
        summary: "Esta aula aborda conceitos fundamentais para o sucesso empresarial. Aprenda as melhores práticas de gestão, ferramentas estratégicas e como aplicá-las no seu dia a dia para obter resultados consistentes.",
        keyPoints: [
          "Fundamentos da gestão eficiente",
          "Aplicação prática de estratégias",
          "Desenvolvimento de competências essenciais"
        ]
      };
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analise a aula de gestão empresarial: "${lessonTitle}".`,
      config: {
        systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Resumo executivo do conteúdo da aula, com limite estrito de 5 linhas.",
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exatamente 3 aprendizados práticos ou insights estratégicos.",
            },
          },
          required: ["summary", "keyPoints"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No content generated");
    }

    return safeParseJSON(text) as LessonContentResponse;
  } catch (error) {
    console.error("Gemini API Error (Content):", error);
    return {
      summary: "Esta aula aborda conceitos fundamentais para o sucesso empresarial. Aprenda as melhores práticas de gestão, ferramentas estratégicas e como aplicá-las no seu dia a dia para obter resultados consistentes.",
      keyPoints: [
        "Fundamentos da gestão eficiente",
        "Aplicação prática de estratégias",
        "Desenvolvimento de competências essenciais"
      ]
    };
  }
};

export const sendChatMessage = async (
  message: string, 
  lessonTitle: string, 
  history: {role: string, parts: {text: string}[]}[] = []
): Promise<string> => {
  const apiKey = getApiKey();

  if (apiKey.startsWith("sk-or-")) {
    try {
      const systemInstruction = `Você é um tutor de MBA especialista em: "${lessonTitle}". Responda dúvidas do aluno de forma curta, didática e encorajadora. Máximo 3 frases.`;
      const messages = [
        { role: "system", content: systemInstruction },
        ...history.map(h => ({
          role: h.role === 'model' ? 'assistant' : 'user',
          content: h.parts[0]?.text || ""
        })),
        { role: "user", content: message }
      ];

      return await callOpenRouter(messages, 0.7);
    } catch (error) {
      console.error("OpenRouter Lesson Chat Error:", error);
      return "Desculpe, o sistema de chat está indisponível temporariamente no OpenRouter.";
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `Você é um tutor de MBA especialista em: "${lessonTitle}". Responda dúvidas do aluno de forma curta, didática e encorajadora. Máximo 3 frases.`,
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Não consegui processar sua dúvida no momento.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Desculpe, o sistema de chat está indisponível temporariamente.";
  }
};

export const generateLessonQuiz = async (lessonTitle: string): Promise<QuizData> => {
  const apiKey = getApiKey();

  if (apiKey.startsWith("sk-or-")) {
    try {
      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                text: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Lista de 4 opções de resposta."
                },
                correctIndex: { 
                  type: Type.INTEGER, 
                  description: "Índice da resposta correta (0-3)." 
                }
              },
              required: ["id", "text", "options", "correctIndex"]
            }
          }
        },
        required: ["questions"]
      };

      const messages = [
        {
          role: "user",
          content: `Crie uma prova prática sobre: "${lessonTitle}". 
          Você é um examinador de um curso de MBA. 
          Crie exatamente 5 perguntas de múltipla escolha difíceis e práticas sobre o tema. 
          Cada pergunta deve ter exatamente 4 opções.
          Retorne obrigatoriamente em formato JSON seguindo este esquema: ${JSON.stringify(schema)}`
        }
      ];

      const responseText = await callOpenRouter(messages, 0.4, { type: "json_object" });
      return safeParseJSON(responseText) as QuizData;
    } catch (error) {
      console.error("OpenRouter Lesson Quiz Error:", error);
      // Fallback
      return getQuizFallback();
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Crie uma prova prática sobre: "${lessonTitle}".`,
      config: {
        systemInstruction: `
          Você é um examinador de um curso de MBA.
          Crie exatamente 5 perguntas de múltipla escolha difíceis e práticas sobre o tema.
          Cada pergunta deve ter 4 opções.
          Retorne apenas JSON.
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  text: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Lista de 4 opções de resposta."
                  },
                  correctIndex: { 
                    type: Type.INTEGER, 
                    description: "Índice da resposta correta (0-3)." 
                  }
                },
                required: ["id", "text", "options", "correctIndex"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No quiz generated");
    
    return safeParseJSON(text) as QuizData;
  } catch (error) {
    console.error("Gemini API Error (Quiz):", error);
    return getQuizFallback();
  }
};

export const generateFinalExam = async (): Promise<QuizData> => {
  const apiKey = getApiKey();

  if (apiKey.startsWith("sk-or-")) {
    try {
      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                text: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING }
                },
                correctIndex: { type: Type.INTEGER }
              },
              required: ["id", "text", "options", "correctIndex"]
            }
          }
        },
        required: ["questions"]
      };

      const messages = [
        {
          role: "user",
          content: `Crie a PROVA FINAL do curso de Gestão Empresarial (MBA).
          Você é o diretor acadêmico de uma Business School.
          Crie uma PROVA FINAL com EXATAMENTE 10 questões de múltipla escolha.
          As questões devem cobrir variados tópicos de gestão: Estratégia, Finanças, Marketing, Liderança, RH e Processos.
          Nível de dificuldade: Alto/MBA.
          Retorne em formato JSON seguindo este esquema: ${JSON.stringify(schema)}`
        }
      ];

      const responseText = await callOpenRouter(messages, 0.4, { type: "json_object" });
      return safeParseJSON(responseText) as QuizData;
    } catch (error) {
      console.error("OpenRouter Final Exam Error:", error);
      return getFinalExamFallback();
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Crie a PROVA FINAL do curso de Gestão Empresarial (MBA).`,
      config: {
        systemInstruction: `
          Você é o diretor acadêmico de uma Business School.
          Crie uma PROVA FINAL com EXATAMENTE 10 questões de múltipla escolha.
          As questões devem cobrir variados tópicos de gestão: Estratégia, Finanças, Marketing, Liderança, RH e Processos.
          Nível de dificuldade: Alto/MBA.
          Retorne apenas JSON.
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  text: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Lista de 4 opções de resposta."
                  },
                  correctIndex: { 
                    type: Type.INTEGER, 
                    description: "Índice da resposta correta (0-3)." 
                  }
                },
                required: ["id", "text", "options", "correctIndex"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No final exam generated");
    
    return safeParseJSON(text) as QuizData;
  } catch (error) {
    console.error("Gemini API Error (Final Exam):", error);
    return getFinalExamFallback();
  }
};

const getQuizFallback = (): QuizData => {
  return {
    questions: [
      {
        id: 1,
        text: "Qual é o principal objetivo deste conceito de gestão?",
        options: ["Maximizar custos", "Otimizar processos e resultados", "Ignorar o mercado", "Reduzir a qualidade"],
        correctIndex: 1
      },
      {
        id: 2,
        text: "Como este tópico impacta a liderança?",
        options: ["Não impacta", "Gera confusão", "Melhora a tomada de decisão", "Diminui a produtividade"],
        correctIndex: 2
      },
      {
        id: 3,
        text: "Qual ferramenta é recomendada nesta situação?",
        options: ["Intuição pura", "Análise de dados (KPIs)", "Sorteio", "Adivinhação"],
        correctIndex: 1
      },
      {
        id: 4,
        text: "Qual o erro mais comum ao aplicar esta estratégia?",
        options: ["Planejar demais", "Não monitorar resultados", "Investir em equipe", "Focar no cliente"],
        correctIndex: 1
      },
      {
        id: 5,
        text: "O que define o sucesso neste contexto?",
        options: ["Lucro a qualquer custo", "Sustentabilidade e valor", "Número de funcionários", "Tamanho do escritório"],
        correctIndex: 1
      }
    ]
  };
};

const getFinalExamFallback = (): QuizData => {
  return {
    questions: Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      text: `Questão ${i + 1}: Sobre as melhores práticas de Governança Corporativa e Alinhamento Estratégico no MBA.`,
      options: [
        "Adoção de processos puramente subjetivos.",
        "Implementação de KPIs alinhados ao BSC (Balanced Scorecard).",
        "Maximização imediata de lucros sem visão socioambiental.",
        "Redução do investimento em treinamento técnico."
      ],
      correctIndex: 1
    }))
  };
};