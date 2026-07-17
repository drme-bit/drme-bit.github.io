/**
 * Discord-style logger with colored prefixes and timestamps.
 *
 * Usage:
 *   import { log, warn, error, debug, info, success, group, groupEnd } from '@/utils/logger';
 *   log('Globe', 'initialized', { samples: 12000 });
 *   warn('Skills', 'slow search query');
 *   error('Scene', 'WebGL context lost', err);
 *
 * Styles (Discord-inspired):
 *   log     — blue tag, normal text
 *   info    — cyan tag
 *   success — green tag
 *   warn    — yellow/orange tag
 *   error   — red tag, bold
 *   debug   — gray tag, dimmed
 */

const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
const NOOP = () => {};

const STYLES = {
  log:     'color:#7289da;font-weight:700',
  info:    'color:#00b0f4;font-weight:700',
  success: 'color:#43b581;font-weight:700',
  warn:    'color:#faa61a;font-weight:700',
  error:   'color:#f04747;font-weight:700',
  debug:   'color:#99aab5;font-weight:400',
};

function ts() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function formatTag(level, tag) {
  return `%c${ts()} %c[${tag}]`;
}

function formatStyles(level, tag) {
  const tsStyle = 'color:#99aab5;font-weight:400';
  const tagStyle = STYLES[level];
  return [tsStyle, tagStyle];
}

export function log(tag, ...args) {
  console.log(formatTag('log', tag), ...formatStyles('log', tag), ...args);
}

export function info(tag, ...args) {
  console.info(formatTag('info', tag), ...formatStyles('info', tag), ...args);
}

export function success(tag, ...args) {
  console.log(formatTag('success', tag), ...formatStyles('success', tag), ...args);
}

export function warn(tag, ...args) {
  console.warn(formatTag('warn', tag), ...formatStyles('warn', tag), ...args);
}

export function error(tag, ...args) {
  console.error(formatTag('error', tag), ...formatStyles('error', tag), ...args);
}

export function debug(tag, ...args) {
  if (!IS_DEV) return;
  console.debug(formatTag('debug', tag), ...formatStyles('debug', tag), ...args);
}

export function group(tag, label) {
  console.groupCollapsed(
    `%c${ts()} %c[${tag}] %c${label}`,
    'color:#99aab5;font-weight:400',
    STYLES.log,
    'color:#99aab5;font-weight:400'
  );
}

export function groupEnd() {
  console.groupEnd();
}

export default { log, info, success, warn, error, debug, group, groupEnd };
