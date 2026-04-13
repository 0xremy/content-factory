import React, { useState, useEffect } from 'react';
import api from '../api';
import { Calendar, MoreVertical, Play, Eye, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContentQueue = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data.data.filter(p => p.status !== 'published'));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (postId) => {
    try {
      await api.post(`/posts/${postId}/publish`);
      alert('Publishing started!');
      fetchPosts();
    } catch (error) {
      alert('Failed to publish: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading queue...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Content Queue</h2>
          <p className="text-slate-500">Manage your pending X threads</p>
        </div>
        <button 
          onClick={() => navigate('/publish')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          + New Thread
        </button>
      </div>

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-800">Queue is empty</h3>
            <p className="text-slate-500 mb-6">Start creating high-impact threads to grow your brand.</p>
            <button 
              onClick={() => navigate('/publish')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Create your first thread &rarr;
            </button>
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${post.status === 'queued' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                  {post.status === 'queued' ? <Clock size={20} /> : <Eye size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{post.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'Not scheduled'}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-full uppercase font-bold">{post.status}</span>
                    <span>{post.content.length} posts</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button 
                  onClick={() => navigate(`/preview/${post._id}`)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Preview Thread"
                >
                  <Eye size={20} />
                </button>
                <button 
                  onClick={() => handlePublish(post._id)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Play size={16} />
                  Publish Now
                </button>
                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContentQueue;
