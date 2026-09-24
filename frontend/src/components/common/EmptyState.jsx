import React from 'react';
import { FolderPlus, Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Get started by creating your first record to begin collaborating.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-dashed border-sand-300 p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-6 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-sand-100 border border-sand-200 flex items-center justify-center text-forest-600 mb-4 shadow-subtle">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h4 className="text-base font-semibold text-charcoal-900 mb-1">{title}</h4>
      <p className="text-sm text-sand-600 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={FolderPlus} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
