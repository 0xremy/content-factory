import React, { useEffect } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import usePostStore from '../store/usePostStore';
import StatusBadge from './StatusBadge';

const ContentQueue = () => {
  const { posts, loading, error, filters, statusCounts, setFilter, fetchPosts, selectPost } = usePostStore();
  const [viewMode, setViewMode] = React.useState('grid');
  const [searchInput, setSearchInput] = React.useState('');

  useEffect(() => {
    fetchPosts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search', searchInput);
  };

  const statuses = ['', 'review', 'draft', 'approved', 'redo', 'published', 'rejected'];
  const statusLabels = { '': 'All', review: 'Review', draft: 'Draft', approved: 'Approved', redo: 'Redo', published: 'Published', rejected: 'Rejected' };

  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

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
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
          : 'space-y-3'
        }>
          {posts.map((post) => (
            <div
              key={post._id}
              onClick={() => selectPost(post._id)}
              className="glass-card-hover p-5 cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-dark-100 text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
                  {post.title}
                </h3>
                <StatusBadge status={post.status} />
              </div>

              <p className="text-dark-400 text-xs leading-relaxed line-clamp-2 mb-4">
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentQueue;