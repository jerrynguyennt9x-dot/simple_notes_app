import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

interface CustomEmojiPickerProps {
  onEmojiClick: (emoji: string) => void;
  onClose: () => void;
}

const emojiCategories = {
  nature: {
    name: "� Hoa lá",
    emojis: [
      // Hoa
      '🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌼', '🌵', '🏵️', '💐',
      '🌱', '🌿', '☘️', '🍀', '🌾', '🌳', '🌲', '🌴', '🎋', '🎍',
      // Lá và cây
      '🍃', '🍂', '🍁', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔',
      '🌕', '🌙', '⭐', '🌟', '✨', '⚡', '🔥', '❄️', '☔', '🌈',
      // Trái cây
      '🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🫒', '🥑',
      // Rau củ
      '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄',
      '🥜', '🌰', '🫘', '🫚', '🫛',
    ]
  },
  faces: {
    name: "😊 Cảm xúc",
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
      '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
      '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😮',
      '😲', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧',
      '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡',
      '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
    ]
  },
  animals: {
    name: "🐾 Động vật",
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨',
      '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊',
      '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉',
      '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪲', '🐛', '🦋', '🐌',
      '🐞', '🐜', '🪰', '🪱', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍',
      '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠',
      '🐟', '🐬', '🐳', '🐋', '�', '🐊', '🐅', '🐆', '�', '🦍',
      '�', '🐘', '�', '�', '🐪', '🐫', '�', '�', '�', '�',
      '🐄', '🐎', '🐖', '🐏', '🐑', '�', '🐐', '�', '🐕', '🐩',
      '🦮', '🐕‍�', '�', '�‍⬛', '�', '�', '�', '�', '�', '🦢',
    ]
  },
  food: {
    name: "🍔 Đồ ăn",
    emojis: [
      '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆',
      '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤',
      '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨',
      '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿',
      '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃',
      '🥤', '🧋', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂',
      '🥃', '🧉', '🧊', '🥄', '🍴', '🥢', '🥣', '🥽', '🍳', '🥞',
      '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🥖', '🍞', '🥨',
      '🥯', '🥐', '🧈', '🥚', '🧀', '🥗', '🥯', '🍄', '🥜', '🫒',
    ]
  },
  travel: {
    name: "🌍 Du lịch",
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
      '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼',
      '🚁', '🛸', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛰️',
      '🚢', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚂', '🚝', '🚄', '🚅',
      '🚆', '🚇', '🚈', '🚉', '🚞', '🚋', '🚃', '🚟', '🚠', '🚡',
      '🎢', '🎡', '🎠', '🏗️', '🌁', '🗼', '🏭', '⛽', '🗿', '⛱️',
      '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🛖',
      '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤',
      '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌',
    ]
  },
  objects: {
    name: "🎯 Đồ vật",
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
      '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
      '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷',
      '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤸', '🤺', '⛹️',
      '🏌️', '🏇', '🧘', '🏄', '🏊', '🚴', '🚵', '🧗', '🤾', '🏃',
      '🚶', '🧎', '🧍', '🤳', '💃', '🕺', '👯', '🕴️', '👥', '👤',
      '📱', '💻', '🖥️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀',
      '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟',
      '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰',
    ]
  },
  symbols: {
    name: "� Ký hiệu",
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
      '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
      '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
      '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️',
      '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
      '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
      '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓',
    ]
  }
};

export function CustomEmojiPicker({ onEmojiClick, onClose }: CustomEmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState('nature');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmojis = searchTerm 
    ? Object.values(emojiCategories)
        .flatMap(category => category.emojis)
        .filter(emoji => {
          // Simple search by category names or common emoji descriptions
          const searchLower = searchTerm.toLowerCase();
          return searchLower === '' || 
                 (selectedCategory === 'nature' && searchLower.includes('hoa')) ||
                 (selectedCategory === 'nature' && searchLower.includes('lá')) ||
                 (selectedCategory === 'faces' && searchLower.includes('mặt')) ||
                 (selectedCategory === 'animals' && searchLower.includes('động vật'));
        })
    : emojiCategories[selectedCategory as keyof typeof emojiCategories].emojis;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Tìm emoji..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        {Object.entries(emojiCategories).map(([key, category]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(key)}
            className="text-xs p-1 h-7"
          >
            {category.name.split(' ')[0]}
          </Button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-8 gap-1 max-h-60 overflow-y-auto">
        {filteredEmojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            onClick={() => onEmojiClick(emoji)}
            className="text-xl p-2 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center h-10 w-10"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Icon phổ biến:</div>
        <div className="flex flex-wrap gap-1">
          {['🌸', '🌺', '🌻', '🌷', '🌹', '🍀', '🌿', '🍃', '❤️', '😊', '👍', '🎉', '✨', '🔥', '💯', '🥰', '😍', '🤩', '😎', '🤔'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onEmojiClick(emoji)}
              className="text-lg p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
