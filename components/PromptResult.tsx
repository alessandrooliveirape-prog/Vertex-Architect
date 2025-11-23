import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, Terminal, Bot, Code2, Play, FileText, Loader2, Cpu, Coins, Activity, Eye, Download, Sparkles, Rocket } from 'lucide-react';

interface PromptResultProps {
  prompt: string;
  isGenerating: boolean;
  finalResult: string;
  isExecuting: boolean;
  onRun: () => void;
}

type Tab = 'prompt' | 'result';

// Simple Markdown Renderer Component to avoid heavy dependencies
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Split by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="font-mono text-sm md:text-[15px] leading-relaxed text-slate-300 space-y-4">
      {parts.map((part, i) => {
        // Render Code Block
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          const language = lines[0].replace('```', '').trim();
          const code = lines.slice(1, -1).join('\n');
          return (
            <div key={i} className="my-4 rounded-lg overflow-hidden border border-slate-700/50 bg-[#0d1117] shadow-sm">
              {language && (
                <div className="px-3 py-1.5 bg-slate-800/50 border-b border-slate-700/50 text-xs text-slate-400 font-sans uppercase tracking-wider select-none">
                  {language}
                </div>
              )}
              <div className="p-4 overflow-x-auto custom-scrollbar">
                <code className="text-blue-300 whitespace-pre font-mono">{code}</code>
              </div>
            </div>
          );
        }

        // Render Regular Text with simple formatting
        return (
          <div key={i} className="whitespace-pre-wrap">
            {part.split('\n').map((line, j) => {
              // Headers
              if (line.startsWith('### ')) return <h3 key={j} className="text-lg font-bold text-vertex-300 mt-6 mb-2">{line.replace('### ', '')}</h3>;
              if (line.startsWith('## ')) return <h2 key={j} className="text-xl font-bold text-white mt-8 mb-3 border-b border-slate-700 pb-1">{line.replace('## ', '')}</h2>;
              if (line.startsWith('# ')) return <h1 key={j} className="text-2xl font-bold text-white mt-8 mb-4">{line.replace('# ', '')}</h1>;
              
              // List Items
              if (line.trim().startsWith('- ')) {
                return (
                    <div key={j} className="flex gap-2 ml-1">
                        <span className="text-vertex-400 select-none">•</span>
                        <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('- ', '')) }} />
                    </div>
                )
              }

              // Tables (Very basic detection)
              if (line.includes('|') && line.includes('-')) {
                 return <div key={j} className="text-slate-400 text-xs font-mono my-1">{line}</div>
              }

              return <div key={j} className="min-h-[1.2em]" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
            })}
          </div>
        );
      })}
    </div>
  );
};

// Helper to bold text between **
const formatInline = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-vertex-100">$1</span>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-purple-300 text-xs border border-slate-700">$1</code>');
};


