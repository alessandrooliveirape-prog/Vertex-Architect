export enum PromptStyle {
  GENERAL = 'Geral / Criativo',
  CODING = 'Desenvolvimento de Software',
  DATA_ANALYSIS = 'Análise de Dados',
  SALES_MARKETING = 'Vendas & Marketing',
  ACADEMIC = 'Acadêmico / Pesquisa',
  VERTEX_EXPERT = 'Vertex AI System Prompt',
}

export enum CreativityLevel {
  LOW = 'Baixa (Precisa)',
  MEDIUM = 'Média (Equilibrada)',
  HIGH = 'Alta (Criativa)',
}

export interface Attachment {
  file: File;
  preview: string; // Base64 or URL for preview
  mimeType: string;
  base64Data: string; // Raw base64 for API
}

export interface GenerateRequest {
  idea: string;
  style: PromptStyle;
  creativity: CreativityLevel;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  idea: string;
  style: PromptStyle;
  creativity: CreativityLevel;
  generatedPrompt: string;
  finalResult?: string;
}