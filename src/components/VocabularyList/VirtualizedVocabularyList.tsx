import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';

import React from 'react';

interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  example: string;
}

interface Props {
  items: VocabularyItem[];
}

const Row = ({ index, style, data }: any) => {
  const item = data.items[index];
  return (
    <div
      style={style}
      className="flex items-center p-4 border-b hover:bg-gray-50 transition-colors"
    >
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-800">{item.word}</h3>
        <p className="text-gray-600">{item.meaning}</p>
        <p className="text-sm text-gray-400 mt-1 italic">{item.example}</p>
      </div>
    </div>
  );
};

export const VirtualizedVocabularyList: React.FC<Props> = ({ items }) => {
  return (
    <div className="h-[600px] w-full bg-white rounded-lg shadow-sm border">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={100}
            itemData={{ items }}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};
