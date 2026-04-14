import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, BarChart3, Eye, Heart, Repeat2, MessageCircle } from 'lucide-react';

const AnalyticsView = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get(`/posts/${postId}/analytics`);
        setAnalytics(response.data.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [postId]);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading analytics...</div>;
  if (!analytics) return <div className="text-center p-12">Analytics not available for this post.</div>;

  const { totals, tweets } = analytics;

  const MetricCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 text-white`}>
        <Icon size={24} />
      </div>
      <div className="text-slate-500 text-sm font-medium">{label}</div>
      <div className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Queue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={Eye} label="Impressions" value={totals.impressions} color="bg-blue-500" />
        <MetricCard icon={Heart} label="Likes" value={totals.likes} color="bg-red-500" />
        <MetricCard icon={Repeat2} label="Retweets" value={totals.retweets} color="bg-green-500" />
        <MetricCard icon={MessageCircle} label="Replies" value={totals.replies} color="bg-amber-500" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Tweet Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-3">Tweet ID</th>
                <th className="px-6 py-3">Impressions</th>
                <th className="px-6 py-3">Likes</th>
                <th className="px-6 py-3">Retweets</th>
                <th className="px-6 py-3">Replies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tweets.map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">#{idx + 1} ({t.id.slice(-6)})</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{t.metrics.impression_count || 0}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{t.metrics.like_count || 0}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{t.metrics.retweet_count || 0}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{t.metrics.reply_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
