import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { Level, Lesson, ExerciseData, LevelTest, WritingCorrection, NextConversationTurn, ConversationMessage, TargetLanguage, TestQuestion } from '../types';
import { INITIAL_SYSTEM_INSTRUCTION } from '../constants';

const getApiKey = () => {
  const key = 
    (typeof process !== 'undefined' && process.env ? (process.env.API_KEY || process.env.GEMINI_API_KEY) : '') ||
    ((import.meta as any).env ? ((import.meta as any).env.VITE_OPENROUTER_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY || (import.meta as any).env.GEMINI_API_KEY) : '') ||
    "AIzaSyDHo_6Pev8ua3btSGLX-MG6SvSl9d1ZRw8";
  return key;
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
  responseFormat?: any,
  maxTokens: number = 900,
  apiKey: string = getApiKey()
): Promise<string> => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "liquid/lfm-2.5-1.2b-instruct:free",
      max_tokens: maxTokens,
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

const BACKUP_GEMINI_KEY = "AIzaSyDHo_6Pev8ua3btSGLX-MG6SvSl9d1ZRw8";

interface AIServiceOptions {
  prompt: string;
  schema?: any;
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: "text/plain" | "application/json";
}

const callAIWithFailover = async (options: AIServiceOptions): Promise<string> => {
  const { prompt, schema, temperature = 0.7, maxTokens = 900, responseMimeType = "text/plain" } = options;
  const primaryKey = getApiKey();
  
  const attempts: { key: string; isOpenRouter: boolean }[] = [];
  
  if (primaryKey) {
    attempts.push({
      key: primaryKey,
      isOpenRouter: primaryKey.startsWith("sk-or-")
    });
  }
  
  if (!primaryKey || primaryKey !== BACKUP_GEMINI_KEY) {
    attempts.push({
      key: BACKUP_GEMINI_KEY,
      isOpenRouter: false
    });
  }

  let lastError: any = null;

  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    if (!attempt.key) continue;

    console.log(`[AI SERVICE] Tentando gerar conteúdo usando ${attempt.isOpenRouter ? 'OpenRouter' : 'Google Gemini'} (Tentativa ${i + 1}/${attempts.length})...`);
    
    try {
      if (attempt.isOpenRouter) {
        let openRouterPrompt = prompt;
        let responseFormat = undefined;

        if (responseMimeType === "application/json") {
          responseFormat = { type: "json_object" };
          if (schema) {
            openRouterPrompt = `${prompt}\nRetorne obrigatoriamente no seguinte formato JSON seguindo este esquema:\n${JSON.stringify(schema)}`;
          }
        }
        
        const messages = [{ role: "user", content: openRouterPrompt }];
        const content = await callOpenRouter(messages, temperature, responseFormat, maxTokens, attempt.key);
        if (!content || !content.trim()) {
          throw new Error("Resposta vazia da OpenRouter");
        }
        return content;
      } else {
        const ai = new GoogleGenAI({ apiKey: attempt.key });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            temperature,
            maxOutputTokens: maxTokens,
            ...(responseMimeType === "application/json" ? {
              responseMimeType: "application/json",
              responseSchema: schema
            } : {})
          }
        });
        const content = response.text?.trim() || "";
        if (!content) {
          throw new Error("Resposta vazia do Google Gemini");
        }
        return content;
      }
    } catch (err: any) {
      console.warn(`[AI SERVICE] Erro na tentativa ${i + 1} (${attempt.isOpenRouter ? 'OpenRouter' : 'Google Gemini'}):`, err.message || err);
      lastError = err;
    }
  }

  throw new Error(`Todas as tentativas de chamada de IA falharam. Último erro: ${lastError?.message || lastError}`);
};

