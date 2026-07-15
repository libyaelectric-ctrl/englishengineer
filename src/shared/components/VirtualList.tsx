import React from 'react';
import { Virtuoso, VirtuosoProps } from 'react-virtuoso';

interface VirtualListProps<T> extends Omit<VirtuosoProps<T, unknown>, 'data'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function VirtualList<T>({
  data,
  renderItem,
  emptyMessage = 'No items found',
  className,
  ...virtuosoProps
}: VirtualListProps<T>) {
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 text-muted-copy ${className ?? ''}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <Virtuoso
      data={data}
      className={className}
      itemContent={(index, item) => renderItem(item, index)}
      {...virtuosoProps}
    />
  );
}

export default VirtualList;
