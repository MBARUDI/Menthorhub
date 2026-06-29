import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ChatMessage, SafetyQuizResponse, QuadrantItem, FiveQsData, QuadrantType, IncomeItem, ExpenseItem, InvestmentItem, GoalItem, WorkItem } from '../types';

// Initialize Gemini API Client
const apiKeyInit = process.env.API_KEY || '';
const ai: any = apiKeyInit ? new GoogleGenAI({ apiKey: apiKeyInit }) : null;

const MODEL_TEXT = 'gemini-3-flash-preview';
const MODEL_PRO = 'gemini-3-pro-preview';

// Helper to make calls directly to OpenRouter if using an OpenRouter key
const callOpenRouter = async (
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.7,
  responseFormat?: any
): Promise<string> => {
  const apiKey = process.env.API_KEY || "";
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

// Robust helper to parse JSON outputs, handling markdown blocks, literal newlines, and escaping issues
const safeParseJSON = (text: string): any => {
  let cleaned = text.trim();
  
  // Remove markdown block wrap if present
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
    throw new Error(`Não foi possível decodificar o JSON retornado pela IA. Por favor, tente novamente. Detalhes: ${err.message}`);
  }
};



export const generateChatResponse = async (
  history: ChatMessage[],
  systemInstruction: string
): Promise<string> => {
  const apiKey = process.env.API_KEY || "";
  
  if (apiKey.startsWith("sk-or-")) {
    try {
      const messages = [
        { role: "system", content: systemInstruction },
        ...history.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.text
        }))
      ];
      return await callOpenRouter(messages, 0.7);
    } catch (error) {
      console.error("OpenRouter Chat Error:", error);
      return "Erro de conexão ou limite de API atingido no OpenRouter. Tente novamente.";
    }
  }

  try {
    // Gemini API requires the first message to be from the 'user' role.
    let validHistory = [...history];
    while (validHistory.length > 0 && validHistory[0].role !== 'user') {
      validHistory.shift();
    }

    const contents = validHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Desculpe, não consegui gerar uma resposta no momento.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Erro de conexão ou limite de API atingido. Tente novamente.";
  }
};

export const generateSafetyQuiz = async (topic: string): Promise<SafetyQuizResponse | null> => {
  const apiKey = process.env.API_KEY || "";

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

      const messages = [
        {
          role: "user",
          content: `Gere um quiz de segurança do trabalho com 3 perguntas sobre: ${topic}. 
          As perguntas devem ser práticas e em português brasileiro.
          Retorne obrigatoriamente em formato JSON seguindo este esquema: ${JSON.stringify(schema)}`
        }
      ];

      const responseText = await callOpenRouter(messages, 0.4, { type: "json_object" });
      return JSON.parse(responseText) as SafetyQuizResponse;
    } catch (error) {
      console.error("OpenRouter Quiz Error:", error);
      return null;
    }
  }

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
      model: MODEL_TEXT,
      contents: `Gere um quiz de segurança do trabalho com 3 perguntas sobre: ${topic}. 
      As perguntas devem ser práticas e em português brasileiro.`,
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
  const apiKey = process.env.API_KEY || "";

  if (apiKey.startsWith("sk-or-")) {
    try {
      const messages = [
        {
          role: "user",
          content: `Pesquise na internet e forneça um resumo atualizado (estilo boletim de notícias) sobre: ${topic}. 
          Liste as notícias ou vagas mais relevantes encontradas no Brasil. 
          Use formatação Markdown.`
        }
      ];
      const text = await callOpenRouter(messages, 0.3);
      return {
        text: text || "Não foi possível encontrar notícias no momento.",
        sources: []
      };
    } catch (error) {
      console.error("OpenRouter News Error:", error);
      return { text: "Erro ao buscar notícias no OpenRouter. Tente novamente.", sources: [] };
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Pesquise na internet e forneça um resumo atualizado (estilo boletim de notícias) sobre: ${topic}. 
      Liste as notícias ou vagas mais relevantes encontradas no Brasil. 
      Use formatação Markdown.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter((s: any) => s !== null) || [];

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

export const generateDailyTip = async (context: 'language' | 'leadership' | 'safety'): Promise<string> => {
  const prompts = {
    language: "Gere uma 'Palavra do Dia' em inglês com tradução, exemplo de uso e uma curiosidade cultural curta.",
    leadership: "Forneça um insight de liderança ou gestão para o dia de hoje. Curto e inspirador.",
    safety: "Dê uma dica rápida de segurança do trabalho (DDS) para prevenir acidentes comuns no escritório ou canteiro de obras."
  };

  const apiKey = process.env.API_KEY || "";

  if (apiKey.startsWith("sk-or-")) {
    try {
      const messages = [
        {
          role: "user",
          content: prompts[context]
        }
      ];
      return await callOpenRouter(messages, 0.8);
    } catch (error) {
      return "O sucesso é a soma de pequenos esforços repetidos dia após dia.";
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompts[context],
      config: { temperature: 0.8 }
    });
    return response.text || "Mantenha o foco e continue aprendendo!";
  } catch (error) {
    return "O sucesso é a soma de pequenos esforços repetidos dia após dia.";
  }
};

export const generateLumenMessage = async (): Promise<string> => {
  const apiKey = process.env.API_KEY || "";
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
      console.error("OpenRouter Lumen Error:", error);
      return "A perseverança no trabalho dignifica o homem e glorifica a Deus.";
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text?.trim() || "A perseverança no trabalho dignifica o homem e glorifica a Deus.";
  } catch (error) {
    console.error("Gemini Lumen Error:", error);
    return "A perseverança no trabalho dignifica o homem e glorifica a Deus.";
  }
};

