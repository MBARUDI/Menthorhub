import { GoogleGenAI } from "@google/genai";
import { 
  QuadrantItem, 
  FiveQsData, 
  QuadrantType, 
  IncomeItem, 
  ExpenseItem, 
  InvestmentItem, 
  GoalItem, 
  WorkItem 
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      model: "google/gemini-2.5-flash",
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
    - Motivadores: ${matrixSummary[QuadrantType.MOTIVATORS]?.join(", ") || "Nenhum informado"}
    - Sabotadores: ${matrixSummary[QuadrantType.SABOTEURS]?.join(", ") || "Nenhum informado"}
    - Ganhos (se mudar): ${matrixSummary[QuadrantType.GAINS]?.join(", ") || "Nenhum informado"}
    - Perdas (se não mudar): ${matrixSummary[QuadrantType.LOSSES]?.join(", ") || "Nenhum informado"}

    RESPOSTAS AOS 5 Qs DO CONSUMO (Sobre uma compra específica ou hábito geral):
    1. O que comprar: ${fiveQs.what}
    2. Por que comprar: ${fiveQs.why}
    3. Como comprar (financeiramente): ${fiveQs.how}
    4. De quem comprar (origem): ${fiveQs.who}
    5. Como usar/descartar: ${fiveQs.usage}

    TAREFA:
    Forneça uma análise empática, curta e direta (máximo 300 palavras) em formato Markdown.
    1. Destaque um ponto forte encontrado nos "Motivadores" ou "Ganhos".
    2. Ofereça uma estratégia prática para combater o principal "Sabotador" identificado.
    3. Avalie a coerência das respostas dos 5 Qs. Se a compra parecer impulsiva, alerte gentilmente. Se parecer consciente, parabenize.
    4. Termine com uma frase de impacto sobre liberdade financeira.
  `;

  const apiKey = getApiKey();
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
    ${JSON.stringify(matrix)}
    
    2. HÁBITOS DE CONSUMO (5 Qs):
    ${JSON.stringify(fiveQs)}
    
    3. SITUAÇÃO FINANCEIRA ATUAL:
    - Renda: ${JSON.stringify(incomes)}
    - Gastos: ${JSON.stringify(expenses)}
    - Investimentos Atuais: ${JSON.stringify(investments)}
    
    4. CARREIRA E ATUAÇÃO (Work Areas):
    ${JSON.stringify(works)}
    
    5. SONHOS E METAS (Goals):
    ${JSON.stringify(goals)}

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
    Baseado nos investimentos que ele já tem (${investments.map(i => i.type).join(', ')}) e no perfil implícito:
    - Quais investimentos ele deve manter?
    - Quais novos tipos de investimento ele deveria considerar para as metas de Longo Prazo?
    - Como distribuir o aporte mensal?

    ## 4. Engenharia Reversa da Renda (Cálculo do Gap)
    - Some o custo de todos os sonhos.
    - Calcule quanto ele precisa investir por mês para atingir esses sonhos nos prazos estipulados.
    - **Diga explicitamente**: "Para alcançar tudo isso, você precisa de uma renda líquida mensal de R$ X".
    - Compare com a renda atual e mostre o "GAP" (quanto falta).

    ## 5. Estratégia de Carreira (Acelerador de Renda)
    Analise as Áreas de Trabalho informadas: ${works.map(w => w.area).join(', ')}.
    - Sugira como ele pode aumentar a renda nessas áreas específicas.
    - Sugira 2 ideias de renda extra ou especialização baseadas nessas áreas.
    
    ## 6. Conclusão Motivacional
    Uma mensagem final conectando os "Motivadores" da matriz com a realização dos sonhos.
  `;

  const apiKey = getApiKey();
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
