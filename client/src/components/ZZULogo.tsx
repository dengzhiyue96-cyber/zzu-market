import React from 'react';

/**
 * 郑大二手市场 官方 Logo（SVG，纯代码矢量，无需图片）
 * 风格：郑大紫 + 金色点缀 + 书本/盾牌造型
 */

type Props = {
  size?: number;          // 整体尺寸（px）
  withText?: boolean;     // 是否显示右侧文字
  className?: string;
};

const ZZULogo: React.FC<Props> = ({ size = 40, withText = false, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="郑大二手市场 Logo"
      >
        {/* 外框圆角盾牌 */}
        <defs>
          <linearGradient id="bg-zzu" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#6A3A91" />
            <stop offset="60%"  stopColor="#8B4FBD" />
            <stop offset="100%" stopColor="#522B75" />
          </linearGradient>
          <linearGradient id="gold-zzu" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E6C07A" />
            <stop offset="100%" stopColor="#C9A658" />
          </linearGradient>
        </defs>
        <rect
          x="2" y="2" width="60" height="60" rx="16"
          fill="url(#bg-zzu)"
          stroke="rgba(201,166,88,0.55)"
          strokeWidth="1.5"
        />

        {/* 顶部「郑」字首字母 Z —— 金色 */}
        <path
          d="M18 22 L46 22 L30 40 L46 40 L18 42 L34 24 L18 24 Z"
          fill="url(#gold-zzu)"
          opacity="0.95"
        />

        {/* 下方 2本书（二手市场含义） */}
        <rect x="15" y="46" width="16" height="5" rx="1" fill="#FBF5E6" opacity="0.9" />
        <rect x="33" y="46" width="16" height="5" rx="1" fill="#F0E4F9" opacity="0.9" />

        {/* 中心金色小点 */}
        <circle cx="32" cy="32" r="1.8" fill="url(#gold-zzu)" />
      </svg>

      {withText && (
        <div className="leading-tight">
          <div className="font-display font-bold text-[15px] text-brand tracking-wide">
            郑大二手市场
          </div>
          <div className="text-[10px] text-gold-dark tracking-[2px]">
            ZHU · ZHOU · UNIV
          </div>
        </div>
      )}
    </div>
  );
};

export default ZZULogo;