const textAnalysisSchema = {
  type: Type.OBJECT,
  description: "A detailed analysis of the reading text.",
  properties: {
    vocabularyFromText: {
      type: Type.ARRAY,
      description: "A list of key vocabulary words from the reading text, in alphabetical order.",
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The vocabulary word in the target language." },
          meaning: { type: Type.STRING, description: "The Portuguese translation." },
        },
        required: ['word', 'meaning']
      }
    },
    verbsFromText: {
      type: Type.ARRAY,
      description: "A list of important verbs from the text, with their forms.",
      items: {
        type: Type.OBJECT,
        properties: {
          base: { type: Type.STRING, description: "The base form of the verb." },
          past: { type: Type.STRING, description: "The simple past form (or equivalent for the language)." },
          participle: { type: Type.STRING, description: "The past participle form." },
          meaning: { type: Type.STRING, description: "The Portuguese translation." },
        },
        required: ['base', 'past', 'participle', 'meaning']
      }
    },
    expressionsInText: {
      type: Type.ARRAY,
      description: "Any idiomatic expressions found within the reading text. Should be an empty array if none are found.",
      items: {
        type: Type.OBJECT,
        properties: {
          expression: { type: Type.STRING, description: "The idiomatic expression in the target language." },
          meaning: { type: Type.STRING, description: "The meaning of the expression in Portuguese." },
        },
        required: ['expression', 'meaning']
      }
    }
  },
  required: ['vocabularyFromText', 'verbsFromText', 'expressionsInText']
};

const conversationLineSchema = {
    type: Type.OBJECT,
    properties: {
        speaker: { type: Type.STRING, description: "The name of the speaker (e.g., 'Sarah'). Use '[USER]' as the speaker for the user's turn to speak." },
        line: { type: Type.STRING, description: "The line of dialogue in the target language." },
    },
    required: ['speaker', 'line']
};

const phrasalVerbSchema = {
  type: Type.ARRAY,
  description: "A list of phrasal verbs related to the lesson's theme.",
  items: {
    type: Type.OBJECT,
    properties: {
      verb: { type: Type.STRING, description: "The phrasal verb in the target language." },
      meaning: { type: Type.STRING, description: "The meaning in Portuguese." },
      example: { type: Type.STRING, description: "An example sentence using it in the target language." }
    },
    required: ['verb', 'meaning', 'example']
  }
};

const lessonSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.NUMBER },
    title: { 
      type: Type.STRING,
      description: "A short, engaging title for the lesson in the target language." 
    },
    text: { 
      type: Type.STRING, 
      description: "A reading text in the target language, appropriate for the specified level. Around 100-200 words."
    },
    textAnalysis: textAnalysisSchema,
    grammar: { 
      type: Type.OBJECT,
      description: "A grammar explanation in Portuguese, followed by structured examples.",
      properties: {
        explanation: {
          type: Type.STRING,
          description: "The main grammar explanation in Portuguese."
        },
        examples: {
          type: Type.ARRAY,
          description: "An array of example sentences.",
          items: {
            type: Type.OBJECT,
            properties: {
              target: {
                type: Type.STRING,
                description: "The example sentence in the target language."
              },
              portuguese: {
                type: Type.STRING,
                description: "The Portuguese translation of the sentence."
              }
            },
            required: ['target', 'portuguese']
          }
        }
      },
      required: ['explanation', 'examples']
    },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { 
            type: Type.STRING,
            description: "The type of exercise, either 'multiple-choice' or 'fill-in-the-blank'."
          },
          question: { 
            type: Type.STRING,
            description: "The question. For fill-in-the-blank, it MUST start with the root verb in parentheses followed by the sentence in the TARGET LANGUAGE with '___' as the blank."
          },
          options: {
            type: Type.ARRAY,
            description: "An array of 4 string options for multiple-choice questions.",
            items: { type: Type.STRING }
          },
          correctAnswer: { 
            type: Type.STRING,
            description: "The correct answer for the question."
          }
        },
        required: ['type', 'question', 'correctAnswer']
      }
    },
    conversationPractice: {
        type: Type.ARRAY,
        description: "A short conversation practice dialogue (max 20 lines) between a character and the user. Use '[USER]' as the speaker name for the user's turn.",
        items: conversationLineSchema
    },
    vocabulary: {
      type: Type.ARRAY,
      description: "A list of 5 to 7 key vocabulary words from the lesson text.",
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The vocabulary word in the target language." },
          meaning: { type: Type.STRING, description: "The meaning of the word in Portuguese." },
          example: { type: Type.STRING, description: "An example sentence using the word in the target language." }
        },
        required: ['word', 'meaning', 'example']
      }
    },
    idiomaticExpressions: {
      type: Type.ARRAY,
      description: "A list of exactly 6 idiomatic expressions.",
      items: {
        type: Type.OBJECT,
        properties: {
          expression: { type: Type.STRING, description: "The idiomatic expression in the target language." },
          meaning: { type: Type.STRING, description: "The meaning of the expression in Portuguese." },
          example: { type: Type.STRING, description: "An example sentence using the expression in the target language." }
        },
        required: ['expression', 'meaning', 'example']
      }
    },
    phrasalVerbs: phrasalVerbSchema
  },
  required: ['id', 'title', 'text', 'textAnalysis', 'grammar', 'exercises', 'conversationPractice', 'vocabulary', 'idiomaticExpressions', 'phrasalVerbs']
};

export const generateLesson = async (level: Level, lessonNumber: number, userName: string, targetLanguage: TargetLanguage): Promise<Lesson> => {
  const prompt = `
    You are an expert ${targetLanguage} teacher creating curriculum for a language learning app.
    Generate a complete ${targetLanguage} lesson for the ${level} level, lesson number ${lessonNumber}.
    The lesson is for a user named "${userName}". Please personalize the reading 'text' by naturally including their name.

    The lesson's instructions and explanations (like grammar and meanings) must be in Portuguese, but the learning content (text, examples, exercises, conversation) should be in ${targetLanguage}.
    The output MUST be a valid JSON object.
    
    The lesson should focus on a specific theme and grammar point suitable for the ${level} level in ${targetLanguage}.

    After generating the main 'text', create a 'textAnalysis' object based on it. Ensure 'verbsFromText' includes verbs in base, past, and participle forms.
    
    The 'grammar' field MUST be an object with 'explanation' (in Portuguese) and 'examples' (array of objects with 'target' and 'portuguese' keys).

    Create exactly two exercises: 
    1. One multiple-choice (question in Portuguese, options in ${targetLanguage}).
    2. One fill-in-the-blank. IMPORTANT: For the fill-in-the-blank, the 'question' field must start with the target verb in parentheses, followed by the complete sentence in ${targetLanguage} with '___' where the conjugated word goes. Example: "(To Run) She ___ fast yesterday."
    
    Create a 'conversationPractice' section. This should be a short dialogue (max 20 lines) between a character and the user in ${targetLanguage}. Use '[USER]' as the speaker name for the lines the user should say.

    Also, add the following sections:
    1. 'vocabulary': A list of 5-7 key words related to the lesson theme (${targetLanguage}/Portuguese).
    2. 'idiomaticExpressions': A list of exactly 6 idiomatic expressions.
    3. 'phrasalVerbs': A list of phrasal verbs (or common verbal phrases if ${targetLanguage} doesn't strictly have phrasal verbs).
  `;

  try {
    const jsonText = await callAIWithFailover({
      prompt,
      schema: lessonSchema,
      temperature: 0.4,
      responseMimeType: "application/json",
      maxTokens: 4000
    });
    
    const lessonData = safeParseJSON(jsonText) as Lesson;
    lessonData.id = lessonNumber;

    try {
      const primaryKey = getApiKey();
      const imageKey = primaryKey && !primaryKey.startsWith("sk-or-") ? primaryKey : BACKUP_GEMINI_KEY;
      if (imageKey) {
        const ai = new GoogleGenAI({ apiKey: imageKey });
        const imagePrompt = `Create a visually appealing, simple illustration for a language learning app based on the following text. The style should be clean, friendly, and colorful. Text: "${lessonData.text}"`;
        const imageResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: imagePrompt }] },
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });
        const firstPart = imageResponse.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && firstPart.inlineData) {
            const base64ImageBytes = firstPart.inlineData.data;
            lessonData.imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        }
      }
    } catch (imageError) {
        console.error("Could not generate lesson image:", imageError);
    }

    return lessonData;
  } catch (error) {
    console.error("Error generating lesson:", error);
    throw new Error(`Failed to generate ${targetLanguage} lesson.`);
  }
};

const followUpExerciseSchema = {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING },
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
      explanation: { type: Type.STRING }
    },
    required: ['type', 'question', 'correctAnswer', 'explanation']
};

export const generateFollowUpExercise = async (level: Level, originalExercise: ExerciseData, userAnswer: string, targetLanguage: TargetLanguage): Promise<ExerciseData> => {
  const prompt = `
    You are an expert ${targetLanguage} teacher creating adaptive exercises for a language learning app.
    A student at the '${level}' level answered an exercise incorrectly.
    
    Original Exercise Question: "${originalExercise.question}"
    ${originalExercise.options ? `Original Options: [${originalExercise.options.join(', ')}]` : ''}
    Correct Answer: "${originalExercise.correctAnswer}"
    Student's Incorrect Answer: "${userAnswer}"
 
    Please do the following:
    1. Provide a very short, one-sentence explanation in simple Portuguese explaining the mistake or reinforcing the correct concept.
    2. Generate a new, similar exercise to help the student practice and master this specific concept in ${targetLanguage}.
    The new exercise should be of the same type ('${originalExercise.type}').
  `;

  try {
    const jsonText = await callAIWithFailover({
      prompt,
      schema: followUpExerciseSchema,
      temperature: 0.5,
      responseMimeType: "application/json",
      maxTokens: 1500
    });
    return safeParseJSON(jsonText) as ExerciseData;
  } catch (error) {
    console.error("Error generating follow-up exercise:", error);
    throw new Error("Failed to generate follow-up exercise.");
  }
};

export const translateText = async (text: string, targetLanguage: TargetLanguage): Promise<string> => {
  if (!text.trim()) return "";
  const prompt = `Translate the following ${targetLanguage} text to Brazilian Portuguese. Provide only the translation, without any additional comments or explanations.\n\nText to translate:\n"${text}"`;

  try {
    return await callAIWithFailover({
      prompt,
      temperature: 0.3,
      maxTokens: 1500
    });
  } catch (error) {
    console.error("Error translating text:", error);
    return "Erro de tradução.";
  }
};

export const translateBidirectional = async (text: string, fromLang: string, toLang: string): Promise<string> => {
    if (!text.trim()) return "";
    const prompt = `Translate the following text from ${fromLang} to ${toLang}. Provide only the final translated text, without quotes or explanations.\n\nText:\n"${text}"`;
    
    try {
      return await callAIWithFailover({
        prompt,
        temperature: 0.3,
        maxTokens: 1500
      });
    } catch (error) {
      console.error("Error translating text:", error);
      return "Erro de tradução.";
    }
};

const testQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.NUMBER },
    question: { type: Type.STRING },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    correctAnswer: { type: Type.STRING },
    audioText: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] }
  },
  required: ['id', 'question', 'options', 'correctAnswer', 'difficulty']
};

const placementTestSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: testQuestionSchema
        }
    },
    required: ['questions']
};

export const generatePlacementTest = async (targetLanguage: TargetLanguage): Promise<TestQuestion[]> => {
    const prompt = `
      You are an expert ${targetLanguage} evaluator.
      Generate a placement test to determine a student's level in ${targetLanguage}.
      
      Create exactly 6 multiple-choice questions:
      - 2 Questions at a Beginner level (A1/A2) - Mark difficulty as 'easy'.
      - 2 Questions at an Intermediate level (B1/B2) - Mark difficulty as 'medium'.
      - 2 Questions at an Advanced level (C1/C2) - Mark difficulty as 'hard'.
      
      The questions should focus on Grammar, Vocabulary, and Reading Comprehension.
      Do NOT include audio listening questions for this specific test.
      
      IMPORTANT: Keep all questions and options extremely short, concise, and direct (under 10 words per question, under 4 words per option). Avoid any long passages, paragraphs, or wordy options to fit within token constraints.
      
      The output MUST be a valid JSON object containing an array of 'questions'.
    `;
  
    try {
      const jsonText = await callAIWithFailover({
        prompt,
        schema: placementTestSchema,
        temperature: 0.4,
        responseMimeType: "application/json",
        maxTokens: 2000
      });
      const result = safeParseJSON(jsonText) as { questions: TestQuestion[] };
      return result.questions;
    } catch (error) {
      console.error("Error generating placement test:", error);
      throw new Error("Failed to generate placement test.");
    }
};