export const PromptResult: React.FC<PromptResultProps> = ({ 
  prompt, 
  isGenerating, 
  finalResult, 
  isExecuting,
  onRun 
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('prompt');
  
  // Auto-switch tabs based on activity
  useEffect(() => {
    if (isExecuting) {
      setActiveTab('result');
    } else if (finalResult && !isExecuting) {
      setActiveTab('result');
    } else if (prompt && !finalResult && !isExecuting) {
      setActiveTab('prompt');
    }
  }, [isExecuting, finalResult, prompt]);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  // Telemetry Calculations for Output
  const metrics = useMemo(() => {
    const content = activeTab === 'prompt' ? prompt : finalResult;
    if (!content) return { tokens: 0, cost: '$0.00' };

    // Rough approximation: 1 token ~= 4 chars
    const tokens = Math.ceil(content.length / 4);
    
    // Output Cost (Gemini 1.5 Flash Pricing: ~$0.30 / 1M output tokens)
    const cost = (tokens / 1_000_000) * 0.30;
    
    return { 
      tokens, 
      cost: cost < 0.00001 ? "< $0.0001" : `$${cost.toFixed(5)}` 
    };
  }, [prompt, finalResult, activeTab]);

  const handleCopy = async () => {
    const textToCopy = activeTab === 'prompt' ? prompt : finalResult;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const textToDownload = activeTab === 'prompt' ? prompt : finalResult;
    if (!textToDownload) return;

    const blob = new Blob([textToDownload], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeTab === 'prompt' ? 'vertex_architect_prompt.md' : 'vertex_architect_result.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasContent = prompt || isGenerating;

  if (!hasContent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-center">
        
        {/* Welcome Hero */}
        <div className="max-w-md space-y-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
               <div className="absolute inset-0 bg-vertex-500 blur-2xl opacity-20 rounded-full"></div>
               <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center border border-slate-700 shadow-2xl relative">
                  <Cpu className="w-10 h-10 text-vertex-400" />
               </div>
               <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
               </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Vertex Architect</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                A ferramenta definitiva para <span className="text-vertex-300 font-medium">Engenheiros de Prompt</span> e profissionais que buscam extrair o máximo de modelos de IA.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
               <div className="bg-vertex-900/30 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                 <Terminal className="w-4 h-4 text-vertex-400" />
               </div>
               <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide mb-1">Engenharia Reversa</h3>
               <p className="text-[11px] text-slate-500">Transforma ideias vagas em estruturas complexas e otimizadas.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
               <div className="bg-purple-900/30 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                 <Rocket className="w-4 h-4 text-purple-400" />
               </div>
               <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide mb-1">Execução Instantânea</h3>
               <p className="text-[11px] text-slate-500">Gere, teste e refine seus prompts em um único fluxo de trabalho.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/50">
            <p className="text-[10px] text-slate-600 font-mono mb-2">PROJETO DESENVOLVIDO POR</p>
            <div className="flex items-center justify-center gap-2">
               <span className="text-sm font-medium text-slate-300">Alessandro Oliveira</span>
               <span className="text-slate-700">|</span>
               <span className="text-xs font-bold tracking-widest text-vertex-500">1007 STUDIOS</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine current content to display
  const displayContent = activeTab === 'prompt' ? prompt : finalResult;
  const isLoading = activeTab === 'prompt' ? isGenerating : isExecuting;

  return (
    <div className="flex flex-col h-full relative bg-[#0D1117]">
      {/* Editor Tab Bar */}
      <div className="flex items-center justify-between px-0 h-12 bg-slate-900 border-b border-slate-800 select-none">
        <div className="flex items-center h-full overflow-x-auto hide-scrollbar">
          {/* Tab 1: Super Prompt */}
          <button 
            onClick={() => setActiveTab('prompt')}
            className={`
              h-full px-4 flex items-center gap-2 text-xs font-medium border-r border-slate-800 transition-colors whitespace-nowrap
              ${activeTab === 'prompt' 
                ? 'bg-[#0D1117] text-vertex-300 border-t-2 border-t-vertex-500' 
                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border-t-2 border-t-transparent'
              }
            `}
          >
            <Terminal className="w-3.5 h-3.5" />
            super_prompt.md
          </button>

          {/* Tab 2: Output Result */}
          <button 
            onClick={() => setActiveTab('result')}
            disabled={!finalResult && !isExecuting}
            className={`
              h-full px-4 flex items-center gap-2 text-xs font-medium border-r border-slate-800 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed
              ${activeTab === 'result' 
                ? 'bg-[#0D1117] text-purple-300 border-t-2 border-t-purple-500' 
                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border-t-2 border-t-transparent'
              }
            `}
          >
            {activeTab === 'result' ? <Eye className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            output_preview.md
            {isExecuting && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
          </button>
        </div>
        
        <div className="flex items-center px-4 gap-3 hidden sm:flex">
           {isLoading && (
             <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
               <Bot className="w-3.5 h-3.5" />
               <span>{activeTab === 'prompt' ? 'Arquitetando Prompt...' : 'Executando Prompt...'}</span>
             </div>
           )}
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 relative overflow-hidden group">
        {isLoading && !displayContent ? (
          <div className="absolute inset-0 p-8 space-y-4 animate-pulse">
            <div className="h-4 bg-slate-800/50 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800/50 rounded w-1/2"></div>
            <div className="h-4 bg-slate-800/50 rounded w-5/6"></div>
            <div className="space-y-2 mt-8">
              <div className="h-3 bg-slate-800/30 rounded w-full"></div>
              <div className="h-3 bg-slate-800/30 rounded w-full"></div>
              <div className="h-3 bg-slate-800/30 rounded w-2/3"></div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto custom-scrollbar p-6 md:p-8">
            {displayContent ? (
               <>
                 {activeTab === 'prompt' ? (
                   // Raw View for the Prompt (Structure is important)
                   <pre className="font-mono text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap max-w-4xl text-slate-300">
                     {displayContent.split(/(\[.*?\])/g).map((part, index) => {
                       // Highlight section headers
                       if (part.match(/^\[.*\]$/)) {
                         return (
                           <span key={index} className="block mt-8 first:mt-0 mb-3 font-bold text-vertex-400 tracking-wide">
                             {part}
                           </span>
                         );
                       }
                       // Simple bullet highlight
                       if (part.trim().startsWith('- ')) {
                          return <span key={index} className="text-slate-100">{part}</span>
                       }
                       return <span key={index}>{part}</span>;
                     })}
                   </pre>
                 ) : (
                   // Enhanced Markdown-like Render for Result
                   <div className="max-w-4xl mx-auto">
                      <MarkdownRenderer content={displayContent} />
                   </div>
                 )}
               </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-3">
                <Play className="w-12 h-12 opacity-20" />
                <p className="text-sm">Clique em executar para ver o resultado.</p>
              </div>
            )}
            
            {/* Bottom Padding */}
            <div className="h-24"></div> 
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-3">
          {/* Run Button (Only visible on Prompt Tab or if we have a result to re-run) */}
          {!isExecuting && prompt && !isLoading && (
            <button
              onClick={onRun}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-full shadow-xl bg-purple-600 hover:bg-purple-500 text-white transition-all duration-300 transform hover:-translate-y-1 group"
              title="Executar este prompt"
            >
              <Play className="w-5 h-5 fill-current" />
              <span className="font-medium pr-1">Executar Prompt</span>
            </button>
          )}
          
          <div className="flex items-center gap-3">
            {/* Download Button */}
            {!isLoading && displayContent && (
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-full shadow-xl backdrop-blur-md border bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                title="Baixar como arquivo .md"
              >
                <Download className="w-5 h-5" />
              </button>
            )}

            {/* Copy Button */}
            {!isLoading && displayContent && (
              <button
                onClick={handleCopy}
                className={`
                  flex items-center justify-center gap-2 px-5 py-3 rounded-full shadow-xl backdrop-blur-md border transition-all duration-300 transform hover:-translate-y-1
                  ${copied 
                    ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                    : 'bg-vertex-600 text-white border-transparent hover:bg-vertex-500 hover:shadow-vertex-500/30'
                  }
                `}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span className="font-medium">Copiar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Telemetry Status Bar */}
      <div className="h-7 bg-vertex-700 text-white flex items-center justify-between px-4 text-[10px] font-mono select-none z-10 shadow-[0_-1px_10px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-vertex-200">
             <Activity className="w-3 h-3" />
             <span>{metrics.tokens} TOKENS</span>
           </div>
           <div className="flex items-center gap-2 text-vertex-200" title="Custo Estimado (Gemini Output)">
             <Coins className="w-3 h-3" />
             <span>{metrics.cost}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-4 opacity-90">
           <span className="hidden sm:inline">UTF-8</span>
           <span className="hidden sm:inline">{activeTab === 'prompt' ? 'TXT' : 'MARKDOWN'}</span>
           <div className="flex items-center gap-1.5 text-white font-semibold pl-2 border-l border-vertex-500">
             <Cpu className="w-3 h-3" />
             <span>GEMINI 2.5 FLASH</span>
           </div>
        </div>
      </div>
    </div>
  );
}