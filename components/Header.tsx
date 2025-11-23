import React, { useState } from 'react';
import { Cpu, PlusCircle, Key, Check, X } from 'lucide-react';

interface HeaderProps {
  onNewProject: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewProject, apiKey, setApiKey }) => {
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState('');

  const handleEditClick = () => {
    setTempKey(apiKey);
    setIsEditingKey(true);
  };

  const handleSaveKey = () => {
    setApiKey(tempKey);
    setIsEditingKey(false);
  };

  const handleCancelKey = () => {
    setIsEditingKey(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-vertex-600 flex items-center justify-center shadow-lg shadow-vertex-600/20 shrink-0">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
              Vertex <span className="text-vertex-400">Architect</span>
            </h1>
            <p className="text-slate-500 text-xs font-medium">Prompt Engineering Studio</p>
          </div>
        </div>
        
        <button 
          type="button"
          onClick={onNewProject}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 active:scale-95 transition-all text-xs font-medium border border-slate-800 hover:border-slate-600"
          title="Novo Projeto (Reset)"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Projeto</span>
        </button>
      </div>

      {/* API Key Section */}
      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2">
        {isEditingKey ? (
          <div className="flex items-center gap-2 animate-fadeIn">
            <input 
              type="password" 
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Cole sua Gemini API Key (AIza...)"
              className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 focus:border-vertex-500 focus:outline-none"
              autoFocus
            />
            <button 
              onClick={handleSaveKey}
              className="p-1.5 bg-vertex-600 text-white rounded hover:bg-vertex-500 transition-colors"
              title="Salvar Key"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleCancelKey}
              className="p-1.5 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
              title="Cancelar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="text-slate-400 font-medium">
                {apiKey ? 'API Key Configurada' : 'API Key Necessária'}
              </span>
            </div>
            <button 
              onClick={handleEditClick}
              className="flex items-center gap-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors border border-slate-700"
            >
              <Key className="w-3 h-3" />
              {apiKey ? 'Alterar' : 'Configurar'}
            </button>
          </div>
        )}
        {!apiKey && !isEditingKey && (
          <div className="mt-2 px-1 pb-1">
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noreferrer"
               className="text-[10px] text-vertex-400 hover:text-vertex-300 underline"
             >
               Obter chave no Google AI Studio
             </a>
          </div>
        )}
      </div>
    </div>
  );
};