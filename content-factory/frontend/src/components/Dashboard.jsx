import React from 'react';
import { BarChart, Users, Heart, MessageSquare } from 'lucide-react';

const Dashboard = ({ posts }) => {
  const totals = posts.reduce((acc, post) => {
    acc.impressions += post.metrics.impressions;
    acc.likes += post.metrics.likes;
    acc.comments += post.metrics.comments;
    return acc;
  }, { impressions: 0, likes: 0, comments: 0 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          <BarChart size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Total Impressions</p>
          <p className="text-2xl font-bold">{totals.impressions.toLocaleString()}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-lg">
          <Heart size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Total Likes</p>
          <p className="text-2xl font-bold">{totals.likes.toLocaleString()}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
          <MessageSquare size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Total Comments</p>
          <p className="text-2xl font-bold">{totals.comments.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