export const generateLuzReflection = async (situation: { title: string; references: string }): Promise<{ message: string; mentorship: string; prayer: string }> => {
  const apiKey = process.env.API_KEY || "";
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
      return JSON.parse(text);
    } catch (error: any) {
      console.error("OpenRouter Luz Reflection Error:", error);
      throw new Error(error.message || "Erro desconhecido ao carregar a reflexão do OpenRouter.");
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4,
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error("Gemini Luz Reflection Error:", error);
    throw new Error(error.message || "Erro ao carregar a reflexão do Gemini.");
  }
};


export interface StudyFlashcard {
  college: string;
  question: string;
  answer: string;
}

export interface StudyExerciseResponse {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  glossary: Array<{ term: string; definition: string }>;
  formulas: string;
  flashcards: StudyFlashcard[];
}

export const generateStudyExercise = async (
  subject: string,
  institutions: string,
  topic?: string
): Promise<StudyExerciseResponse> => {
  const apiKey = process.env.API_KEY || "";
  const prompt = `Gere um exercício altamente contextualizado de vestibular sobre a matéria: "${subject}"${topic ? ` (focando especificamente no assunto/tópico: "${topic}")` : ""}. 
  O exercício deve ter o estilo característico das seguintes instituições de vestibular brasileiras: "${institutions}". 
  As alternativas devem ser desafiadoras e realistas.
  
  PROIBIÇÃO ABSOLUTA DE LATEX E CODIFICAÇÃO MATH ($...$): Nunca utilize fórmulas em formato LaTeX ou envoltas em cifrões (como $...$ ou $$...$$). Não use comandos brutos como \\sqrt, \\approx, \\times, \\frac, etc. Tudo deve ser escrito em texto puro e de leitura fluida.
  
  REQUISITO DE FORMATO NATURAL E SÍMBOLOS SIMPLES: Escreva todas as fórmulas, aproximações e cálculos de forma natural em português para que o estudante compreenda imediatamente de forma humana. Use símbolos simples de teclado ou Unicode padrão:
  - Use 'raiz(x)' ou '√x' no lugar de \\sqrt{x}
  - Use '≈' ou 'aproximadamente' no lugar de \\approx
  - Use 'x' ou '*' no lugar de \\times
  - Use '²' ou '^2' para expoentes e potências
  - Use '/' para divisões ou frações
  
  Exemplo incorreto: Use as aproximações: $\\sqrt{1 - (0,08)^2} \\approx 0,9968$
  Exemplo correto: Use as aproximações: raiz(1 - (0,08)²) ≈ 0,9968
  
  Garanta que o JSON final seja perfeitamente válido. Não retorne quebras de linha reais no meio dos valores de string, use \\n para pular linha.
  
  EXTREMA CONCISÃO OBRIGATÓRIA PARA ECONOMIA DE TOKENS: Para evitar cortes no JSON e erros de decodificação de string não terminada, seja o mais breve possível em todos os campos de texto. Limite a "explanation" a no máximo 100 palavras e o "glossary" a no máximo 3 termos curtos.
  
  Retorne obrigatoriamente um objeto JSON contendo:
  1. a questão estruturada em markdown
  2. 4 alternativas de múltipla escolha
  3. o índice correto da alternativa (0 a 3)
  4. uma explicação simplificada e direta passo a passo (máximo 100 palavras)
  5. um glossário com no máximo 3 termos técnicos curtos e suas definições
  6. as fórmulas matemáticas ou científicas aplicáveis em texto natural e curto (se não aplicável, coloque que não foram necessárias)
  7. uma lista de exatamente 10 flashcards de estudo no array "flashcards". Cada um dos 10 itens deve corresponder a uma das seguintes faculdades: ENEM, FUVEST, INSPER, FGV, MAUÁ, FEI, UNICAMP, UNESP, INSTITUTO FEDERAL, LINK. Cada flashcard deve conter: "college" (nome da faculdade correspondente), "question" (pergunta ou conceito chave sobre o assunto/tópico em foco no estilo de cobrança dessa faculdade) e "answer" (resposta muito resumida, direta e de fácil entendimento, MÁXIMO 12 PALAVRAS por resposta).`;


  const schema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "A questão do vestibular formatada em Markdown." },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exatamente 4 opções de múltipla escolha."
      },
      correctAnswerIndex: { type: Type.INTEGER, description: "Índice de 0 a 3 da resposta correta." },
      explanation: { type: Type.STRING, description: "Explicação resumida e direta passo a passo do gabarito (máximo 100 palavras)." },
      glossary: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING, description: "O termo técnico." },
            definition: { type: Type.STRING, description: "A definição simplificada." }
          },
          required: ["term", "definition"]
        },
        description: "Glossário simplificado com no máximo 3 termos curtos."
      },
      formulas: { type: Type.STRING, description: "Lista de fórmulas utilizadas em formato curto." },
      flashcards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            college: { type: Type.STRING, description: "Nome da faculdade (Ex: ENEM, FUVEST, INSPER, FGV, MAUÁ, FEI, UNICAMP, UNESP, INSTITUTO FEDERAL, LINK)." },
            question: { type: Type.STRING, description: "Uma pergunta ou conceito sobre o assunto no estilo cobrado por esta instituição." },
            answer: { type: Type.STRING, description: "A resposta ultra-concisa e direta (máximo de 12 palavras)." }
          },
          required: ["college", "question", "answer"]
        },
        description: "Exatamente 10 flashcards de estudo customizados para esta matéria e tópico."
      }
    },
    required: ["question", "options", "correctAnswerIndex", "explanation", "glossary", "formulas", "flashcards"]
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
      return safeParseJSON(text) as StudyExerciseResponse;
    } catch (error: any) {
      console.error("OpenRouter Study Exercise Error:", error);
      throw new Error(error.message || "Erro desconhecido na geração do exercício.");
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.5,
      },
    });

    const jsonStr = response.text.trim();
    return safeParseJSON(jsonStr) as StudyExerciseResponse;
  } catch (error: any) {
    console.error("Gemini Study Exercise Error:", error);
    throw new Error(error.message || "Erro ao carregar o exercício do Gemini.");
  }
};

