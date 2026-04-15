import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Ban, Link2, Trash2, Merge, Split, Copy } from 'lucide-react';
import usePostStore from '../store/usePostStore';
import StatusBadge from './StatusBadge';
import ThreadDisplay from './ThreadDisplay';
import CommentPanel from './CommentPanel';
import AnalyticsSummary from './AnalyticsSummary';

const PostModal = () => {
  const { selectedPost, clearSelection, approvePost, rejectPost, redoPost, addComment, markPublished, deletePost } = usePostStore();
  const [publishUrl, setPublishUrl] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [viewMode, setViewMode] = useState('split'); // 'split' or 'merge'
  const [allCopied, setAllCopied] = useState(false);

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedPost]);

  if (!selectedPost) return null;

  const post = selectedPost;
  const thread = post.thread || post.content || [];
  const images = post.images || [];

  const handleAction = async (action, ...args) => {
    setActionLoading(action);
    try {
      switch (action) {
        case 'approve': await approvePost(post._id); break;
        case 'reject': await rejectPost(post._id); break;
        case 'redo': await redoPost(post._id); break;
        case 'delete': await deletePost(post._id); break;
        case 'publish':
          await markPublished(post._id, publishUrl);
          setPublishUrl('');
          break;
        default: break;
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
    setActionLoading('');
  };

  const handleHighlightComment = (text, selection) => {
    addComment(post._id, text, selection);
  };

  const handleCopyAll = async () => {
    const fullText = thread.join('\n\n');
    try {
      await navigator.clipboard.writeText(fullText);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = fullText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={clearSelection} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[92vh] mt-[4vh] mx-4 bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700/50 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <h2 className="text-lg font-bold text-dark-100 truncate">{post.title}</h2>
            <StatusBadge status={post.status} size="lg" />
            <span className="text-xs text-dark-500 font-mono shrink-0">v{post.version}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Merge / Split Toggle */}
            <div className="flex items-center bg-dark-800 rounded-xl p-1 border border-dark-700/50">
              <button
                onClick={() => setViewMode('split')}
                title="Split View — Individual tweets with images"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'split' ? 'bg-dark-700 text-white' : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                <Split size={14} /> Split
              </button>
              <button
                onClick={() => setViewMode('merge')}
                title="Merge View — Single article with first image"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'merge' ? 'bg-dark-700 text-white' : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                <Merge size={14} /> Merge
              </button>
            </div>

            {/* Copy All */}
            <button
              onClick={handleCopyAll}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                allCopied
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-dark-800 text-dark-400 hover:text-white border-dark-700/50 hover:bg-dark-700'
              }`}
            >
              {allCopied ? <Check size={14} /> : <Copy size={14} />}
              {allCopied ? 'Copied!' : 'Copy All'}
            </button>

            <button onClick={clearSelection} className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: Thread */}
          <div className="flex-1 overflow-y-auto p-6">
            <ThreadDisplay
              thread={thread}
              images={images}
              viewMode={viewMode}
              onHighlightComment={handleHighlightComment}
            />
          </div>

          {/* Right: Sidebar */}
          <div className="w-80 border-l border-dark-700/50 flex flex-col overflow-hidden shrink-0">
            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <CommentPanel
                comments={post.comments || []}
                onAddComment={(text, sel) => addComment(post._id, text, sel)}
              />
            </div>

            {/* Analytics (published only) */}
            {post.status === 'published' && (
              <div className="p-4 border-t border-dark-700/50">
                <AnalyticsSummary analytics={post.analytics} publishedUrl={post.publishedUrl} />
              </div>
            )}

            {/* Actions */}
            <div className="p-4 border-t border-dark-700/50 space-y-3 shrink-0">
              {/* Review Actions */}
              {post.status === 'review' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading === 'approve'}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white font-semibold rounded-xl transition-all text-sm"
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction('redo')}
                    disabled={actionLoading === 'redo'}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white font-semibold rounded-xl transition-all text-sm"
                  >
                    <RotateCcw size={16} /> Redo
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading === 'reject'}
                    className="flex items-center justify-center px-3 py-2.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                  >
                    <Ban size={16} />
                  </button>
                </div>
              )}

              {/* Approved — Mark Published */}
              {post.status === 'approved' && (
                <div className="space-y-2">
                  <p className="text-xs text-dark-400">Post to X, then paste the URL here:</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={publishUrl}
                      onChange={(e) => setPublishUrl(e.target.value)}
                      placeholder="https://x.com/..."
                      className="input-field text-sm flex-1"
                    />
                    <button
                      onClick={() => handleAction('publish')}
                      disabled={!publishUrl.trim() || actionLoading === 'publish'}
                      className="btn-primary text-sm px-4 flex items-center gap-1.5 disabled:opacity-30"
                    >
                      <Link2 size={14} /> Publish
                    </button>
                  </div>
                </div>
              )}

              {/* Delete (always available) */}
              <button
                onClick={() => { if (window.confirm('Delete this post?')) handleAction('delete'); }}
                className="w-full flex items-center justify-center gap-2 btn-danger text-sm py-2"
              >
                <Trash2 size={14} /> Delete Post
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-dark-700/50 text-xs text-dark-500 shrink-0">
          <span>Created: {new Date(post.createdAt).toLocaleString()}</span>
          <span>Updated: {new Date(post.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
