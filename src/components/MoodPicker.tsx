import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Heart } from 'lucide-react';

interface MoodPickerProps {
  onMoodSelect: (mood: { emoji: string; name: string }) => void;
  onClose: () => void;
}

const moods = [
  // Cảm xúc tích cực
  { emoji: '😊', name: 'hạnh phúc', category: 'positive' },
  { emoji: '😄', name: 'có phúc', category: 'positive' },
  { emoji: '🥰', name: 'được yêu', category: 'positive' },
  { emoji: '😌', name: 'bình an', category: 'positive' },
  { emoji: '🤗', name: 'ấm áp', category: 'positive' },
  { emoji: '😍', name: 'đang yêu', category: 'positive' },
  { emoji: '🤩', name: 'hào hứng', category: 'positive' },
  { emoji: '😎', name: 'tự tin', category: 'positive' },
  { emoji: '🥳', name: 'vui vẻ', category: 'positive' },
  { emoji: '😇', name: 'thanh thản', category: 'positive' },
  { emoji: '🤤', name: 'thèm ăn', category: 'positive' },
  { emoji: '😋', name: 'ngon miệng', category: 'positive' },
  { emoji: '🤭', name: 'ngại ngùng', category: 'positive' },
  { emoji: '😉', name: 'tinh nghịch', category: 'positive' },
  { emoji: '🙂', name: 'hài lòng', category: 'positive' },

  // Cảm xúc tiêu cực
  { emoji: '😢', name: 'buồn', category: 'negative' },
  { emoji: '😭', name: 'khóc', category: 'negative' },
  { emoji: '😔', name: 'thất vọng', category: 'negative' },
  { emoji: '😞', name: 'chán nản', category: 'negative' },
  { emoji: '😟', name: 'lo lắng', category: 'negative' },
  { emoji: '😕', name: 'buồn bã', category: 'negative' },
  { emoji: '🙁', name: 'không vui', category: 'negative' },
  { emoji: '☹️', name: 'cau có', category: 'negative' },
  { emoji: '😣', name: 'khó chịu', category: 'negative' },
  { emoji: '😖', name: 'bực mình', category: 'negative' },
  { emoji: '😫', name: 'mệt mỏi', category: 'negative' },
  { emoji: '😩', name: 'kiệt sức', category: 'negative' },
  { emoji: '🥺', name: 'cầu xin', category: 'negative' },
  { emoji: '😤', name: 'bực tức', category: 'negative' },
  { emoji: '😠', name: 'tức giận', category: 'negative' },

  // Cảm xúc trung tính
  { emoji: '😐', name: 'bình thường', category: 'neutral' },
  { emoji: '😑', name: 'thờ ơ', category: 'neutral' },
  { emoji: '🤔', name: 'suy nghĩ', category: 'neutral' },
  { emoji: '🤨', name: 'nghi ngờ', category: 'neutral' },
  { emoji: '🧐', name: 'tò mò', category: 'neutral' },
  { emoji: '😶', name: 'im lặng', category: 'neutral' },
  { emoji: '🙄', name: 'chán', category: 'neutral' },
  { emoji: '😬', name: 'ngượng', category: 'neutral' },
  { emoji: '🤐', name: 'giữ bí mật', category: 'neutral' },
  { emoji: '😯', name: 'ngạc nhiên', category: 'neutral' },
  { emoji: '😲', name: 'sốc', category: 'neutral' },
  { emoji: '🥱', name: 'buồn ngủ', category: 'neutral' },
  { emoji: '😴', name: 'ngủ gật', category: 'neutral' },
  { emoji: '🤓', name: 'học hành', category: 'neutral' },
  { emoji: '😷', name: 'ốm', category: 'neutral' },

  // Cảm xúc đặc biệt
  { emoji: '🤯', name: 'tuyệt vời', category: 'special' },
  { emoji: '🥵', name: 'nóng bức', category: 'special' },
  { emoji: '🥶', name: 'lạnh', category: 'special' },
  { emoji: '😱', name: 'hoảng sợ', category: 'special' },
  { emoji: '😨', name: 'sợ hãi', category: 'special' },
  { emoji: '😰', name: 'lo sợ', category: 'special' },
  { emoji: '😥', name: 'thở dài', category: 'special' },
  { emoji: '😓', name: 'mệt nhọc', category: 'special' },
  { emoji: '🤪', name: 'điên cuồng', category: 'special' },
  { emoji: '🤬', name: 'cáu giận', category: 'special' },
  { emoji: '😵', name: 'choáng váng', category: 'special' },
  { emoji: '🤢', name: 'buồn nôn', category: 'special' }
];

const categories = {
  positive: { name: 'Tích cực', color: 'bg-green-100 text-green-700' },
  negative: { name: 'Tiêu cực', color: 'bg-red-100 text-red-700' },
  neutral: { name: 'Trung tính', color: 'bg-gray-100 text-gray-700' },
  special: { name: 'Đặc biệt', color: 'bg-purple-100 text-purple-700' }
};

export function MoodPicker({ onMoodSelect, onClose }: MoodPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('positive');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMoods = moods.filter(mood => {
    const matchesCategory = selectedCategory === 'all' || mood.category === selectedCategory;
    const matchesSearch = searchTerm === '' || mood.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500" />
          Bạn đang cảm thấy thế nào?
        </h3>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Tìm cảm xúc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        <Button
          variant={selectedCategory === 'all' ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className="text-xs p-1 h-7"
        >
          Tất cả
        </Button>
        {Object.entries(categories).map(([key, category]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(key)}
            className="text-xs p-1 h-7"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Mood Grid */}
      <div className="max-h-60 overflow-y-auto">
        <div className="grid grid-cols-1 gap-1">
          {filteredMoods.map((mood, index) => (
            <button
              key={`${mood.emoji}-${index}`}
              onClick={() => onMoodSelect(mood)}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors text-left w-full"
            >
              <span className="text-xl">{mood.emoji}</span>
              <span className="text-sm text-gray-700">{mood.name}</span>
              <span className={`ml-auto text-xs px-2 py-1 rounded-full ${categories[mood.category as keyof typeof categories].color}`}>
                {categories[mood.category as keyof typeof categories].name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Moods */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Cảm xúc phổ biến:</div>
        <div className="flex flex-wrap gap-1">
          {[
            { emoji: '😊', name: 'vui' },
            { emoji: '😢', name: 'buồn' },
            { emoji: '😍', name: 'yêu' },
            { emoji: '😴', name: 'mệt' },
            { emoji: '🤔', name: 'nghĩ' },
            { emoji: '😤', name: 'tức' },
            { emoji: '🥰', name: 'hạnh phúc' },
            { emoji: '😰', name: 'lo' }
          ].map((mood) => (
            <button
              key={mood.emoji}
              onClick={() => onMoodSelect(mood)}
              className="text-lg p-1 hover:bg-gray-100 rounded transition-colors"
              title={mood.name}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
