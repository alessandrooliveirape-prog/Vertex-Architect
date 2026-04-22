import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { PromptResult } from './components/PromptResult';
import { HistoryList } from './components/HistoryList';
import { PromptStyle, CreativityLevel, HistoryItem, Attachment } from './types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [userIdea, setUserIdea] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<PromptStyle>(PromptStyle.GENERAL);
  const [creativity, setCreativity] = useState<CreativityLevel>(CreativityLevel.MEDIUM);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // State for Step 1: Super Prompt
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // State for Step 2: Final Result
  const [finalResult, setFinalResult] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('vertex_architect_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    
    const savedKey = localStorage.getItem('vertex_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('vertex_architect_history', JSON.stringify(history));
  }, [history]);

  // Toast timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('vertex_api_key', key);
    if (key) {
      setToastMessage("API Key salva com sucesso!");
      setError(null);
    }
  };

  const handleNewProject = () => {
    setUserIdea('');
    setSelectedStyle(PromptStyle.GENERAL);
    setCreativity(CreativityLevel.MEDIUM);
    setAttachments([]);
    setGeneratedPrompt('');
    setFinalResult('');
    setIsGenerating(false);
    setIsExecuting(false);
    setError(null);
    setCurrentHistoryId(null);
    
    setToastMessage("Novo projeto iniciado!");
  };

  // Refatorado para chamar o backend (Serverless Function Vercel)
  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Por favor, configure sua API Key no painel acima para continuar.");
      return;
    }

    if (!userIdea.trim() && attachments.length === 0) {
      setError("Por favor, digite uma ideia ou anexe um arquivo para começar.");
      return;
    }

    setIsGenerating(true);
    setFinalResult('');
    setError(null);
    setGeneratedPrompt('');

    try {
      const response = await fetch('/api/vertex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          apiKey,
          userIdea,
          style: selectedStyle,
          creativity,
          attachments
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      const result = data.result;

      setGeneratedPrompt(result);
      
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        idea: userIdea + (attachments.length > 0 ? ` [${attachments.length} arquivo(s)]` : ''),
        style: selectedStyle,
        creativity: creativity,
        generatedPrompt: result,
        finalResult: ''
      };

      setHistory(prev => [newItem, ...prev]);
      setCurrentHistoryId(newItem.id);

    } catch (err) {
      console.error(err);
      setError("Falha na comunicação com o servidor Vertex. Verifique a API ou os logs da Vercel.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Refatorado para chamar o backend para execução final
  const handleRunPrompt = async () => {
    if (!apiKey) {
      setError("Por favor, configure sua API Key para continuar.");
      return;
    }

    if (!generatedPrompt) return;

    setIsExecuting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/vertex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          apiKey,
          prompt: generatedPrompt
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      const result = data.result;

      setFinalResult(result);

      if (currentHistoryId) {
        setHistory(prev => prev.map(item => 
          item.id === currentHistoryId 
            ? { ...item, finalResult: result }
            : item
        ));
      }

    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao executar o prompt final no servidor.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setUserIdea(item.idea.replace(/ \[\d+ arquivo\(s\)\]$/, ''));
    setSelectedStyle(item.style);
    setCreativity(item.creativity);
    setGeneratedPrompt(item.generatedPrompt);
    setFinalResult(item.finalResult || '');
    setCurrentHistoryId(item.id);
    setAttachments([]);
    setError(null);
    setToastMessage("Projeto carregado do histórico");
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    if (currentHistoryId === id) {
      setCurrentHistoryId(null);
      setGeneratedPrompt('');
      setFinalResult('');
      setUserIdea('');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-900 text-slate-300 font-sans selection:bg-vertex-500/30 selection:text-vertex-200 overflow-hidden relative">
      
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-2xl border border-vertex-500/30 flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-vertex-400" />
            {toastMessage}
          </div>
        </div>
      )}

      <div className="w-full lg:w-5/12 xl:w-1/3 bg-slate-900 border-r border-slate-800 flex flex-col h-auto lg:h-full lg:overflow-hidden">
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar flex flex-col">
          <Header 
            onNewProject={handleNewProject} 
            apiKey={apiKey}
            setApiKey={handleSetApiKey}
          />
          
          <div className="mt-8 flex-1">
            <PromptForm 
              userIdea={userIdea}
              setUserIdea={setUserIdea}
              selectedStyle={selectedStyle}
              setSelectedStyle={setSelectedStyle}
              creativity={creativity}
              setCreativity={setCreativity}
              onGenerate={handleGenerate}
              isLoading={isGenerating || isExecuting}
              attachments={attachments}
              setAttachments={setAttachments}
            />

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-200 text-sm animate-fadeIn">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <HistoryList 
              history={history}
              currentId={currentHistoryId}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
            />

            {history.length === 0 && (
              <div className="mt-12 pt-8 border-t border-slate-800/50">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Como funciona</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-2">
                  1. Configure sua API Key no painel (processada de forma segura no backend).
                </p>
                <p className="text-sm text-slate-500 leading-relaxed mb-2">
                  2. Digite sua ideia (ou anexe uma imagem) e clique em "Gerar Super Prompt".
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  3. Revise o prompt gerado no painel à direita e clique no botão Play para executar.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <span>Desenvolvido por</span>
              <span className="text-slate-400 font-medium">Alessandro Oliveira</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-vertex-400 uppercase bg-vertex-900/30 px-2 py-0.5 rounded">
                1007 STUDIOS
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-7/12 xl:w-2/3 bg-slate-950 flex flex-col h-[600px] lg:h-full relative overflow-hidden border-t lg:border-t-0 border-slate-800">
        <PromptResult 
          prompt={generatedPrompt} 
          isGenerating={isGenerating}
          finalResult={finalResult}
          isExecuting={isExecuting}
          onRun={handleRunPrompt}
        />
      </div>

    </div>
  );
}
       
