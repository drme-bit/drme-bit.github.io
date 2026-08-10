import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { log, info, success, warn, error, debug, group, groupEnd } from './logger';

describe('logger', () => {
  const spy = vi.fn();

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(spy);
    vi.spyOn(console, 'info').mockImplementation(spy);
    vi.spyOn(console, 'warn').mockImplementation(spy);
    vi.spyOn(console, 'error').mockImplementation(spy);
    vi.spyOn(console, 'debug').mockImplementation(spy);
    vi.spyOn(console, 'groupCollapsed').mockImplementation(spy);
    vi.spyOn(console, 'groupEnd').mockImplementation(spy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('log goes to console.log', () => {
    log('test', 'payload');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('['),
      expect.any(String),
      expect.any(String),
      'payload',
    );
  });

  it('info goes to console.info', () => {
    info('test', 42);
    expect(console.info).toHaveBeenCalled();
  });

  it('success goes to console.log with a success tag', () => {
    success('test');
    expect(console.log).toHaveBeenCalled();
  });

  it('warn goes to console.warn', () => {
    warn('test', 'careful');
    expect(console.warn).toHaveBeenCalled();
  });

  it('error goes to console.error', () => {
    error('test', new Error('boom'));
    expect(console.error).toHaveBeenCalled();
  });

  it('debug is a no-op outside development', () => {
    expect(process.env.NODE_ENV).not.toBe('development');
    debug('test', 'should not log');
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('group/groupEnd delegate to console', () => {
    group('test', 'label');
    groupEnd();
    expect(console.groupCollapsed).toHaveBeenCalled();
    expect(console.groupEnd).toHaveBeenCalled();
  });
});