export interface ConsciousAuditResponse {
  classification: string;
  verdictScore: number;
  financialAdvice: string;
  ecologicalImpact: string;
  alternatives: string[];
  waitingRuleDays: number;
}

export const generateConsciousAudit = async (
  itemName: string,
  price: number,
  desireLevel: number
): Promise<ConsciousAuditResponse> => {
  const apiKey = process.env.API_KEY || "";
  const prompt = `Faça uma auditoria de consumo consciente de compra planejada para o seguinte item:
  - Nome do Item: "${itemName}"
  - Preço Estimado: R$ ${price}
  - Nível de Desejo Declarado: ${desireLevel} estrelas de 5
  
  A auditoria deve ser extremamente sincera, pé no chão, prática e focada em finanças e sustentabilidade.
  
  EXTREMA CONCISÃO OBRIGATÓRIA PARA ECONOMIA DE TOKENS: Para evitar cortes no JSON e erros de decodificação, limite as explicações e conselhos a no máximo 45 palavras por campo.
  
  Retorne obrigatoriamente um objeto JSON contendo:
  1. classification: Uma frase curta classificando o gasto ("Necessidade essencial", "Desejo moderado" ou "Impulso supérfluo").
  2. verdictScore: Uma nota de consciência de compra de 0 a 10 (onde 10 é extremamente consciente e 0 é desperdício total).
  3. financialAdvice: Um conselho financeiro curto focado no impacto de orçamento (máximo de 45 palavras).
  4. ecologicalImpact: Uma breve consideração do impacto ambiental ou pegada ecológica da produção/descarte deste item (máximo de 45 palavras).
  5. alternatives: Um array de exatamente 3 alternativas de menor custo ou ecologicamente amigáveis.
  6. waitingRuleDays: O número recomendado de dias para aguardar antes de fechar a compra (regra dos 3 a 30 dias para esfriar o impulso).`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      classification: { type: Type.STRING, description: "A classificação da compra." },
      verdictScore: { type: Type.INTEGER, description: "Nota de consciência de 0 a 10." },
      financialAdvice: { type: Type.STRING, description: "Conselho financeiro direto (máximo 45 palavras)." },
      ecologicalImpact: { type: Type.STRING, description: "Parecer ecológico conciso (máximo 45 palavras)." },
      alternatives: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exatamente 3 alternativas mais econômicas ou ecológicas."
      },
      waitingRuleDays: { type: Type.INTEGER, description: "Dias de resfriamento recomendados (3 a 30)." }
    },
    required: ["classification", "verdictScore", "financialAdvice", "ecologicalImpact", "alternatives", "waitingRuleDays"]
  };

  if (apiKey.startsWith("sk-or-")) {
    try {
      const messages = [
        {
          role: "user",
          content: `${prompt}\nRetorne obrigatoriamente no seguinte formato JSON:\n${JSON.stringify(schema)}`
        }
      ];
      const text = await callOpenRouter(messages, 0.5, { type: "json_object" });
      return safeParseJSON(text) as ConsciousAuditResponse;
    } catch (error: any) {
      console.error("OpenRouter Conscious Audit Error:", error);
      throw new Error(error.message || "Erro ao gerar auditoria no OpenRouter.");
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.5,
      },
    });

    const jsonStr = response.text.trim();
    return safeParseJSON(jsonStr) as ConsciousAuditResponse;
  } catch (error: any) {
    console.error("Gemini Conscious Audit Error:", error);
    throw new Error(error.message || "Erro ao gerar auditoria no Gemini.");
  }
};

