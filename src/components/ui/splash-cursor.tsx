"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SplashCursorProps {
  color?: string;
  size?: number;
  className?: string;
}

export function SplashCursor({
  color = "rgba(99, 102, 241, 0.4)",
  size = 400,
  className,
}: SplashCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [idCounter, setIdCounter] = useState(0);

  useEffect(() => {
    // Theo dõi vị trí chuột
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    // Hiệu ứng khi click
    const handleClick = (e: MouseEvent) => {
      const newId = idCounter;
      setIdCounter((prev) => prev + 1);
      
      // Thêm một splash mới tại vị trí click
      setSplashes((prev) => [...prev, { id: newId, x: e.clientX, y: e.clientY }]);
      
      // Xóa splash sau khi animation hoàn thành
      setTimeout(() => {
        setSplashes((prev) => prev.filter((splash) => splash.id !== newId));
      }, 1000);
    };

    // Ẩn cursor khi chuột không di chuyển
    const handleMouseStop = () => {
      setTimeout(() => {
        setIsVisible(false);
      }, 500);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseStop);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseStop);
      document.removeEventListener("click", handleClick);
    };
  }, [idCounter]);

  return (
    <>
      {/* Cursor theo dõi chuột */}
      <div
        className={cn(
          "fixed pointer-events-none z-50 transition-transform duration-300 ease-out",
          className
        )}
        style={{
          left: 0,
          top: 0,
          width: size,
          height: size,
          borderRadius: "50%",
          opacity: isVisible ? 0.15 : 0,
          background: color,
          transform: `translate3d(${position.x - size / 2}px, ${position.y - size / 2}px, 0)`,
          transition: "opacity 150ms ease, transform 150ms ease"
        }}
      />
      
      {/* Hiệu ứng splash khi click */}
      {splashes.map((splash) => (
        <div
          key={splash.id}
          className="fixed pointer-events-none z-50 animate-splash-scale"
          style={{
            left: splash.x - size / 2,
            top: splash.y - size / 2,
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </>
  );
}
