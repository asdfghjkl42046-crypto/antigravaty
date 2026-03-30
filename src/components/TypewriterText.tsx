import React, { useState, useEffect } from 'react';

interface Props {
  text: string;
  speed?: number; // 每個字的間隔毫秒
  lineDelay?: number; // 換行時的停頓毫秒
  className?: string;
  onComplete?: () => void; // 全部顯示完成的回調
}

export default function TypewriterText({ text, speed = 40, lineDelay = 400, className, onComplete }: Props) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let currentIndex = 0;
    let isPaused = false;
    let timerId: NodeJS.Timeout;

    const tick = () => {
      if (currentIndex >= text.length) {
        if (onComplete) onComplete();
        return;
      }

      if (!isPaused) {
        const char = text[currentIndex];
        setDisplayedText((prev) => prev + char);
        currentIndex++;

        // 若遇到換行符號，製造較長的停頓感（一行顯示完再下一行）
        if (char === '\n') {
          isPaused = true;
          timerId = setTimeout(() => {
            isPaused = false;
            // 停頓結束後，繼續下一個字
            timerId = setTimeout(tick, speed);
          }, lineDelay);
          return;
        }

        timerId = setTimeout(tick, speed);
      }
    };

    timerId = setTimeout(tick, speed);

    return () => clearTimeout(timerId);
  }, [text, speed, lineDelay, onComplete]);

  return <span className={className}>{displayedText}</span>;
}