const levelTestSchema = {
  type: Type.OBJECT,
  properties: {
    reading: {
      type: Type.OBJECT,
      properties: {
        passage: { type: Type.STRING },
        questions: { type: Type.ARRAY, items: testQuestionSchema }
      },
      required: ['passage', 'questions']
    },
    listening: {
      type: Type.OBJECT,
      properties: {
        questions: { type: Type.ARRAY, items: testQuestionSchema }
      },
      required: ['questions']
    },
    grammar: {
      type: Type.OBJECT,
      properties: {
        questions: { type: Type.ARRAY, items: testQuestionSchema }
      },
      required: ['questions']
    }
  },
  required: ['reading', 'listening', 'grammar']
};

export const generateLevelTest = async (level: Level, targetLanguage: TargetLanguage): Promise<LevelTest> => {
  let totalQuestions = 10;
  if (level === Level.Intermediate) totalQuestions = 15;
  if (level === Level.Advanced) totalQuestions = 20;

  const prompt = `
    You are an expert ${targetLanguage} teacher creating an end-of-level assessment.
    Generate a level test for a student who has just completed the ${level} level in ${targetLanguage}.
    The test should be auto-gradable, so all questions must be multiple-choice with 4 options.
    
    Total questions required: ${totalQuestions}. Distribute them roughly evenly between Reading, Listening, and Grammar sections.

    IMPORTANT: The entire test content, including all instructions, questions, options, and passages, MUST BE IN ${targetLanguage}.
    
    Assign a 'difficulty' ('easy', 'medium', 'hard') to each question.

    The test must have three sections:
    1.  **Reading**: 
        -   Provide one reading 'passage' in ${targetLanguage} (150-250 words).
        -   Create multiple-choice questions based on the passage.
    2.  **Listening**: 
        -   Create multiple-choice questions. 
        -   For each question, provide an 'audioText' in ${targetLanguage}.
    3.  **Grammar**: 
        -   Create multiple-choice questions testing common grammar points for the ${level} level in ${targetLanguage}.
  `;

  try {
    const jsonText = await callAIWithFailover({
      prompt,
      schema: levelTestSchema,
      temperature: 0.4,
      responseMimeType: "application/json",
      maxTokens: 4000
    });
    return safeParseJSON(jsonText) as LevelTest;
  } catch (error) {
    console.error("Error generating level test:", error);
    throw new Error("Failed to generate level test.");
  }
};

export const generateToeflSimulation = async (targetLanguage: TargetLanguage, level: Level): Promise<LevelTest> => {
  let totalQuestions = 10;
  if (level === Level.Intermediate) totalQuestions = 15;
  if (level === Level.Advanced) totalQuestions = 20;

  const prompt = `
    You are an expert ${targetLanguage} TOEFL exam creator.
    Generate a short TOEFL simulation test suitable for a student at the ${level} level.
    The test must have exactly ${totalQuestions} questions in total.
    
    The output MUST be a valid JSON object matching the standard test schema.
    Assign difficulty levels ('easy', 'medium', 'hard') to each question.

    Sections:
    1.  **Reading**: 
        -   One academic reading passage (approx 200 words).
        -   Create multiple-choice questions about the text.
    2.  **Listening**:
        -   Create multiple-choice questions. 
        -   'audioText': A short spoken dialogue or sentence.
    3.  **Grammar**:
        -   Create multiple-choice questions testing advanced grammar structures found in TOEFL.
  `;

  try {
    const jsonText = await callAIWithFailover({
      prompt,
      schema: levelTestSchema,
      temperature: 0.4,
      responseMimeType: "application/json",
      maxTokens: 4000
    });
    return safeParseJSON(jsonText) as LevelTest;
  } catch (error) {
    console.error("Error generating TOEFL test:", error);
    throw new Error("Failed to generate TOEFL simulation.");
  }
};

