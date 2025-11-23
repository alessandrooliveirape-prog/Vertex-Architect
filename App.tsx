import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { PromptResult } from './components/PromptResult';
import { HistoryList } from './components/HistoryList';
import { generateSuperPrompt, executePrompt } from './services/geminiService';
import { PromptStyle, CreativityLevel, HistoryItem, Attachment } from './types';
import { AlertCircle, CheckCircle2, Code2, Heart } from 'lucide-react';

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
    // Reset imediato
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
    
    // Feedback visual
    setToastMessage("Novo projeto iniciado!");
  };

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
    setFinalResult(''); // Reset previous result
    setError(null);
    setGeneratedPrompt('');

    try {
      const result = await generateSuperPrompt(apiKey, userIdea, selectedStyle, creativity, attachments);
      setGeneratedPrompt(result);
      
      // Add to history
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
      setError("Ocorreu um erro ao gerar o prompt. Verifique sua API Key e conexão.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunPrompt = async () => {
    if (!apiKey) {
      setError("Por favor, configure sua API Key para continuar.");
      return;
    }

    if (!generatedPrompt) return;

    setIsExecuting(true);
    setError(null);
    
    try {
      const result = await executePrompt(apiKey, generatedPrompt);
      setFinalResult(result);

      // Update current history item with the result
      if (currentHistoryId) {
        setHistory(prev => prev.map(item => 
          item.id === currentHistoryId 
            ? { ...item, finalResult: result }
            : item
        ));
      }

    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao executar o prompt final. Verifique sua API Key.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setUserIdea(item.idea.replace(/ \[\d+ arquivo\(s\)\]$/, '')); // Remove the suffix hint
    setSelectedStyle(item.style);
    setCreativity(item.creativity);
    setGeneratedPrompt(item.generatedPrompt);
    setFinalResult(item.finalResult || '');
    setCurrentHistoryId(item.id);
    setAttachments([]); // Reset attachments on history load
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
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-2xl border border-vertex-500/30 flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-vertex-400" />
            {toastMessage}
          </div>
        </div>
      )}

      {/* Left Panel: Input & Controls (Scrollable) */}
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

            {/* History List */}
            <HistoryList 
              history={history}
              currentId={currentHistoryId}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
            />

            {/* Helper Text / Tips - Only show if history is empty to save space */}
            {history.length === 0 && (
              <div className="mt-12 pt-8 border-t border-slate-800/50">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Como funciona</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-2">
                  1. Configure sua API Key do Google AI Studio.
                </p>
                <p className="text-sm text-slate-500 leading-relaxed mb-2">
                  2. Digite sua ideia (ou anexe uma imagem) e clique em "Gerar Super Prompt".
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  3. Revise o prompt gerado no painel à direita e clique no botão <span className="inline-block px-1.5 py-0.5 bg-vertex-600/20 text-vertex-300 rounded text-[10px] uppercase font-bold">Play</span> para executar.
                </p>
              </div>
            )}
          </div>

          {/* Credits Footer */}
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

      {/* Right Panel: Output / Editor View (Scrollable) */}
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