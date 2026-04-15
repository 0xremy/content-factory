import React from 'react';
import { MessageCircle, Clock } from 'lucide-react';

const CommentPanel = ({ comments = [], onAddComment }) => {
  const [text, setText] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(text.trim(), '');
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 text-dark-300 font-semibold text-sm mb-4">
        <MessageCircle size={16} />
        Comments ({comments.length})
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 min-h-0">
        {comments.length === 0 ? (
          <p className="text-xs text-dark-500 italic text-center py-8">
            No comments yet. Highlight text in the thread or use the form below.
          </p>
        ) : (
          comments.map((comment, idx) => (
            <div key={idx} className="bg-dark-800/60 rounded-xl p-3 border border-dark-700/30 animate-fade-in">
              {comment.selection && (
                <div className="text-xs text-amber-400/80 bg-amber-500/10 rounded-lg px-2 py-1 mb-2 border border-amber-500/20 italic truncate">
                  "{comment.selection}"
                </div>
              )}
              <p className="text-sm text-dark-200 leading-relaxed">{comment.text}</p>
              <div className="flex items-center gap-1 text-dark-500 text-xs mt-2">
                <Clock size={10} />
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="input-field text-sm flex-1"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn-primary text-sm px-4 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default CommentPanel;
