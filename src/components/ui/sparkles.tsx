"use client";

import React, { useEffect, useState, useRef } from "react";
import { useWindowSize } from "@/lib/hooks/use-window-size";
import { cn } from "@/lib/utils";

export interface SparkleProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
}

export function SparklesCore({
  id,
  className,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  speed = 1,
  particleColor = "#fff",
  particleDensity = 100,
}: SparkleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useWindowSize();
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      setContext(ctx);
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (context && width && height) {
      initParticles();
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [context, width, height]);

  class Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    opacity: number;
    fadeDirection: 'in' | 'out';

    constructor() {
      this.x = Math.random() * (width || 0);
      this.y = Math.random() * (height || 0);
      this.size = (Math.random() * (maxSize - minSize) + minSize);
      this.speedX = (Math.random() - 0.5) * 0.2 * speed;
      this.speedY = (Math.random() - 0.5) * 0.2 * speed;
      this.color = particleColor;
      this.opacity = Math.random();
      this.fadeDirection = Math.random() > 0.5 ? 'in' : 'out';
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Fade effect
      if (this.fadeDirection === 'in') {
        this.opacity += 0.005 * speed;
        if (this.opacity >= 1) {
          this.opacity = 1;
          this.fadeDirection = 'out';
        }
      } else {
        this.opacity -= 0.005 * speed;
        if (this.opacity <= 0) {
          this.opacity = 0;
          this.fadeDirection = 'in';
        }
      }

      // Boundary check
      if (this.x < 0 || this.x > (width || 0)) {
        this.speedX = -this.speedX;
      }
      if (this.y < 0 || this.y > (height || 0)) {
        this.speedY = -this.speedY;
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  const initParticles = () => {
    const particleCount = Math.min(
      particleDensity,
      Math.floor(((width || 0) * (height || 0)) / 10000)
    );
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push(new Particle());
    }

    setParticles(newParticles);
  };

  const animate = () => {
    if (context && width && height) {
      context.clearRect(0, 0, width, height);
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw(context);
      });
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  return (
    <canvas
      id={id}
      ref={canvasRef}
      width={width}
      height={height}
      className={cn("", className)}
    />
  );
}