export const analyzeFinancialBehavior = async (
  quadrantItems: QuadrantItem[],
  fiveQs: FiveQsData
): Promise<string> => {
  const matrixSummary = quadrantItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item.text);
    return acc;
  }, {} as Record<QuadrantType, string[]>);

  const prompt = `
    Atue como um especialista em finanças comportamentais e psicologia do consumo.
    
    Analise os dados de um usuário que está tentando melhorar seu consumo consciente.
    
    DADOS DA MATRIZ DE DECISÃO:
    - Motivadores: \${matrixSummary[QuadrantType.MOTIVATORS]?.join(", ") || "Nenhum informado"}
    - Sabotadores: \${matrixSummary[QuadrantType.SABOTEURS]?.join(", ") || "Nenhum informado"}
    - Ganhos (se mudar): \${matrixSummary[QuadrantType.GAINS]?.join(", ") || "Nenhum informado"}
    - Perdas (se não mudar): \${matrixSummary[QuadrantType.LOSSES]?.join(", ") || "Nenhum informado"}

    RESPOSTAS AOS 5 Qs DO CONSUMO (Sobre uma compra específica ou hábito geral):
    1. O que comprar: \${fiveQs.what}
    2. Por que comprar: \${fiveQs.why}
    3. Como comprar (financeiramente): \${fiveQs.how}
    4. De quem comprar (origem): \${fiveQs.who}
    5. Como usar/descartar: \${fiveQs.usage}

    TAREFA:
    Forneça uma análise empática, curta e direta (máximo 300 palavras) em formato Markdown.
    1. Destaque um ponto forte encontrado nos "Motivadores" ou "Ganhos".
    2. Ofereça uma estratégia prática para combater o principal "Sabotador" identificado.
    3. Avalie a coerência das respostas dos 5 Qs. Se a compra parecer impulsiva, alerte gentilmente. Se parecer consciente, parabenize.
    4. Termine com uma frase de impacto sobre liberdade financeira.
  `;

  const apiKey = process.env.API_KEY || "";
  if (apiKey.startsWith("sk-or-")) {
    try {
      const messages = [{ role: "user", content: prompt }];
      return await callOpenRouter(messages, 0.7);
    } catch (error) {
      console.error("OpenRouter Behavioral Analysis Error:", error);
      throw new Error("Falha ao gerar a análise com o OpenRouter.");
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao conectar com o assistente inteligente.");
  }
};

