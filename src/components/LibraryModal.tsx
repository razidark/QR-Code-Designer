import React from 'react';
import { Bookmark, Heart, Trash2 } from 'lucide-react';
import { QRHistoryItem } from '../types';

interface LibraryModalProps {
  savedName: string;
  setSavedName: (name: string) => void;
  addToLibrary: () => void;
  library: QRHistoryItem[];
  restoreLibraryItem: (item: QRHistoryItem) => void;
  toggleFavoriteItem: (id: string, e: React.MouseEvent) => void;
  deleteLibraryItem: (id: string, e: React.MouseEvent) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  savedName,
  setSavedName,
  addToLibrary,
  library,
  restoreLibraryItem,
  toggleFavoriteItem,
  deleteLibraryItem
}) => {
  return (
    <div className="bg-slate-950/50 backdrop-blur-md rounded-2xl border border-white/5 p-4 sm:p-6 shadow-2xl space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">My Saved Creations</h3>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Give this design a name..."
          value={savedName}
          onChange={(e) => setSavedName(e.target.value)}
          className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans"
        />
        <button
          onClick={addToLibrary}
          className="p-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shrink-0"
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>Save</span>
        </button>
      </div>

      <div className="space-y-2 max-h-[30vh] md:max-h-56 overflow-y-auto pr-1 no-scrollbar pt-1 font-sans">
        {library.length === 0 ? (
          <p className="text-[11px] text-slate-500 py-3 text-center">
            Your design library is currently empty. Set up a QR style and save it for easy access!
          </p>
        ) : (
          library.map((item) => (
            <div
              key={item.id}
              onClick={() => restoreLibraryItem(item)}
              className="flex items-center justify-between p-2.5 bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-slate-800 rounded-xl cursor-pointer group transition-all duration-200"
            >
              <div className="flex items-center gap-2 max-w-[70%]">
                <div 
                  className="w-6 h-6 rounded border border-white/10 shrink-0"
                  style={{
                    background: `linear-gradient(${item.config.style.fgGradient.angle || 45}deg, ${item.config.style.fgGradient.color1}, ${item.config.style.fgGradient.color2 || item.config.style.fgGradient.color1})`
                  }}
                />
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-slate-200 block truncate leading-tight">{item.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono block leading-normal mt-0.5 uppercase">
                    {item.mode} • {item.createdAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => toggleFavoriteItem(item.id, e)}
                  className={`p-1 hover:bg-slate-850 rounded text-slate-400 transition-all cursor-pointer ${item.favorite ? 'text-rose-500 hover:text-rose-400' : 'hover:text-amber-400'}`}
                  title="Favorite"
                >
                  <Heart className={`h-3.5 w-3.5 ${item.favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
                <button
                  onClick={(e) => deleteLibraryItem(item.id, e)}
                  className="p-1 hover:bg-red-950/60 rounded text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
