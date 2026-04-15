import React from 'react';
import { BarChart3, Eye, Heart, MessageSquare, Repeat2 } from 'lucide-react';

const AnalyticsSummary = ({ analytics, publishedUrl }) => {
  const metrics = [
    { icon: Eye, label: 'Impressions', value: analytics?.impressions || 0, color: 'text-blue-400' },
    { icon: Heart, label: 'Likes', value: analytics?.likes || 0, color: 'text-red-400' },
    { icon: Repeat2, label: 'Retweets', value: analytics?.retweets || 0, color: 'text-emerald-400' },
    { icon: MessageSquare, label: 'Replies', value: analytics?.replies || 0, color: 'text-amber-400' },
  ];

  const hasData = metrics.some(m => m.value > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-dark-300 font-semibold text-sm">
        <BarChart3 size={16} />
        Performance Analytics
      </div>

      {publishedUrl && (
        <a
          href={publishedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-blue-400 hover:text-blue-300 truncate transition-colors"
        >
          🔗 {publishedUrl}
        </a>
      )}

      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-dark-800/60 rounded-xl p-3 border border-dark-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={color} />
              <span className="text-xs text-dark-500 font-medium">{label}</span>
            </div>
            <div className="text-xl font-bold text-dark-100">
              {value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {!hasData && (
        <p className="text-xs text-dark-500 italic text-center py-2">
          Analytics data will be refreshed automatically every 30 minutes.
        </p>
      )}
    </div>
  );
};

export default AnalyticsSummary;
