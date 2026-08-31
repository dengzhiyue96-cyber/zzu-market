import React, { useEffect, useState } from 'react';

/**
 * ZZU二手市场 启动页（每次进入网站展示2.4秒，只展示一次）
 */
const SplashScreen: React.FC = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="splash-screen">
      <div className="splash-ring" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
      <div className="splash-ring" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', animationDelay: '0.7s' }} />

      <div className="splash-logo">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="s-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F1D48A" />
              <stop offset="100%" stopColor="#C9A658" />
            </linearGradient>
          </defs>
          <path
            d="M18 22 L46 22 L30 40 L46 40 L18 42 L34 24 L18 24 Z"
            fill="url(#s-gold)"
          />
        </svg>
      </div>

      <div className="splash-title">ZZU二手市场</div>
      <div className="splash-sub">校 内 直 连 · 放 心 交 易</div>
      <div className="splash-tag">ZZU · 郑大同学专属</div>
    </div>
  );
};

export default SplashScreen;
