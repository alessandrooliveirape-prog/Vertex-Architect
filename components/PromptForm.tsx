import React, { useRef, useState, useMemo } from 'react';
import { PromptStyle, CreativityLevel, Attachment } from '../types';
import { Send, Command, Sparkles, Zap, Gauge, Lightbulb, Paperclip, X, Image as ImageIcon, FileText, Activity, Coins } from 'lucide-react';

interface PromptFormProps {
  userIdea: string;
  setUserIdea: (value: string) => void;
  selectedStyle: PromptStyle;
  setSelectedStyle: (value: PromptStyle) => void;
  creativity: CreativityLevel;
  setCreativity: (value: CreativityLevel) => void;
  onGenerate: () => void;
  isLoading: boolean;
  attachments: Attachment[];
  setAttachments: (files: Attachment[]) => void;
}

const PROMPT_EXAMPLES = [
  { label: "💰 Roteiro de Vendas", text: "Crie um script de cold call persuasivo para vender software de gestão para pequenas empresas." },
  { label: "🐍 API Python", text: "Gere uma API RESTful em Python usando FastAPI com autenticação JWT e documentação Swagger." },
  { label: "📊 Análise de Dados", text: "Atue como cientista de dados e crie um plano para analisar o churn rate de um e-commerce." },
  { label: "🚀 Posts LinkedIn", text: "Escreva uma série de 3 posts engajadores para LinkedIn sobre o futuro da IA no trabalho." },
  { label: "🎓 Revisão Acadêmica", text: "Atue como um revisor acadêmico sênior e critique a metodologia de um estudo hipotético sobre o impacto do trabalho remoto na produtividade." },
  { label: "🤖 Agente Vertex AI", text: "Crie uma System Instruction robusta para um Agente de Atendimento ao Cliente que deve responder sempre com empatia, mas nunca inventar informações (alucinar)." },
  { label: "🎨 Imagem AI", text: "Atue como especialista em Midjourney/DALL-E e crie um prompt detalhado para gerar uma imagem fotorrealista de uma arquitetura sustentável em uma floresta tropical, iluminação cinematográfica 8k." },
  { label: "📺 Publicidade", text: "Desenvolva um roteiro criativo para um comercial de TV de 30 segundos lançando uma marca de tênis feitos de plástico reciclado oceânico, focado em emoção e impacto visual." },
  { label: "🎬 Roteiro Vídeo", text: "Crie um roteiro engajador para um vídeo de YouTube de 10 minutos explicando 'O Paradoxo de Fermi', usando metáforas simples e um tom humorístico para retenção de audiência." }
];

