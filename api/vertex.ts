import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const { prompt } = req.body;

    // Inicialização do SDK unificado focando no Vertex AI
    // A Vercel injetará as credenciais via Variáveis de Ambiente
    const ai = new GoogleGenAI({
      vertexai: {
        project: process.env.GOOGLE_CLOUD_PROJECT_ID,
        location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
      }
    });

    // Otimizado para o Construtor de Prompts (instruções de sistema separadas)
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: {
        systemInstruction: "Atue como um Arquiteto de Prompts especialista. Otimize e reestruture as entradas fornecidas.",
        temperature: 0.3, // Baixa temperatura para respostas técnicas e precisas
      }
    });

    return res.status(200).json({ result: response.text });

  } catch (error) {
    console.error("Erro no Vertex AI:", error);
    return res.status(500).json({ error: 'Falha na geração do prompt.' });
  }
}
