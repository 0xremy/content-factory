import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, MessageSquare, Repeat2, Heart, BarChart2 } from 'lucide-react';

const ThreadPreview = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${postId}`);
        setPost(response.data.data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading preview...</div>;
  if (!post) return <div className="text-center p-12">Post not found.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Queue
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 font-medium">Status: {post.status}</span>
          <button 
            onClick={() => {
              // Trigger publish and go back
              api.post(`/posts/${postId}/publish`).then(() => {
                alert('Published!');
                navigate('/');
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            Publish Thread
          </button>
        </div>
      </div>

      <div className="space-y-0 border-l-2 border-slate-200 ml-4 pl-8">
        {post.content.map((text, index) => (
          <div key={index} className="relative mb-8">
            {/* Thread Line Bubble */}
            <div className="absolute -left-10 top-2 w-4 h-4 bg-slate-200 rounded-full border-4 border-white"></div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">P</div>
                <div>
                  <div className="font-bold text-slate-900">PROFESOR</div>
                  <div className="text-slate-500 text-sm">@profesor · {index + 1}/{post.content.length}</div>
                </div>
              </div>
              <div className="text-slate-800 whitespace-pre-wrap leading-relaxed mb-4">
                {text}
              </div>
              <div className="flex items-center justify-between text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer transition-colors">
                    <MessageSquare size={16} />
                    <span className="text-xs">0</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-green-500 cursor-pointer transition-colors">
                    <Repeat2 size={16} />
                    <span className="text-xs">0</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-red-500 cursor-pointer transition-colors">
                    <Heart size={16} />
                    <span className="text-xs">0</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer transition-colors">
                  <BarChart2 size={16} />
                  <span className="text-xs">Stats</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreadPreview;
