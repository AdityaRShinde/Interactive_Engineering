import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  latex?: string;
  math?: string;
  block?: boolean;
  displayMode?: boolean;
  className?: string;
  fallbackText?: string;
}

export const MathView: React.FC<MathViewProps> = ({
  latex,
  math,
  block,
  displayMode,
  className = '',
  fallbackText
}) => {
  const rawExpression = latex || math || '';
  const isBlock = block !== undefined ? block : (displayMode !== undefined ? displayMode : false);

  const html = useMemo(() => {
    if (!rawExpression || !rawExpression.trim()) return null;
    try {
      // Clean standard LaTeX delimiters if passed accidentally
      let cleaned = rawExpression.trim();
      if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
        cleaned = cleaned.slice(2, -2).trim();
      } else if (cleaned.startsWith('$') && cleaned.endsWith('$')) {
        cleaned = cleaned.slice(1, -1).trim();
      } else if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) {
        cleaned = cleaned.slice(2, -2).trim();
      }

      return katex.renderToString(cleaned, {
        displayMode: isBlock,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch (err) {
      console.warn('KaTeX rendering error for:', rawExpression, err);
      return null;
    }
  }, [rawExpression, isBlock]);

  if (!html) {
    return (
      <span className={`font-mono-tech font-bold ${className}`}>
        {fallbackText || rawExpression || '—'}
      </span>
    );
  }

  return (
    <span
      className={`inline-block ${isBlock ? 'my-1 text-center w-full overflow-x-auto select-all' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
