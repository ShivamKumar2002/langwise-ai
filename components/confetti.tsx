'use client';

import { useEffect } from 'react';

export function Confetti() {
  useEffect(() => {
    // Create confetti particles
    const confettiPieces = 50;
    const container = document.getElementById('confetti-container');
    
    if (!container) return;

    for (let i = 0; i < confettiPieces; i++) {
      const confetti = document.createElement('div');
      const size = Math.random() * 6 + 4;
      const delay = Math.random() * 0.5;
      const duration = Math.random() * 2 + 2.5;
      const angle = Math.random() * 360;
      const distance = Math.random() * 100 + 50;

      confetti.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)]};
        border-radius: 50%;
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: -10px;
        animation: fall-${i} ${duration}s ease-in ${delay}s forwards;
        opacity: 0.9;
      `;

      const keyframes = `
        @keyframes fall-${i} {
          to {
            transform: translate(${Math.cos((angle * Math.PI) / 180) * distance}px, 100vh) rotate(${Math.random() * 720}deg);
            opacity: 0;
          }
        }
      `;

      const style = document.createElement('style');
      style.textContent = keyframes;
      document.head.appendChild(style);

      container.appendChild(confetti);
    }

    return () => {
      const style = document.querySelector('style');
      if (style && style.textContent?.includes('fall-')) {
        style.remove();
      }
    };
  }, []);

  return <div id="confetti-container" className="fixed inset-0 pointer-events-none" />;
}
