import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Ban, Link2, Trash2, Merge, Split, Copy, RefreshCcw } from 'lucide-react';
import usePostStore from '../store/usePostStore';
import StatusBadge from './StatusBadge';
import ThreadDisplay from './ThreadDisplay';
import CommentPanel from './CommentPanel';
import AnalyticsSummary from './AnalyticsSummary';
import ConfirmModal from './ConfirmModal';

const PostModal = () => {
  const { selectedPost, clearSelection, approvePost, rejectPost, redoPost, addComment, markPublished, deletePost, moveToReview } = usePostStore();
  const [publishUrl, setPublishUrl] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [viewMode, setViewMode] = useState('split'); // 'split' or 'merge'

  const [titleCopied, setTitleCopied] = useState(false);

  // Custom confirm modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null });
  // Custom error modal state
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

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
        case 'moveToReview': await moveToReview(post._id); break;
        case 'publish':
          await markPublished(post._id, publishUrl);
          setPublishUrl('');
          break;
        default: break;
      }
    } catch (err) {
      setErrorModal({ isOpen: true, message: err.response?.data?.message || err.message });
    }
    setActionLoading('');
  };

  const handleDeleteClick = () => {
    setConfirmModal({ isOpen: true, action: 'delete' });
  };

  const handleConfirmDelete = async () => {
    setConfirmModal({ isOpen: false, action: null });
    await handleAction('delete');
  };

  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, action: null });
  };

  const handleHighlightComment = (text, selection) => {
    addComment(post._id, text, selection);
  };

  const handleCopyTitle = async () => {
    try {
      await navigator.clipboard.writeText(post.title);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = post.title;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setTitleCopied(true);
    setTimeout(() => setTitleCopied(false), 2000);
  };



  return (
    <>
      <div className="fixed inset-0 z-40 flex items-start justify-center animate-fade-in">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={clearSelection} />

        {/* Modal */}
        <div className="relative w-full lg:max-w-5xl h-full lg:h-auto lg:max-h-[92vh] lg:mt-[4vh] lg:mx-4 bg-dark-900 border-x lg:border border-dark-700/50 lg:rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">

          {/* Header */}
          <div className="flex flex-col p-4 lg:p-5 border-b border-dark-700/50 shrink-0 gap-4">
            {/* Top Row: Controls (Toggle + Close) */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center bg-dark-800 rounded-xl p-1 border border-dark-700/50 shadow-inner">
                <button
                  onClick={() => setViewMode('split')}
                  title="Split View"
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'split' ? 'bg-dark-700 text-white shadow-lg' : 'text-dark-500 hover:text-dark-300'
                  }`}
                >
                  <Split size={14} /> <span>Split</span>
                </button>
                <button
                  onClick={() => setViewMode('merge')}
                  title="Merge View"
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'merge' ? 'bg-dark-700 text-white shadow-lg' : 'text-dark-500 hover:text-dark-300'
                  }`}
                >
                  <Merge size={14} /> <span>Merge</span>
                </button>
              </div>
              
              <button 
                onClick={clearSelection} 
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-xl transition-all border border-dark-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Bottom Row: Title + Status */}
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl lg:text-2xl font-extrabold text-white break-words line-clamp-2">{post.title}</h2>
                <button 
                  onClick={handleCopyTitle}
                  className={`p-1.5 rounded-lg transition-all shrink-0 ${
                    titleCopied
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                      : 'text-dark-500 hover:text-white hover:bg-dark-800'
                  }`}
                  title="Copy Title"
                >
                  {titleCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={post.status} size="sm" />
                <span className="text-[10px] text-dark-600 font-mono">v{post.version}</span>
              </div>
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

                {/* Approved — Mark Published + Move to Review */}
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
                    <button
                      onClick={() => handleAction('moveToReview')}
                      disabled={actionLoading === 'moveToReview'}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white font-semibold rounded-xl transition-all text-sm"
                    >
                      <RefreshCcw size={15} /> Move back to Review
                    </button>
                  </div>
                )}

                {/* Published — Move to Review */}
                {post.status === 'published' && (
                  <button
                    onClick={() => handleAction('moveToReview')}
                    disabled={actionLoading === 'moveToReview'}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white font-semibold rounded-xl transition-all text-sm"
                  >
                    <RefreshCcw size={15} /> Move back to Review
                  </button>
                )}

                {/* Delete (always available) */}
                <button
                  onClick={handleDeleteClick}
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

      {/* Custom Delete Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Custom Error Modal */}
      <ConfirmModal
        isOpen={errorModal.isOpen}
        title="Error"
        message={errorModal.message}
        confirmLabel="OK"
        variant="info"
        onConfirm={() => setErrorModal({ isOpen: false, message: '' })}
      />
    </>
  );
};

export default PostModal;