export const generateLifePlan = async (
  matrix: QuadrantItem[],
  fiveQs: FiveQsData,
  incomes: IncomeItem[],
  expenses: ExpenseItem[],
  investments: InvestmentItem[],
  goals: GoalItem[],
  works: WorkItem[]
): Promise<string> => {
  const prompt = `
    Atue como um Consultor Financeiro de Elite e Coach de Carreira (CFP).

    Você deve criar um "PLANO MESTRE DE VIDA" consolidando todos os dados fornecidos pelo usuário.

    DADOS DO USUÁRIO:
    
    1. PSICOLOGIA (Matriz de Decisão):
    \${JSON.stringify(matrix)}
    
    2. HÁBITOS DE CONSUMO (5 Qs):
    \${JSON.stringify(fiveQs)}
    
    3. SITUAÇÃO FINANCEIRA ATUAL:
    - Renda: \${JSON.stringify(incomes)}
    - Gastos: \${JSON.stringify(expenses)}
    - Investimentos Atuais: \${JSON.stringify(investments)}
    
    4. CARREIRA E ATUAÇÃO (Work Areas):
    \${JSON.stringify(works)}
    
    5. SONHOS E METAS (Goals):
    \${JSON.stringify(goals)}

    TAREFA:
    Crie um plano estratégico detalhado em Markdown. Seja estruturado, motivador e realista.
    
    ESTRUTURA DA RESPOSTA:
    
    ## 1. Diagnóstico Geral
    Faça uma breve síntese cruzando os sabotadores da matriz com os gastos atuais e hábitos dos 5Qs.

    ## 2. Metodologia para Alcançar as Metas
    Para cada horizonte temporal (Curtíssimo, Curto, Médio, Longo, Longuíssimo), descreva:
    - Resumo das metas.
    - Valor total necessário.
    - **Estratégia**: O que ele deve fazer especificamente para alcançar isso (poupar X, investir em Y).

    ## 3. Alocação de Investimentos
    Baseado nos investimentos que ele já tem (\${investments.map(i => i.type).join(', ')}) e no perfil implícito:
    - Quais investimentos ele deve manter?
    - Quais novos tipos de investimento ele deveria considerar para as metas de Longo Prazo?
    - Como distribuir o aporte mensal?

    ## 4. Engenharia Reversa da Renda (Cálculo do Gap)
    - Some o custo de todos os sonhos.
    - Calcule quanto ele precisa investir por mês para atingir esses sonhos nos prazos estipulados.
    - **Diga explicitamente**: "Para alcançar tudo isso, você precisa de uma renda líquida mensal de R$ X".
    - Compare com a renda atual e mostre o "GAP" (quanto falta).

    ## 5. Estratégia de Carreira (Acelerador de Renda)
    Analise as Áreas de Trabalho informadas: \${works.map(w => w.area).join(', ')}.
    - Sugira como ele pode aumentar a renda nessas áreas específicas.
    - Sugira 2 ideias de renda extra ou especialização baseadas nessas áreas.
    
    ## 6. Conclusão Motivacional
    Uma mensagem final conectando os "Motivadores" da matriz com a realização dos sonhos.
  `;

  const apiKey = process.env.API_KEY || "";
  if (apiKey.startsWith("sk-or-")) {
    try {
      const messages = [{ role: "user", content: prompt }];
      return await callOpenRouter(messages, 0.7);
    } catch (error) {
      console.error("OpenRouter Plan Error:", error);
      throw new Error("Falha ao gerar o Plano Mestre com o OpenRouter.");
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 } // Enable thinking for deeper analysis
      }
    });
    return response.text || "Erro ao gerar o plano de vida.";
  } catch (error) {
    console.error("Gemini Plan Error:", error);
    throw new Error("Falha ao gerar o Plano Mestre.");
  }
};

