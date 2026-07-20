'use client';

import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import styles from './CodeBlock.module.scss';

interface CodeBlockProps {
  code: string;
  lang: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({ code, lang, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className={styles['code-block']}>
      <div className={styles['code-header']}>
        <span className={styles['code-lang']}>{lang}</span>
        <button
          className={styles['code-copy']}
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className={styles['code-pre']}>
        <code>
          {showLineNumbers ? (
            lines.map((line, i) => (
              <div key={i} className={styles['code-line']}>
                <span className={styles['line-number']}>{i + 1}</span>
                <span className={styles['line-content']}>{line}</span>
              </div>
            ))
          ) : (
            code
          )}
        </code>
      </pre>
    </div>
  );
}