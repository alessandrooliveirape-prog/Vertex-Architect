import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { PromptStyle, CreativityLevel, Attachment } from '../types';

const SYSTEM_INSTRUCTION = `
Você é o "Vertex Architect", uma IA de elite especializada em Engenharia de Prompt (Prompt Engineering) para Modelos de Linguagem Grande (LLMs), com foco específico no Google Gemini e Vertex AI.

SEU OBJETIVO:
Transformar a ideia simples e vaga de um usuário (que pode incluir imagens ou arquivos) em um "Super Prompt" estruturado, altamente detalhado e otimizado para obter as melhores respostas de uma IA.

ESTRUTURA OBRIGATÓRIA DA SAÍDA:
Você deve retornar APENAS o prompt otimizado. O prompt otimizado deve seguir rigorosamente esta estrutura, utilizando as tags entre colchetes:

[PERSONA]
Defina quem a IA deve ser (ex: Especialista Sênior, Consultor Criativo). Inclua tom de voz e nível de expertise.

[CONTEXTO]
Descreva o cenário, o background necessário e por que essa tarefa é importante. Se houver imagens fornecidas, incorpore a análise delas aqui.

[TAREFAS]
Uma lista passo a passo, lógica e detalhada do que a IA deve executar. Use verbos de ação.

[RESTRIÇÕES]
O que a IA NÃO deve fazer. Limites de tamanho, estilo, viéses a evitar, etc.

[FORMATO DE SAÍDA]
Como a resposta deve ser apresentada (Markdown, Tabela, JSON, Código, etc.). Exemplifique se necessário.

DIRETRIZES DE ESTILO:
- Se o estilo for CODING: Foco em Clean Code, SOLID, tratamento de erros e documentação.
- Se o estilo for SALES: Foco em persuasão, gatilhos mentais (AIDA, PAS) e copywriting.
- Se o estilo for DATA: Foco em precisão, metodologia estatística e visualização.
- Se o estilo for VERTEX_EXPERT: Crie um System Instruction técnico para configurar agentes.

Não adicione conversas extras, apenas entregue o prompt final estruturado.
`;

const getTemperature = (creativity: CreativityLevel): number => {
  switch (creativity) {
    case CreativityLevel.LOW: return 0.2;
    case CreativityLevel.HIGH: return 0.9;
    case CreativityLevel.MEDIUM: 
    default: return 0.5;
  }
};

// Configurações de segurança permissivas para ferramentas de criação profissional
const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

export const generateSuperPrompt = async (
  apiKey: string,
  idea: string, 
  style: PromptStyle, 
  creativity: CreativityLevel,
  attachments: Attachment[] = []
): Promise<string> => {
  if (!apiKey) throw new Error("API Key não fornecida.");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const textPrompt = `
      Ideia do Usuário: "${idea}"
      Estilo Desejado: ${style}
      
      ${attachments.length > 0 ? 'NOTA: O usuário anexou arquivos. Analise o conteúdo visual/textual dos anexos e use-os como base fundamental para criar o Super Prompt.' : ''}

      Gere o Super Prompt agora.
    `;

    // Construct the contents array
    const parts: any[] = [{ text: textPrompt }];

    // Append attachments
    attachments.forEach(att => {
      parts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.base64Data
        }
      });
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts }, // Multimodal request
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: getTemperature(creativity),
        topP: 0.95,
        safetySettings: SAFETY_SETTINGS,
      }
    });

    return response.text || "Não foi possível gerar o prompt. Tente novamente.";
  } catch (error) {
    console.error("Erro ao chamar Gemini API:", error);
    throw error;
  }
};

export const executePrompt = async (apiKey: string, superPrompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key não fornecida.");

  const ai = new GoogleGenAI({ apiKey });

  try {
    // We send the "Super Prompt" directly as the content. 
    // Since the Super Prompt is structured with instructions, the model will follow it.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: superPrompt,
      config: {
        temperature: 0.7, // Balanced temperature for execution
        topP: 0.95,
        safetySettings: SAFETY_SETTINGS,
      }
    });

    return response.text || "Sem resposta gerada.";
  } catch (error) {
    console.error("Erro ao executar prompt:", error);
    throw error;
  }
};