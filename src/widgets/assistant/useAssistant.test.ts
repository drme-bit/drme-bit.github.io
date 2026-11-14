import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAssistant } from './useAssistant';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => vi.unstubAllGlobals());

describe('assistant cancellation', () => {
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
    const { result, unmount } = renderHook(() => useAssistant());
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
    const { result } = renderHook(() => useAssistant());
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

describe('assistant streaming', () => {
  it('renders tool activity and token deltas from SSE', async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'event: tool\ndata: {"id":"context","name":"portfolio_search","label":"Searched portfolio context","status":"done"}\n\n',
          ),
        );
        controller.enqueue(encoder.encode('event: delta\ndata: {"text":"Hel"}\n\n'));
        controller.enqueue(encoder.encode('event: delta\ndata: {"text":"lo"}\n\n'));
        controller.enqueue(
          encoder.encode(
            'event: done\ndata: {"reply":"Hello","sources":[{"title":"Nexagon","description":"Case study","href":"/projects/nexagon"}]}\n\n',
          ),
        );
        controller.close();
      },
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(body, {
          headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
        }),
      ),
    );

    const { result } = renderHook(() => useAssistant());
    await act(async () => {
      await result.current.send('Hi');
    });

    const answer = result.current.messages.find((message) => message.role === 'assistant');
    expect(answer?.content).toBe('Hello');
    expect(answer?.streaming).toBe(false);
    expect(answer?.sources?.[0]).toMatchObject({ title: 'Nexagon' });
  });
});