export const PromptForm: React.FC<PromptFormProps> = ({
  userIdea,
  setUserIdea,
  selectedStyle,
  setSelectedStyle,
  creativity,
  setCreativity,
  onGenerate,
  isLoading,
  attachments,
  setAttachments
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Telemetry Calculations
  const metrics = useMemo(() => {
    const charCount = userIdea.length;
    // Rough approximation: 1 token ~= 4 chars
    const textTokens = Math.ceil(charCount / 4);
    // Images cost fixed tokens in Gemini (approx 258)
    const imageTokens = attachments.length * 258;
    const totalTokens = textTokens + imageTokens;
    
    // Estimate Input Cost (Gemini 1.5 Flash Pricing: ~$0.075 / 1M input tokens)
    // Using a higher 'pro' rate for estimation visibility: $0.10/1M
    const cost = (totalTokens / 1_000_000) * 0.10;

    return { charCount, totalTokens, cost: cost < 0.00001 ? "< $0.0001" : `$${cost.toFixed(5)}` };
  }, [userIdea, attachments]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      onGenerate();
    }
  };

  const processFile = (file: File) => {
    // Validar tipo de arquivo
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Apenas imagens (PNG, JPEG, WEBP) e PDFs são suportados.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64Data = result.split(',')[1];
      
      const newAttachment: Attachment = {
        file,
        preview: file.type.startsWith('image/') ? result : '',
        mimeType: file.type,
        base64Data
      };
      
      setAttachments([...attachments, newAttachment]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile);
    }
    // Reset value to allow selecting same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) processFile(file);
        e.preventDefault();
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(processFile);
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Input */}
      <div className="space-y-3">
        <label className="flex items-center justify-between text-sm font-medium text-slate-200">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-vertex-400" />
            Ideia Simples
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">Cole imagens ou arraste arquivos</span>
        </label>
        
        <div 
          className={`relative group transition-all duration-200 ${isDragging ? 'ring-2 ring-vertex-500 bg-vertex-500/10' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <textarea
            className="w-full h-48 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-vertex-500 rounded-t-xl p-4 pb-12 text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-vertex-500 focus:outline-none transition-all resize-none text-base leading-relaxed custom-scrollbar shadow-inner"
            placeholder="Ex: Analise esta imagem de arquitetura e crie um prompt para gerar variações..."
            value={userIdea}
            onChange={(e) => setUserIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={isLoading}
          />
          
          {/* Attachment Toolbar within Textarea */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               multiple 
               accept="image/png, image/jpeg, image/webp, application/pdf"
               onChange={handleFileChange}
             />
             <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-600 backdrop-blur-sm"
                title="Anexar imagem ou arquivo"
             >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Anexar</span>
             </button>
             
             {attachments.length > 0 && (
                <span className="text-xs text-slate-400 font-medium ml-1 bg-slate-700/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                  {attachments.length} arquivo(s)
                </span>
             )}
          </div>
          
          {/* Telemetry Bar (Input) */}
          <div className="bg-slate-900/50 border-x border-b border-slate-700 rounded-b-xl px-4 py-1.5 flex items-center justify-end gap-4 text-[10px] font-mono text-slate-500 select-none">
             <div className="flex items-center gap-1.5" title="Caracteres">
               <FileText className="w-3 h-3" />
               <span>{metrics.charCount}</span>
             </div>
             <div className="flex items-center gap-1.5" title="Tokens Estimados (Input)">
               <Activity className="w-3 h-3" />
               <span>{metrics.totalTokens} tokens</span>
             </div>
             <div className="flex items-center gap-1.5 text-slate-600" title="Custo Estimado (Input)">
               <Coins className="w-3 h-3" />
               <span>{metrics.cost}</span>
             </div>
          </div>
        </div>

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-3 animate-fadeIn">
            {attachments.map((att, index) => (
              <div key={index} className="relative group w-20 h-20 rounded-lg border border-slate-700 bg-slate-800 overflow-hidden flex items-center justify-center">
                 {att.mimeType.startsWith('image/') ? (
                   <img src={att.preview} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <div className="flex flex-col items-center justify-center text-slate-500 gap-1">
                      <FileText className="w-8 h-8" />
                      <span className="text-[9px] uppercase font-bold">PDF</span>
                   </div>
                 )}
                 <button 
                    onClick={() => handleRemoveAttachment(index)}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                 >
                   <X className="w-3 h-3" />
                 </button>
              </div>
            ))}
          </div>
        )}

        {/* Quick Examples Select Box */}
        <div className="pt-2">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lightbulb className="h-4 w-4 text-vertex-400 group-hover:text-vertex-300 transition-colors" />
                </div>
                <select
                  className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm rounded-lg focus:ring-1 focus:ring-vertex-500 focus:border-vertex-500 block pl-10 p-2.5 appearance-none cursor-pointer transition-colors shadow-sm"
                  onChange={(e) => {
                     if (e.target.value) setUserIdea(e.target.value);
                  }}
                  value="" 
                  disabled={isLoading}
                >
                  <option value="" disabled>✨ Carregar um exemplo de prompt...</option>
                   {PROMPT_EXAMPLES.map((example, index) => (
                    <option key={index} value={example.text}>
                      {example.label}
                    </option>
                  ))}
                </select>
                 <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                  <Command className="w-3 h-3" />
                </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Style Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            Estilo
          </label>
          <div className="relative">
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:border-vertex-500 focus:ring-1 focus:ring-vertex-500 outline-none appearance-none cursor-pointer transition-colors shadow-sm"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value as PromptStyle)}
              disabled={isLoading}
            >
              {Object.values(PromptStyle).map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
              <Command className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Creativity Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            Criatividade
          </label>
          <div className="relative">
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:border-vertex-500 focus:ring-1 focus:ring-vertex-500 outline-none appearance-none cursor-pointer transition-colors shadow-sm"
              value={creativity}
              onChange={(e) => setCreativity(e.target.value as CreativityLevel)}
              disabled={isLoading}
            >
              {Object.values(CreativityLevel).map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
              <Command className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          onClick={onGenerate}
          disabled={isLoading || (!userIdea.trim() && attachments.length === 0)}
          className={`
            w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-lg shadow-vertex-900/20 flex items-center justify-center gap-3 transition-all duration-200
            ${isLoading 
              ? 'bg-slate-700 text-slate-400 cursor-wait' 
              : 'bg-vertex-600 hover:bg-vertex-500 hover:shadow-vertex-600/20 active:transform active:scale-[0.98]'
            }
          `}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Otimizando Prompt...</span>
            </>
          ) : (
            <>
              <span>Gerar Super Prompt</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
