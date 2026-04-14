import React from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import API from '../api';

const PostList = ({ posts, onUpdate }) => {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/posts/${id}`);
      onUpdate();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">All Content</h2>
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">Title</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Metrics (I/L/C)</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-sm">{post.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    post.status === 'published' ? 'bg-green-100 text-green-700' : 
                    post.status === 'reviewed' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="p-4 text-sm font-mono">
                  {post.metrics.impressions} / {post.metrics.likes} / {post.metrics.comments}
                </td>
                <td className="p-4 flex space-x-3">
                  {post.x_post_id && (
                    <a href={`https://x.com/i/status/${post.x_post_id}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700">
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button onClick={() => handleDelete(post._id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostList;
