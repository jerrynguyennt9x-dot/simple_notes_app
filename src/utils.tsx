import React from 'react';

// Hàm để hiển thị hashtags với màu khác
export function formatContentWithHashtags(content: string, onHashtagClick?: (hashtag: string) => void) {
  if (!content) return null;
  
  // Tách nội dung thành các phần dựa trên hashtag
  const parts = content.split(/(#\w+)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      // Nếu là hashtag, hiển thị với màu khác
      return (
        <span 
          key={index} 
          className="text-primary font-medium cursor-pointer hover:underline"
          onClick={() => onHashtagClick?.(part.slice(1))}
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

// Hàm định dạng thời gian
export function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return diffInMinutes < 1 ? "now" : `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`;
  } else if (diffInHours < 24 * 7) {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  } else {
    return date.toLocaleDateString();
  }
}
