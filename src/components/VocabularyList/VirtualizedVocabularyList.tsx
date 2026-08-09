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

export const VirtualizedVocabularyList: React.FC<Props> = ({ items }) => {
  if (!items || items.length === 0) {
    return <div className="p-10 text-center text-gray-500">Hen�z kelime bulunamad�.</div>;
  }

  // Basit map d�ng�s� (Virtualization kald�r�ld�, build hatas�n� �nlemek i�in)
  // Performans sorunu olursa ilerleme tekrar virtualization eklenecek.
  return (
    <div className="w-full bg-white rounded-[var(--radius-card)] shadow-sm border max-h-[600px] overflow-y-auto">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center p-4 border-b hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">{item.word}</h3>
            <p className="text-gray-600">{item.meaning}</p>
            <p className="text-sm text-gray-400 mt-1 italic">"{item.example}"</p>
          </div>
        </div>
      ))}
    </div>
  );
};
