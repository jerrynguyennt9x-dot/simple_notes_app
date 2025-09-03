"use client";

import React from "react";
import { Button } from "./components/ui/button";

export function FeatureShowcase() {
  const [activeDemo, setActiveDemo] = React.useState<number>(0);
  const demoItems = [
    {
      title: "Simple Note Taking",
      content: "Write and organize your notes quickly with our intuitive interface."
    },
    {
      title: "Share with Others",
      content: "Easily share your notes with teammates, friends, or family members."
    },
    {
      title: "Access Anywhere",
      content: "Your notes sync across all devices, so you can access them anytime, anywhere."
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [demoItems.length]);

  return (
    <div className="mt-10 mb-6 max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-white/5 rounded-xl blur-xl"></div>
        <div className="relative backdrop-blur-lg bg-white/10 rounded-xl overflow-hidden border border-white/20 shadow-lg">
          <div className="p-1 bg-black/20 flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div className="ml-2 text-xs text-white/70">Notes App</div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">{demoItems[activeDemo].title}</h3>
              <div className="text-xs px-2 py-1 bg-white/20 text-white/90 rounded-full border border-white/10">
                Demo
              </div>
            </div>
            
            <p className="text-white/80 mb-4">{demoItems[activeDemo].content}</p>
            
            <div className="flex justify-center gap-1 mt-4">
              {demoItems.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === activeDemo ? "bg-white" : "bg-white/30"
                  }`}
                  onClick={() => setActiveDemo(index)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
