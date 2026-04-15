import React, { useState, useCallback } from 'react';
import { MessageSquare, Heart, Repeat2, User } from 'lucide-react';

const ThreadDisplay = ({ thread = [], onHighlightComment }) => {
  const [selectedText, setSelectedText] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ top: 0, left: 0 });

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      setSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setCommentPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
      setShowCommentBox(true);
    } else {
      // Don't hide immediately — let the user interact with the box
    }
  }, []);

  const handleSubmitComment = () => {
    if (commentInput.trim() && selectedText) {
      onHighlightComment(commentInput.trim(), selectedText);
      setCommentInput('');
      setSelectedText('');
      setShowCommentBox(false);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleCancelComment = () => {
    setShowCommentBox(false);
    setSelectedText('');
    setCommentInput('');
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="relative" onMouseUp={handleMouseUp}>
      {/* Thread Timeline */}
      <div className="space-y-0 border-l-2 border-dark-700/50 ml-5 pl-8">
        {thread.map((text, index) => (
          <div key={index} className="relative mb-6 last:mb-0">
            {/* Timeline dot */}
            <div className="absolute -left-[2.35rem] top-4 w-3 h-3 bg-dark-700 rounded-full border-2 border-dark-900 z-10" />

            <div className="bg-dark-800/40 border border-dark-700/30 rounded-2xl p-5 hover:border-dark-600/50 transition-all duration-200">
              {/* Tweet Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  <User size={16} />
                </div>
                <div>
                  <div className="font-bold text-dark-100 text-sm leading-tight">Content Factory</div>
                  <div className="text-dark-500 text-xs">Tweet {index + 1} of {thread.length}</div>
                </div>
              </div>

              {/* Tweet Body — selectable text */}
              <div className="text-dark-200 whitespace-pre-wrap leading-relaxed text-[15px] select-text cursor-text mb-4">
                {text}
              </div>

              {/* Tweet Footer */}
              <div className="flex items-center gap-6 text-dark-500 border-t border-dark-700/30 pt-3">
                <div className="flex items-center gap-1.5 text-xs hover:text-blue-400 cursor-pointer transition-colors">
                  <MessageSquare size={14} /> <span>0</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs hover:text-emerald-400 cursor-pointer transition-colors">
                  <Repeat2 size={14} /> <span>0</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs hover:text-red-400 cursor-pointer transition-colors">
                  <Heart size={14} /> <span>0</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Comment Box on Text Selection */}
      {showCommentBox && (
        <div
          className="fixed z-50 animate-scale-in"
          style={{ top: commentPosition.top, left: Math.min(commentPosition.left, window.innerWidth - 340) }}
        >
          <div className="w-80 bg-dark-850 border border-dark-600 rounded-xl shadow-2xl p-4 space-y-3">
            <div className="text-xs text-amber-400 truncate">
              Commenting on: <span className="italic">"{selectedText.slice(0, 60)}{selectedText.length > 60 ? '...' : ''}"</span>
            </div>
            <textarea
              autoFocus
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write your comment..."
              className="input-field text-sm resize-none"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button onClick={handleCancelComment} className="btn-ghost text-xs px-3 py-1.5">
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={!commentInput.trim()}
                className="btn-primary text-xs px-3 py-1.5 disabled:opacity-30"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadDisplay;