export const analyzeBusinessCanvas = async (canvasData: {
  valueProposition: string;
  customerSegments: string;
  channels: string;
  customerRelationships: string;
  revenueStreams: string;
  keyResources: string;
  keyActivities: string;
  keyPartners: string;
  costStructure: string;
}): Promise<string> => {
  const prompt = `
    Atue como um Consultor de Modelagem de Negócios e Estrategista Lean de Elite (estilo Alexander Osterwalder e Steve Blank).
    
    Analise o seguinte Business Model Canvas fornecido pelo empreendedor:
    
    1. PROPOSTA DE VALOR: \${canvasData.valueProposition}
    2. SEGMENTOS DE CLIENTES: \${canvasData.customerSegments}
    3. CANAIS DE DISTRIBUIÇÃO: \${canvasData.channels}
    4. RELACIONAMENTO COM CLIENTES: \${canvasData.customerRelationships}
    5. FONTES DE RECEITA: \${canvasData.revenueStreams}
    6. RECURSOS CHAVE: \${canvasData.keyResources}
    7. ATIVIDADES CHAVE: \${canvasData.keyActivities}
    8. PARCEIROS CHAVE: \${canvasData.keyPartners}
    9. ESTRUTURA DE CUSTOS: \${canvasData.costStructure}
    
    TAREFA:
    Crie um feedback estratégico de elite em formato Markdown. Seja analítico, construtivo e direto.
    
    ESTRUTURA DA RESPOSTA:
    ## 🎯 Diagnóstico da Proposta de Valor
    Avalie se a proposta de valor realmente resolve a dor do segmento de clientes.
    
    ## ⛓️ Consistência do Canvas (Alinhamento)
    Identifique se há incoerências entre os blocos (ex: proposta de valor de luxo com canais populares, ou atividades chave desconectadas dos recursos).
    
    ## 🚀 3 Sugestões de Otimização Lean
    Forneça 3 ideias práticas e acionáveis para testar hipóteses rapidamente ou reduzir custos.
    
    ## 💡 Frase Inspiradora
    Uma frase motivadora de impacto empresarial.
  `;

  const apiKey = process.env.API_KEY || "";
  if (apiKey.startsWith("sk-or-")) {
    try {
      const messages = [{ role: "user", content: prompt }];
      return await callOpenRouter(messages, 0.7);
    } catch (error) {
      console.error("OpenRouter Canvas Analysis Error:", error);
      throw new Error("Falha ao analisar o Canvas com o OpenRouter.");
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Não foi possível analisar o Canvas no momento.";
  } catch (error) {
    console.error("Gemini Canvas Error:", error);
    throw new Error("Falha ao conectar ao assistente inteligente.");
  }
};

export const generateBusinessDiagnosis = async (swotData: {
  forces: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}): Promise<string> => {
  const prompt = `
    Atue como um Consultor de Gestão Empresarial Sênior e Especialista em Planejamento Estratégico (estilo Michael Porter e Kaplan-Norton).
    
    Analise a matriz SWOT informada pelo empresário:
    
    - FORÇAS (Interno): \${swotData.forces}
    - FRAQUEZAS (Interno): \${swotData.weaknesses}
    - OPORTUNIDADES (Externo): \${swotData.opportunities}
    - AMEAÇAS (Externo): \${swotData.threats}
    
    TAREFA:
    Forneça um Diagnóstico Estratégico e um Plano de Ação PDCA em formato Markdown. Seja extremamente objetivo, focado em alavancagem operacional e mitigação de riscos.
    
    ESTRUTURA DA RESPOSTA:
    ## 📊 Matriz SWOT Cruzada
    Mostre como usar as forças internas para capturar as oportunidades externas, e como blindar as fraquezas contra as ameaças do mercado.
    
    ## 📋 Plano de Ação PDCA (Tabela)
    Crie uma tabela prática de plano de ação contendo:
    | O Que Fazer (Ação) | Por Que Fazer | Como Fazer (Método) | Métrica de Sucesso (KPI) |
    Forneça exatamente 3 ações críticas imediatas.
    
    ## 💡 Conselho Estratégico Final
    Um conselho de liderança focado em execução de metas.
  `;

  const apiKey = process.env.API_KEY || "";
  if (apiKey.startsWith("sk-or-")) {
    try {
      const messages = [{ role: "user", content: prompt }];
      return await callOpenRouter(messages, 0.7);
    } catch (error) {
      console.error("OpenRouter SWOT Analysis Error:", error);
      throw new Error("Falha ao analisar a matriz SWOT com o OpenRouter.");
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Não foi possível gerar o diagnóstico no momento.";
  } catch (error) {
    console.error("Gemini SWOT Error:", error);
    throw new Error("Falha ao conectar com o assistente inteligente.");
  }
};