const writingCorrectionSchema = {
  type: Type.OBJECT,
  properties: {
    isCorrect: { type: Type.BOOLEAN },
    score: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
    correctedText: { type: Type.STRING }
  },
  required: ['isCorrect', 'score', 'feedback']
};

export const correctWriting = async (userText: string, lessonContext: string, targetLanguage: TargetLanguage): Promise<WritingCorrection> => {
  const prompt = `
    You are an expert ${targetLanguage} teacher correcting a student's writing.
    The student was asked to write a short text based on the following context: "${lessonContext}".
    The student's text is: "${userText}".

    Please do the following:
    1.  Analyze the text for grammatical errors, spelling mistakes, and awkward phrasing in ${targetLanguage}.
    2.  Determine if the text is 'isCorrect'.
    3.  Assign a 'score' from 0 to 100 based on accuracy, vocabulary, and relevance.
    4.  Provide 'feedback' in Portuguese. 
    5.  If there are errors, provide a 'correctedText' in ${targetLanguage}.
  `;

  try {
    const jsonText = await callAIWithFailover({
      prompt,
      schema: writingCorrectionSchema,
      temperature: 0.5,
      responseMimeType: "application/json",
      maxTokens: 1500
    });
    return safeParseJSON(jsonText) as WritingCorrection;
  } catch (error) {
    console.error("Error correcting writing:", error);
    throw new Error("Failed to correct writing.");
  }
};

const nextConversationTurnSchema = {
    type: Type.OBJECT,
    properties: {
        correction: {
            type: Type.OBJECT,
            properties: {
                isCorrect: { type: Type.BOOLEAN },
                feedback: { type: Type.STRING },
                correctedText: { type: Type.STRING }
            },
            required: ['isCorrect', 'feedback']
        },
        userTranslation: { type: Type.STRING },
        nextMessage: { type: Type.STRING },
        nextMessageTranslation: { type: Type.STRING }
    },
    required: ['correction', 'userTranslation', 'nextMessage', 'nextMessageTranslation']
};

export const getNextConversationTurn = async (
  conversationHistory: ConversationMessage[],
  userResponse: string, 
  topic: string, 
  userName: string,
  targetLanguage: TargetLanguage
): Promise<NextConversationTurn> => {
  const historyString = conversationHistory.map(m => `${m.speaker === 'ai' ? 'AI' : userName}: ${m.text}`).join('\n');

  const prompt = `
    You are an AI ${targetLanguage} conversation partner. Your name is Alex.
    You are having a conversation with a user named ${userName}.
    The topic is: "${topic}".
    The conversation so far:
    ${historyString}

    The user just said: "${userResponse}"

    Your task is to perform these actions in a single response:
    1.  **Correct the user's response**: Analyze the user's text for errors in ${targetLanguage}. Provide simple 'feedback' in Portuguese.
    2.  **Translate User Input**: Provide a Portuguese translation of what the user said (or meant to say) in 'userTranslation'.
    3.  **Continue the conversation**: Generate your 'nextMessage' in ${targetLanguage}. Keep it concise.
    4.  **Translate AI Response**: Provide a Portuguese translation of your 'nextMessage' in 'nextMessageTranslation'.
  `;

  try {
    const jsonText = await callAIWithFailover({
      prompt,
      schema: nextConversationTurnSchema,
      temperature: 0.4,
      responseMimeType: "application/json",
      maxTokens: 1500
    });
    return safeParseJSON(jsonText) as NextConversationTurn;
  } catch (error) {
    console.error("Error getting next conversation turn:", error);
    throw new Error("Failed to get next conversation turn.");
  }
};
