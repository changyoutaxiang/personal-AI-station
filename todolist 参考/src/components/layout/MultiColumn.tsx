import React, { useEffect, useState } from 'react';

interface MultiColumnProps {
  children: React.ReactNode;
  minColumnWidth?: number;
  maxColumns?: number;
  gap?: number;
}

export const MultiColumn: React.FC<MultiColumnProps> = ({
  children,
  minColumnWidth = 280,
  maxColumns = 5,
  gap = 16,
}) => {
  const [columns, setColumns] = useState(3);
  const [isReady, setIsReady] = useState(false);

  const updateColumns = () => {
    const width = window.innerWidth;
    
    // MacBook 专精断点
    if (width >= 1440) setColumns(Math.min(5, maxColumns)); // 16寸MacBook Pro
    else if (width >= 1280) setColumns(Math.min(4, maxColumns)); // 14寸MacBook Pro
    else if (width >= 1152) setColumns(Math.min(3, maxColumns)); // 13寸MacBook Air
    else setColumns(2); // 更小屏幕
    
    setIsReady(true);
  };

  useEffect(() => {
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [maxColumns]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">正在调整布局...</div>
      </div>
    );
  }

  return (
    <div 
      className="grid"
      style={{ 
        gridTemplateColumns: `repeat(${columns}, minmax(${minColumnWidth}px, 1fr))`,
        gap: `${gap}px`
      }}
    >
      {children}
    </div>
  );
};