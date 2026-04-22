import React from 'react';
import { Zap } from 'lucide-react';

const Sidebar = ({ onLogout, onClose }) => {
  return (
    <div className="h-screen w-72 lg:w-64 bg-dark-950 flex flex-col border-r border-dark-800/50 shrink-0">
      {/* Brand */}
      <div className="p-6 flex items-center justify-between border-b border-dark-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Zap size={18} />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">ContentOps</span>
            <div className="text-[10px] text-dark-500 font-medium -mt-0.5">Dashboard</div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-dark-500 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-dark-500 uppercase tracking-wider px-3">Workflow</h4>
          <div className="space-y-1 text-xs text-dark-400 px-3">
            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400" /> Review → Admin reviews</p>
            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400" /> Approved → Ready to post</p>
            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400" /> Redo → AI rewrites</p>
            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Published → Tracking</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-dark-500 uppercase tracking-wider px-3">Tips</h4>
          <div className="px-3 text-xs text-dark-500 space-y-2">
            <p>• Highlight text in threads to add inline comments</p>
            <p>• Use status tabs to filter posts</p>
            <p>• Analytics refresh every 30 min</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-800/50">
        <button
          onClick={onLogout}
          className="w-full text-sm text-dark-500 hover:text-red-400 py-2 rounded-xl hover:bg-dark-800/50 transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
