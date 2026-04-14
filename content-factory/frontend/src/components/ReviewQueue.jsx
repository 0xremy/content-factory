import React, { useState } from 'react';
import API from '../api';
import { Send, CheckCircle } from 'lucide-react';

const ReviewQueue = ({ posts, onUpdate }) => {
  const pendingPosts = posts.filter(p => p.status === 'draft');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState({ en: '', vi: '' });

  const handlePublish = async (id) => {
    try {
      await API.post(`/posts/${id}/publish`);
      onUpdate();
    } catch (err) {
      alert('Publishing failed');
    }
  };

  const handleSave = async (id) => {
    try {
      await API.put(`/posts/${id}`, { 
        content_en: editContent.en, 
        content_vi: editContent.vi 
      });
      setEditingId(null);
      onUpdate();
    } catch (err) {
      alert('Save failed');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Review Queue</h2>
      {pendingPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
          No posts awaiting review.
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingPosts.map(post => (
            <div key={post._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-slate-700">{post.title}</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setEditingId(post._id);
                      setEditContent({ en: post.content_en, vi: post.content_vi });
                    }}
                    className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handlePublish(post._id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded flex items-center space-x-1"
                  >
                    <Send size={14} />
                    <span>Publish</span>
                  </button>
                </div>
              </div>

              {editingId === post._id ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">English</label>
                    <textarea 
                      className="w-full p-2 border rounded mt-1" 
                      value={editContent.en} 
                      onChange={e => setEditContent({...editContent, en: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Vietnamese</label>
                    <textarea 
                      className="w-full p-2 border rounded mt-1" 
                      value={editContent.vi} 
                      onChange={e => setEditContent({...editContent, vi: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleSave(post._id)} className="px-4 py-2 bg-green-600 text-white rounded text-sm">Save</button>
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-200 rounded text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">English</p>
                    <p className="text-sm text-slate-600">{post.content_en}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Vietnamese</p>
                    <p className="text-sm text-slate-600">{post.content_vi}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewQueue;
