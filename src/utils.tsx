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

// Hàm định dạng thời gian với giờ phút
export function formatTimeWithHours(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  // Nếu trong ngày hôm nay, hiển thị giờ:phút
  if (diffInHours < 24) {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } else {
    // Nếu khác ngày, hiển thị ngày/tháng + giờ:phút
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })}`;
  }
}
