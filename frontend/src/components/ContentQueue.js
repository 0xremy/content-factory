import React, { useEffect, useState } from 'react';
import { Search, LayoutGrid, List, Check, RotateCcw, Ban, Trash2, CheckSquare, Square, X, RefreshCcw } from 'lucide-react';
import usePostStore from '../store/usePostStore';
import StatusBadge from './StatusBadge';
import ConfirmModal from './ConfirmModal';

const ContentQueue = () => {
  const { posts, loading, error, filters, statusCounts, setFilter, fetchPosts, selectPost, approvePost, rejectPost, redoPost, deletePost, moveToReview } = usePostStore();
  const [viewMode, setViewMode] = React.useState('grid');
  const [searchInput, setSearchInput] = React.useState('');

  // Bulk-selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, label: '' });

  useEffect(() => {
    fetchPosts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear selection whenever the posts list changes (after bulk action)
  useEffect(() => {
    setSelectedIds([]);
  }, [posts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search', searchInput);
  };

  // Remove 'draft' from status tabs
  const statuses = ['', 'review', 'approved', 'redo', 'published', 'rejected'];
  const statusLabels = { '': 'All', review: 'Review', approved: 'Approved', redo: 'Redo', published: 'Published', rejected: 'Rejected' };

  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  // ─── Bulk-select helpers ─────────────────────────────────────────────────
  const isSelected = (id) => selectedIds.includes(id);

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map((p) => p._id));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  // Kick off a bulk action (with confirm for destructive ones)
  const handleBulkActionClick = (action) => {
    const labels = { approve: 'Approve', redo: 'Redo', reject: 'Reject', delete: 'Delete' };
    if (action === 'delete') {
      setConfirmModal({ isOpen: true, action, label: labels[action] });
    } else {
      executeBulkAction(action);
    }
  };

  const executeBulkAction = async (action) => {
    setBulkActionLoading(action);
    try {
      await Promise.all(
        selectedIds.map((id) => {
          if (action === 'approve') return approvePost(id);
          if (action === 'redo') return redoPost(id);
          if (action === 'reject') return rejectPost(id);
          if (action === 'delete') return deletePost(id);
          if (action === 'moveToReview') return moveToReview(id);
          return Promise.resolve();
        })
      );
    } catch (err) {
      console.error('Bulk action error:', err);
    }
    setBulkActionLoading('');
    setSelectedIds([]);
    fetchPosts();
  };

  const handleConfirmBulk = async () => {
    const action = confirmModal.action;
    setConfirmModal({ isOpen: false, action: null, label: '' });
    await executeBulkAction(action);
  };

  const allSelected = posts.length > 0 && selectedIds.length === posts.length;
  const someSelected = selectedIds.length > 0;

  // Show "Move to Review" only when at least one selected post is approved/published/rejected
  const selectedPosts = posts.filter((p) => selectedIds.includes(p._id));
  const canMoveToReview = selectedPosts.some((p) =>
    ['approved', 'published', 'rejected'].includes(p.status)
  );

  return (
    <div className="space-y-6">
      {/* Top Bar: Search + View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts..."
            className="input-field pl-11 text-sm py-2.5"
          />
        </form>
        <div className="flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-1 bg-dark-800 rounded-xl p-1 border border-dark-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-dark-700 text-white' : 'text-dark-500 hover:text-dark-300'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-dark-700 text-white' : 'text-dark-500 hover:text-dark-300'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statuses.map((s) => {
          const count = s === '' ? totalCount : (statusCounts[s] || 0);
          const isActive = filters.status === s;
          return (
            <button
              key={s}
              onClick={() => setFilter('status', s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-dark-700 text-white border border-dark-600'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 border border-transparent'
              }`}
            >
              {statusLabels[s]}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${isActive ? 'bg-dark-600 text-dark-200' : 'bg-dark-800 text-dark-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Bulk Action Bar ─────────────────────────────────── */}
      {someSelected && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-dark-800/70 border border-dark-700/50 rounded-2xl animate-fade-in">
          {/* Selection info */}
          <span className="text-sm font-semibold text-white">
            {selectedIds.length} selected
          </span>

          {/* Divider */}
          <div className="w-px h-5 bg-dark-600" />

          {/* Approve */}
          <button
            onClick={() => handleBulkActionClick('approve')}
            disabled={!!bulkActionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all disabled:opacity-40"
          >
            <Check size={13} />
            {bulkActionLoading === 'approve' ? 'Processing…' : 'Approve'}
          </button>

          {/* Redo */}
          <button
            onClick={() => handleBulkActionClick('redo')}
            disabled={!!bulkActionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white rounded-xl transition-all disabled:opacity-40"
          >
            <RotateCcw size={13} />
            {bulkActionLoading === 'redo' ? 'Processing…' : 'Redo'}
          </button>

          {/* Reject */}
          <button
            onClick={() => handleBulkActionClick('reject')}
            disabled={!!bulkActionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all disabled:opacity-40"
          >
            <Ban size={13} />
            {bulkActionLoading === 'reject' ? 'Processing…' : 'Reject'}
          </button>

          {/* Delete */}
          <button
            onClick={() => handleBulkActionClick('delete')}
            disabled={!!bulkActionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-900/30 text-red-500 hover:bg-red-700 hover:text-white rounded-xl transition-all disabled:opacity-40"
          >
            <Trash2 size={13} />
            {bulkActionLoading === 'delete' ? 'Deleting…' : 'Delete'}
          </button>

          {/* Move to Review (only when applicable statuses are selected) */}
          {canMoveToReview && (
            <>
              <div className="w-px h-5 bg-dark-600" />
              <button
                onClick={() => handleBulkActionClick('moveToReview')}
                disabled={!!bulkActionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white rounded-xl transition-all disabled:opacity-40"
              >
                <RefreshCcw size={13} />
                {bulkActionLoading === 'moveToReview' ? 'Moving…' : 'Move to Review'}
              </button>
            </>
          )}

          {/* Spacer + Clear */}
          <button
            onClick={clearSelection}
            className="ml-auto flex items-center gap-1 text-xs text-dark-400 hover:text-white transition-colors"
          >
            <X size={13} /> Clear
          </button>
        </div>
      )}

      {/* Loading / Error / Empty */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-dark-600 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-400">
          <p className="text-sm">Error: {error}</p>
          <button onClick={fetchPosts} className="btn-primary text-sm mt-4">Retry</button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-20 text-dark-500">
          <p className="text-lg font-medium mb-1">No posts found</p>
          <p className="text-sm">Try changing the filter or search terms.</p>
        </div>
      )}

      {/* Post Grid/List */}
      {!loading && !error && posts.length > 0 && (
        <>
          {/* Select-All row */}
          <div className="flex items-center gap-2 px-1">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs text-dark-400 hover:text-white transition-colors"
            >
              {allSelected
                ? <CheckSquare size={15} className="text-blue-400" />
                : <Square size={15} />
              }
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
            : 'space-y-3'
          }>
            {posts.map((post) => {
              const selected = isSelected(post._id);
              return (
                <div
                  key={post._id}
                  onClick={() => {
                    // If any items selected, clicking card toggles select instead of opening
                    if (someSelected) {
                      setSelectedIds((prev) =>
                        prev.includes(post._id)
                          ? prev.filter((x) => x !== post._id)
                          : [...prev, post._id]
                      );
                    } else {
                      selectPost(post._id);
                    }
                  }}
                  className={`glass-card-hover p-5 cursor-pointer group relative transition-all ${
                    selected ? 'ring-2 ring-blue-500/60 bg-blue-500/5' : ''
                  }`}
                >
                  {/* Checkbox overlay */}
                  <button
                    onClick={(e) => toggleSelect(e, post._id)}
                    className={`absolute top-3 left-3 z-10 transition-all ${
                      selected || someSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title={selected ? 'Deselect' : 'Select'}
                  >
                    {selected
                      ? <CheckSquare size={17} className="text-blue-400 drop-shadow" />
                      : <Square size={17} className="text-dark-500" />
                    }
                  </button>

                  <div className={`flex items-start justify-between gap-3 mb-3 ${someSelected || selected ? 'pl-6' : ''} transition-all`}>
                    <h3 className="font-semibold text-dark-100 text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
                      {post.title}
                    </h3>
                    <StatusBadge status={post.status} />
                  </div>

                  <p className={`text-dark-400 text-xs leading-relaxed line-clamp-2 mb-4 ${someSelected || selected ? 'pl-6' : ''} transition-all`}>
                    {(post.thread || post.content || [])[0] || 'No content'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-dark-500">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-3">
                      {post.comments?.length > 0 && (
                        <span className="text-amber-400/70">💬 {post.comments.length}</span>
                      )}
                      <span className="font-mono text-dark-600">v{post.version || 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={`Delete ${selectedIds.length} post${selectedIds.length !== 1 ? 's' : ''}?`}
        message="This action cannot be undone. All selected posts will be permanently deleted."
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmBulk}
        onCancel={() => setConfirmModal({ isOpen: false, action: null, label: '' })}
      />
    </div>
  );
};

export default ContentQueue;