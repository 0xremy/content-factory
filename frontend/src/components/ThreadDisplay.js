import React, { useState, useCallback } from 'react';
import { MessageSquare, Heart, Repeat2, User, Copy, Check, Download, Image } from 'lucide-react';

const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-dark-700/50 text-dark-400 hover:text-white hover:bg-dark-700 border border-dark-600/30'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : label}
    </button>
  );
};

const ImageDownloadButton = ({ url }) => {
  const handleOpen = (e) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleOpen}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-dark-700/50 text-dark-400 hover:text-white hover:bg-dark-700 border border-dark-600/30 transition-all duration-200"
    >
      <Download size={12} /> <span className="hidden sm:inline">Save</span><span className="sm:hidden">Open</span>
    </button>
  );
};

const ThreadDisplay = ({ thread = [], images = [], viewMode = 'split', onHighlightComment }) => {
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

  // ─── MERGED VIEW: Single article ──────────────────────────────────────
  if (viewMode === 'merge') {
    const mergedText = thread.join('\n\n');
    const firstImage = images.find(img => img && img.trim() !== '');

    return (
      <div className="relative" onMouseUp={handleMouseUp}>
        <div className="bg-dark-800/40 border border-dark-700/30 rounded-2xl p-6 hover:border-dark-600/50 transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                <User size={16} />
              </div>
              <div>
                <div className="font-bold text-dark-100 text-sm">Content Factory</div>
                <div className="text-dark-500 text-xs">Article · {thread.length} tweets merged</div>
              </div>
            </div>
            <CopyButton text={mergedText} label="Copy All" />
          </div>

          {/* Main Image */}
          {firstImage && (
            <div className="mb-4 rounded-xl overflow-hidden border border-dark-700/30 relative group">
              <img src={firstImage} alt="Post" className="w-full max-h-80 object-cover" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageDownloadButton url={firstImage} />
              </div>
            </div>
          )}

          {/* Article Body */}
          <div className="text-dark-200 whitespace-pre-wrap leading-relaxed text-[15px] select-text cursor-text">
            {mergedText}
          </div>
        </div>

        {/* Floating Comment Box */}
        {showCommentBox && (
          <FloatingCommentBox
            commentPosition={commentPosition}
            selectedText={selectedText}
            commentInput={commentInput}
            setCommentInput={setCommentInput}
            onSubmit={handleSubmitComment}
            onCancel={handleCancelComment}
          />
        )}
      </div>
    );
  }

  // ─── SPLIT VIEW: Individual tweets ────────────────────────────────────
  return (
    <div className="relative" onMouseUp={handleMouseUp}>
      <div className="space-y-0 border-l-2 border-dark-700/50 ml-2 sm:ml-5 pl-5 sm:pl-8">
        {thread.map((text, index) => {
          const image = images[index];
          const hasImage = image && image.trim() !== '';

          return (
            <div key={index} className="relative mb-6 last:mb-0">
              {/* Timeline dot */}
              <div className="absolute -left-[1.65rem] sm:-left-[2.35rem] top-4 w-3 h-3 bg-dark-700 rounded-full border-2 border-dark-900 z-10" />

              <div className="bg-dark-800/40 border border-dark-700/30 rounded-2xl p-4 sm:p-5 hover:border-dark-600/50 transition-all duration-200">
                {/* Tweet Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0">
                      <User size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-dark-100 text-xs sm:text-sm leading-tight truncate">Content Factory</div>
                      <div className="text-dark-500 text-[10px] sm:text-xs truncate">Tweet {index + 1} of {thread.length}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {hasImage && <ImageDownloadButton url={image} />}
                    <CopyButton text={text} />
                  </div>
                </div>

                {/* Tweet Body */}
                <div className="text-dark-200 whitespace-pre-wrap leading-relaxed text-sm sm:text-[15px] select-text cursor-text mb-3">
                  {text}
                </div>

                {/* Tweet Image */}
                {hasImage && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-dark-700/30 relative group">
                    <img src={image} alt={`Tweet ${index + 1}`} className="w-full max-h-60 sm:max-h-72 object-cover" />
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                      <CopyButton text={image} label="Copy URL" />
                    </div>
                  </div>
                )}

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
          );
        })}
      </div>

      {/* Floating Comment Box */}
      {showCommentBox && (
        <FloatingCommentBox
          commentPosition={commentPosition}
          selectedText={selectedText}
          commentInput={commentInput}
          setCommentInput={setCommentInput}
          onSubmit={handleSubmitComment}
          onCancel={handleCancelComment}
        />
      )}
    </div>
  );
};

// ─── Floating Comment Box (shared between views) ───────────────────────
const FloatingCommentBox = ({ commentPosition, selectedText, commentInput, setCommentInput, onSubmit, onCancel }) => (
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
        <button onClick={onCancel} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
        <button onClick={onSubmit} disabled={!commentInput.trim()} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-30">
          Add Comment
        </button>
      </div>
    </div>
  </div>
);

export default ThreadDisplay;
