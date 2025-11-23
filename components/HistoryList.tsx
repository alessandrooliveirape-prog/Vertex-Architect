import React from 'react';
import { HistoryItem, PromptStyle } from '../types';
import { Clock, Trash2, ChevronRight, History } from 'lucide-react';

interface HistoryListProps {
  history: HistoryItem[];
  currentId: string | null;
  onSelect: (item: HistoryItem) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ 
  history, 
  currentId, 
  onSelect, 
  onDelete 
}) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-slate-800/50 animate-fadeIn">
      <div className="flex items-center gap-2 mb-4 text-slate-400">
        <History className="w-4 h-4" />
        <h3 className="text-xs font-semibold uppercase tracking-wider">Histórico Recente</h3>
      </div>
      
      <div className="space-y-3">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className={`
              group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-lg
              ${currentId === item.id 
                ? 'bg-slate-800/80 border-vertex-500/50 shadow-md shadow-vertex-900/10' 
                : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
              }
            `}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate mb-1.5 ${currentId === item.id ? 'text-vertex-200' : 'text-slate-300'}`}>
                  {item.idea}
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-400 border border-slate-600">
                    {Object.entries(PromptStyle).find(([_, v]) => v === item.style)?.[1].split(' ')[0] || 'Geral'}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => onDelete(e, item.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            {/* Active Indicator */}
            {currentId === item.id && (
              <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-vertex-500 rounded-r-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};