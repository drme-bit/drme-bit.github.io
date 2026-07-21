const IS_DEV = process.env.NODE_ENV === 'development';
const NOOP = () => {};

const STYLES = {
  log: 'color:#7289da;font-weight:700',
  info: 'color:#00b0f4;font-weight:700',
  success: 'color:#43b581;font-weight:700',
  warn: 'color:#faa61a;font-weight:700',
  error: 'color:#f04747;font-weight:700',
  debug: 'color:#99aab5;font-weight:400',
};

function ts(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function formatTag(level: string, tag: string): string {
  return `%c${ts()} %c[${tag}]`;
}

function formatStyles(level: keyof typeof STYLES, _tag: string): string[] {
  const tsStyle = 'color:#99aab5;font-weight:400';
  const tagStyle = STYLES[level];
  return [tsStyle, tagStyle];
}

export function log(tag: string, ...args: unknown[]): void {
  console.log(formatTag('log', tag), ...formatStyles('log', tag), ...args);
}

export function info(tag: string, ...args: unknown[]): void {
  console.info(formatTag('info', tag), ...formatStyles('info', tag), ...args);
}

export function success(tag: string, ...args: unknown[]): void {
  console.log(formatTag('success', tag), ...formatStyles('success', tag), ...args);
}

export function warn(tag: string, ...args: unknown[]): void {
  console.warn(formatTag('warn', tag), ...formatStyles('warn', tag), ...args);
}

export function error(tag: string, ...args: unknown[]): void {
  console.error(formatTag('error', tag), ...formatStyles('error', tag), ...args);
}

export function debug(tag: string, ...args: unknown[]): void {
  if (!IS_DEV) return;
  console.debug(formatTag('debug', tag), ...formatStyles('debug', tag), ...args);
}

export function group(tag: string, label: string): void {
  console.groupCollapsed(
    `%c${ts()} %c[${tag}] %c${label}`,
    'color:#99aab5;font-weight:400',
    STYLES.log,
    'color:#99aab5;font-weight:400',
  );
}

export function groupEnd(): void {
  console.groupEnd();
}

export default { log, info, success, warn, error, debug, group, groupEnd };
