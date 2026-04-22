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
      <div className="relative w-full lg:max-w-5xl h-full lg:h-auto lg:max-h-[92vh] lg:mt-[4vh] lg:mx-4 bg-dark-900 border-x lg:border border-dark-700/50 lg:rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-5 border-b border-dark-700/50 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-base lg:text-lg font-bold text-dark-100 break-words line-clamp-2 sm:line-clamp-1">{post.title}</h2>
            <div className="shrink-0">
              <StatusBadge status={post.status} size="sm" />
            </div>
            <span className="hidden md:inline text-xs text-dark-500 font-mono shrink-0">v{post.version}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {/* Merge / Split Toggle - Simplified for mobile */}
              <div className="flex items-center bg-dark-800 rounded-xl p-1 border border-dark-700/50">
              <button
                onClick={() => setViewMode('split')}
                title="Split View"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'split' ? 'bg-dark-700 text-white' : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                <Split size={14} />
              </button>
              <button
                onClick={() => setViewMode('merge')}
                title="Merge View"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'merge' ? 'bg-dark-700 text-white' : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                <Merge size={14} />
              </button>
            </div>

            <button onClick={clearSelection} className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          {/* Left: Thread */}
          <div className="flex-1 lg:overflow-y-auto p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-dark-700/50">
            <ThreadDisplay
              thread={thread}
              images={images}
              viewMode={viewMode}
              onHighlightComment={handleHighlightComment}
            />
          </div>

          {/* Right: Sidebar */}
          <div className="w-full lg:w-80 flex flex-col shrink-0">
            {/* Comments - Only show if not approved/published/rejected */}
            {!['approved', 'published', 'rejected'].includes(post.status) && (
              <div className="lg:flex-1 lg:overflow-y-auto p-4 min-h-[300px] lg:min-h-0">
                <CommentPanel
                  comments={post.comments || []}
                  onAddComment={(text, sel) => addComment(post._id, text, sel)}
                />
              </div>
            )}

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
