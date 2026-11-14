import type { MouseEvent, ReactNode } from 'react';
import { resolveAssistantAction } from '@/entities/assistant';
import styles from './AssistantMarkdown.module.scss';

interface AssistantMarkdownProps {
  content: string;
  onAction?: (href: string) => void;
}

type ActionHandler = (href: string) => void;

function normalizeMarkdown(content: string): string {
  return content.replace(/\\([*_`[\\]()#>])/g, '$1').replace(/[\u200b\u200c\u200d]/g, '');
}

function actionLink(
  href: string,
  label: string,
  key: string,
  onAction?: ActionHandler,
): ReactNode {
  const target = resolveAssistantAction(href);
  if (!target) return <span key={key}>{label}</span>;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onAction) return;
    event.preventDefault();
    onAction(target);
  };

  return (
    <a
      key={key}
      href={target}
      className={styles.action}
      data-assistant-action=""
      onClick={handleClick}
    >
      {label}
      <span className={styles.actionArrow} aria-hidden="true">
        ↗
      </span>
    </a>
  );
}

function inline(text: string, keyPrefix: string, onAction?: ActionHandler): ReactNode[] {
  const token =
    /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\((?:https?:\/\/|mailto:|#|assistant:\/\/)[^)]+\))/g;
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
      const match = part.match(
        /^\[([^\]]+)\]\(((?:https?:\/\/|mailto:|#|assistant:\/\/)[^)]+)\)$/,
      );
      if (match) {
        const [label, href] = [match[1], match[2]];
        if (href.startsWith('assistant://')) return actionLink(href, label, key, onAction);
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

function renderBlocks(content: string, onAction?: ActionHandler): ReactNode[] {
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
        <p key={`p-${blocks.length}`}>
          {inline(paragraph.join(' '), `p-${blocks.length}`, onAction)}
        </p>,
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
          <li key={`${listType}-${index}`}>
            {inline(item, `li-${blocks.length}-${index}`, onAction)}
          </li>
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
          {inline(quote.join(' '), `quote-${blocks.length}`, onAction)}
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
          {inline(heading[2], `heading-${blocks.length}`, onAction)}
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

export default function AssistantMarkdown({ content, onAction }: AssistantMarkdownProps) {
  return (
    <div className={styles.markdown}>{renderBlocks(normalizeMarkdown(content), onAction)}</div>
  );
}
