import React, { useState, useEffect } from 'react';
import api from '../api';

const ContentQueue = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🚀 Fetching posts from /posts...');
      const response = await api.get('/posts');
      
      // Logic phòng thủ: Tự động nhận diện cấu trúc dữ liệu
      let fetchedPosts = [];
      if (Array.isArray(response.data)) {
        fetchedPosts = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        fetchedPosts = response.data.data;
      } else {
        console.error('Unexpected API response structure:', response.data);
        throw new Error('Invalid data format received from server');
      }

      console.log('✅ Successfully fetched posts:', fetchedPosts);
      
      // Lọc các bài chưa xuất bản
      const filteredPosts = fetchedPosts.filter(p => p.status !== 'published');
      setPosts(filteredPosts);
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading content queue...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (posts.length === 0) return <div className="p-4 text-center">Queue is empty. No pending posts found.</div>;

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold mb-4">Content Review Queue</h2>
      {posts.map(post => (
        <div key={post._id} className="p-4 border rounded shadow-sm bg-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">{post.title}</h3>
            <span className="px-2 py-1 text-xs rounded bg-gray-200">{post.status}</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-3">
            {Array.isArray(post.content) ? post.content[0] : post.content || 'No content available'}
          </p>
          <div className="mt-3 flex justify-end">
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              Review
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentQueue;