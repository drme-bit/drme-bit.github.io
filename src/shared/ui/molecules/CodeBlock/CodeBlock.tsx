'use client';

import { useState, useCallback } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { FiCopy, FiCheck } from '@/shared/ui/atoms/Icon';
import styles from './CodeBlock.module.scss';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export default function CodeBlock({ code, lang }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <div className={styles['code-block']}>
      <button
        className={`${styles['code-copy']}${copied ? ` ${styles['code-copy--done']}` : ''}`}
        onClick={handleCopy}
        title={copied ? 'Copied!' : lang ? `Copy ${lang}` : 'Copy code'}
      >
        {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
      </button>
      {lang && <span className={styles['code-lang']}>{lang}</span>}
      <Highlight theme={themes.nightOwl} code={code.trim()} language={lang || 'text'}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className={styles['code-pre']}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
