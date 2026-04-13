import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Save, History, Trash2 } from 'lucide-react';

const PostEditor = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: '',
    content: [],
    status: 'draft',
    tags: [],
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, logsRes] = await Promise.all([
          api.get(`/posts/${postId}`),
          api.get(`/posts/${postId}/logs`),
        ]);
        setPost(postRes.data.data);
        setLogs(logsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  const handleSave = async () => {
    try {
      await api.put(`/posts/${postId}`, post);
      alert('Post updated successfully!');
      // Refresh logs
      const logsRes = await api.get(`/posts/${postId}/logs`);
      setLogs(logsRes.data.data);
    } catch (error) {
      alert('Error saving post: ' + (error.response?.data?.error || error.message));
    }
  };

  const updateContentItem = (index, value) => {
    const newContent = [...post.content];
    newContent[index] = value;
    setPost({ ...post, content: newContent });
  };

  const addContentItem = () => {
    setPost({ ...post, content: [...post.content, ''] });
  };

  const removeContentItem = (index) => {
    const newContent = post.content.filter((_, i) => i !== index);
    setPost({ ...post, content: newContent });
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading editor...</div>;

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Thread Title</label>
            <input 
              type="text" 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
            <select 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={post.status}
              onChange={(e) => setPost({ ...post, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="queued">Queued</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-700">Thread Content</label>
              <button 
                onClick={addContentItem}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold transition-colors"
              >
                + Add Post
              </button>
            </div>
            <div className="space-y-3">
              {post.content.map((text, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <textarea 
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      rows="3"
                      value={text}
                      onChange={(e) => updateContentItem(index, e.target.value)}
                    />
                    <div className="text-right text-[10px] text-slate-400 mt-1">
                      {text.length}/280 chars
                    </div>
                  </div>
                  <button 
                    onClick={() => removeContentItem(index)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
            <History size={20} />
            Edit History
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No edits recorded yet.</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-slate-600">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="text-green-600 font-bold uppercase">{log.status}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-slate-400 line-through truncate">
                      {log.oldContent?.[0] || 'Empty'}
                    </div>
                    <div className="text-slate-800 font-medium truncate">
                      {log.newContent?.[0] || 'Empty'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
