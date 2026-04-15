import React from 'react';

const STATUS_STYLES = {
  draft:     'bg-gray-500/15 text-gray-400 border-gray-500/30',
  review:    'bg-amber-500/15 text-amber-400 border-amber-500/30',
  approved:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  redo:      'bg-orange-500/15 text-orange-400 border-orange-500/30',
  rejected:  'bg-red-500/15 text-red-400 border-red-500/30',
};

const STATUS_DOTS = {
  draft:     'bg-gray-400',
  review:    'bg-amber-400',
  approved:  'bg-blue-400',
  published: 'bg-emerald-400',
  redo:      'bg-orange-400',
  rejected:  'bg-red-400',
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.draft;
  const dot = STATUS_DOTS[status] || STATUS_DOTS.draft;
  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${style} ${sizeClasses} capitalize`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
