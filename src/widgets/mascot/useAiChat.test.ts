import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAiChat } from './useAiChat';

afterEach(() => vi.unstubAllGlobals());

describe('chat cancellation', () => {
  it('ignores an old response after stopping and starting a new request', async () => {
    let resolveFirst!: (value: Response) => void;
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    const { result, unmount } = renderHook(() => useAiChat());
    let first!: Promise<void>;
    act(() => {
      first = result.current.send('First');
    });
    act(() => result.current.stop());
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    act(() => {
      void result.current.send('Second');
    });
    await act(async () => {
      resolveFirst(new Response(JSON.stringify({ reply: 'Stale answer' })));
      await first;
    });
    expect(result.current.sending).toBe(true);
    expect(result.current.messages.map((message) => message.content)).toEqual(['First', 'Second']);
    unmount();
    expect(fetchMock.mock.calls[1][1].signal.aborted).toBe(true);
  });

  it('clears and cancels an answer that is being revealed', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ reply: 'A long answer '.repeat(40) }))),
    );
    const { result } = renderHook(() => useAiChat());
    let request!: Promise<void>;
    act(() => {
      request = result.current.send('Projects');
    });
    await waitFor(() =>
      expect(result.current.messages.some((message) => message.streaming)).toBe(true),
    );
    act(() => result.current.clear());
    await act(async () => {
      await request;
    });
    expect(result.current.messages).toEqual([]);
    expect(result.current.sending).toBe(false);
  });
});
