import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');

  return (
    <div className="space-y-4 text-slate-100 font-sans leading-relaxed">
      {lines.map((line, idx) => {
        let trimmed = line.trim();

        // Empty lines
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Headers
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-xl font-bold text-yellow-300 mt-6 mb-3 border-b border-white/10 pb-2">
              {parseInlineMarkdown(trimmed.substring(3))}
            </h2>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-lg font-bold text-yellow-200 mt-4 mb-2">
              {parseInlineMarkdown(trimmed.substring(4))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-2xl font-black text-yellow-400 mt-8 mb-4">
              {parseInlineMarkdown(trimmed.substring(2))}
            </h1>
          );
        }

        // Unordered lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <li key={idx} className="ml-6 list-disc text-slate-300">
              {parseInlineMarkdown(trimmed.substring(2))}
            </li>
          );
        }

        // Ordered lists
        const orderedMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (orderedMatch) {
          return (
            <li key={idx} className="ml-6 list-decimal text-slate-300">
              {parseInlineMarkdown(orderedMatch[2])}
            </li>
          );
        }

        // Default paragraph
        return (
          <p key={idx} className="text-slate-300">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

// Simple helper to parse bold **bold** and italic *italic* inside a line
function parseInlineMarkdown(text: string): React.ReactNode {
  // Regex to split by bold **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white bg-indigo-500/10 px-1 rounded">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Handle *italic* or other basic things
    const subParts = part.split(/(\*.*?\*)/g);
    return subParts.map((sub, j) => {
      if (sub.startsWith('*') && sub.endsWith('*')) {
        return <em key={j} className="italic text-slate-200">{sub.slice(1, -1)}</em>;
      }
      return sub;
    });
  });
}

export default MarkdownRenderer;
