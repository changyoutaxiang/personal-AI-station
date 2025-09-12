import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => (
  <div className={`rounded-lg border shadow-sm ${className}`} style={style}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', style }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} style={style}>
    {children}
  </h3>
);

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '', style }) => (
  <p className={`text-sm text-muted-foreground ${className}`} style={style}>
    {children}
  </p>
);

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);