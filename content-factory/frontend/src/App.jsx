import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ReviewQueue from './components/ReviewQueue';
import PostList from './components/PostList';
import API from './api';
import { LayoutDashboard, PenTool, History } from 'lucide-react';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold flex items-center space-x-2">
          <span className="text-blue-400">🜂</span>
          <span>Content Factory</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')} 
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setView('review')} 
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${view === 'review' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <PenTool size={20} />
            <span>Review Queue</span>
          </button>
          <button 
            onClick={() => setView('history')} 
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${view === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <History size={20} />
            <span>History</span>
          </button>
        </nav>
        <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
          Built for PROFESOR
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {view === 'dashboard' && (
            <>
              <h1 className="text-3xl font-bold mb-8">Overview</h1>
              <Dashboard posts={posts} />
              <PostList posts={posts} onUpdate={fetchPosts} />
            </>
          )}
          {view === 'review' && (
            <>
              <h1 className="text-3xl font-bold mb-8">Publishing Flow</h1>
              <ReviewQueue posts={posts} onUpdate={fetchPosts} />
            </>
          )}
          {view === 'history' && (
            <>
              <h1 className="text-3xl font-bold mb-8">Content Archive</h1>
              <PostList posts={posts} onUpdate={fetchPosts} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
