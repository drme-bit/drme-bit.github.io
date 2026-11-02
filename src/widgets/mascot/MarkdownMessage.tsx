import type { ReactNode } from 'react';
import styles from './MarkdownMessage.module.scss';

interface MarkdownMessageProps {
  content: string;
}

function normalizeMarkdown(content: string): string {
  return content.replace(/\\([*_`[\\]()#>])/g, '$1').replace(/[\u200b\u200c\u200d]/g, '');
}

function inline(text: string, keyPrefix: string): ReactNode[] {
  const token =
    /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\((?:https?:\/\/|mailto:|#)[^)]+\))/g;
  const parts = text.split(token).filter(Boolean);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={key}>{part.slice(1, -1)}</code>;
    if (
      (part.startsWith('**') && part.endsWith('**')) ||
      (part.startsWith('__') && part.endsWith('__'))
    ) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (
      (part.startsWith('*') && part.endsWith('*')) ||
      (part.startsWith('_') && part.endsWith('_'))
    ) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('[')) {
      const match = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|mailto:|#)[^)]+)\)$/);
      if (match) {
        const [label, href] = [match[1], match[2]];
        return (
          <a key={key} href={href}>
            {label}
          </a>
        );
      }
    }
    return <span key={key}>{part}</span>;
  });
}

function renderBlocks(content: string): ReactNode[] {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let quote: string[] = [];
  let code: string[] = [];
  let inCode = false;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(
        <p key={`p-${blocks.length}`}>{inline(paragraph.join(' '), `p-${blocks.length}`)}</p>,
      );
      paragraph = [];
    }
  };
  const flushList = () => {
    if (!list.length || !listType) return;
    const Tag = listType;
    blocks.push(
      <Tag key={`list-${blocks.length}`}>
        {list.map((item, index) => (
          <li key={`${listType}-${index}`}>{inline(item, `li-${blocks.length}-${index}`)}</li>
        ))}
      </Tag>,
    );
    list = [];
    listType = null;
  };
  const flushQuote = () => {
    if (quote.length) {
      blocks.push(
        <blockquote key={`quote-${blocks.length}`}>
          {inline(quote.join(' '), `quote-${blocks.length}`)}
        </blockquote>,
      );
      quote = [];
    }
  };

  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        blocks.push(
          <pre key={`code-${blocks.length}`}>
            <code>{code.join('\n')}</code>
          </pre>,
        );
        code = [];
      } else {
        flushParagraph();
        flushList();
        flushQuote();
      }
      inCode = !inCode;
      return;
    }
    if (inCode) {
      code.push(line);
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      flushQuote();
      const Tag = `h${heading[1].length}` as 'h1' | 'h2' | 'h3';
      blocks.push(
        <Tag key={`heading-${blocks.length}`}>
          {inline(heading[2], `heading-${blocks.length}`)}
        </Tag>,
      );
      return;
    }
    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      flushQuote();
      const nextType = unordered ? 'ul' : 'ol';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      list.push((unordered ?? ordered)![1]);
      return;
    }
    const quoteLine = line.match(/^\s*>\s?(.*)$/);
    if (quoteLine) {
      flushParagraph();
      flushList();
      quote.push(quoteLine[1]);
      return;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushQuote();
      return;
    }
    flushList();
    flushQuote();
    paragraph.push(line.trim());
  });

  if (inCode)
    blocks.push(
      <pre key={`code-${blocks.length}`}>
        <code>{code.join('\n')}</code>
      </pre>,
    );
  flushParagraph();
  flushList();
  flushQuote();
  return blocks;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return <div className={styles.markdown}>{renderBlocks(normalizeMarkdown(content))}</div>;
}
