// @ts-nocheck
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Configuração obrigatória para evitar erros de CORS na Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, apiKey, userIdea, prompt, style, creativity } = req.body;

    if (!apiKey) {
      return res.status(401).json({ error: 'API Key is missing.' });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    if (action === 'generate') {
      const systemInstruction = "Você é um Arquiteto de Prompts especialista. Sua função é receber uma ideia vaga do usuário e transformá-la em um super prompt detalhado, estruturado e otimizado para extrair o melhor resultado de uma IA. Retorne apenas o prompt otimizado final, pronto para uso.";
      const contentPrompt = `Transforme esta ideia em um super prompt estruturado:\nIdeia original: ${userIdea}\nEstilo desejado: ${style || 'Geral'}\nCriatividade: ${creativity || 'Média'}`;

      const response = await ai.models.generateContent({
        model:'gemini-2.5-flash',
        contents: contentPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: creativity === 'Alta (Criativa)' ? 0.7 : 0.3,
        }
      });

      // Tratamento defensivo de resposta (Evita que o frontend quebre)
      const generatedText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || "Erro: A IA não retornou conteúdo.";
      
      return res.status(200).json({ result: generatedText });
    }

    if (action === 'execute') {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.5 }
      });

      const generatedText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || "Erro: A IA não retornou conteúdo.";

      return res.status(200).json({ result: generatedText });
    }

    return res.status(400).json({ error: 'Invalid action.' });

  } catch (error) {
    console.error("ERRO COMPLETO DO VERTEX:", error);
    // Retornamos 500 mas com uma mensagem de erro real para ajudar no debug
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
}
