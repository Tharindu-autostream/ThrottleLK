import type { ReactNode } from 'react';

/** Minimal markdown → React for article bodies (headings, lists, paragraphs, bold). */
export default function MarkdownBody({ markdown }: { markdown: string }) {
  const blocks = markdown.trim().split(/\n{2,}/);

  return (
    <div className="space-y-5 text-[#F0EDE8]/80 leading-relaxed">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={i}
              className="pt-4 text-3xl tracking-wide text-[#F0EDE8]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {inlineFormat(trimmed.slice(3))}
            </h2>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={i}
              className="pt-2 text-xl tracking-wide text-[#F0EDE8]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {inlineFormat(trimmed.slice(4))}
            </h3>
          );
        }

        const lines = trimmed.split('\n');
        const isList = lines.every(
          (l) => l.trim().startsWith('- ') || l.trim().match(/^\d+\.\s/),
        );
        if (isList) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-5">
              {lines.map((line, j) => (
                <li key={j}>{inlineFormat(line.replace(/^(-|\d+\.)\s+/, ''))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="text-base md:text-lg">
            {inlineFormat(trimmed.replace(/\n/g, ' '))}
          </p>
        );
      })}
    </div>
  );
}

function inlineFormat(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[#F0EDE8]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
