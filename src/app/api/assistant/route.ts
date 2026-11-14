import { NextResponse } from 'next/server';
import { DEFAULT_ASSISTANT_MODEL, isAssistantModel, type AssistantModelId } from '@/entities/assistant/models';
import { buildAssistantSystemPrompt } from '@/entities/assistant/system-prompt';
import { getRelatedSources, type KnowledgeSource } from '@/entities/knowledge/sources';
import { ASSISTANT_QUOTA_LIMIT, checkAssistantQuota, getClientIp } from './quota';

/*  Portfolio Assistant via Vercel AI Gateway (OpenAI-compatible endpoint).
    The response is streamed as typed SSE events so the client can render
    tool activity, token deltas and the final source list independently.
    Server-only: the API key never reaches the browser.  */

export const runtime = 'nodejs';

const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const encoder = new TextEncoder();

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface IncomingContext {
  pathname?: string;
  sectionId?: string;
}

interface RequestBody {
  messages?: IncomingMessage[];
  model?: unknown;
  context?: IncomingContext;
}

function pickModel(raw: unknown): AssistantModelId {
  if (isAssistantModel(process.env.AI_MODEL)) return process.env.AI_MODEL;
  if (isAssistantModel(raw)) return raw;
  return DEFAULT_ASSISTANT_MODEL;
}

function sse(event: string, data: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function safeContext(raw: unknown): IncomingContext | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const value = raw as Record<string, unknown>;
  const pathname = typeof value.pathname === 'string' ? value.pathname.slice(0, 160) : undefined;
  const sectionId = typeof value.sectionId === 'string' ? value.sectionId.slice(0, 80) : undefined;
  return pathname || sectionId ? { pathname, sectionId } : undefined;
}

async function forwardCompletion(
  upstream: Response,
  sources: KnowledgeSource[],
  controller: ReadableStreamDefaultController<Uint8Array>,
): Promise<void> {
  const contentType = upstream.headers.get('content-type') ?? '';

  // Some providers ignore stream:true and answer with a normal JSON body.
  if (contentType.includes('application/json')) {
    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply === 'string' && reply.trim()) {
      const text = reply.trim();
      controller.enqueue(sse('delta', { text }));
      controller.enqueue(sse('done', { reply: text, sources }));
    } else {
      controller.enqueue(sse('error', { message: 'The model returned an empty reply.' }));
    }
    return;
  }

  const reader = upstream.body?.getReader();
  if (!reader) throw new Error('AI Gateway returned no response body');

  const decoder = new TextDecoder();
  let buffer = '';
  let reply = '';
  let finished = false;

  const handleFrame = (frame: string) => {
    for (const line of frame.split(/\r?\n/)) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      if (payload === '[DONE]') {
        finished = true;
        continue;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(payload);
      } catch {
        continue;
      }

      const choice = (parsed as {
        choices?: Array<{ delta?: { content?: unknown }; message?: { content?: unknown } }>;
      })?.choices?.[0];
      const delta = choice?.delta?.content ?? choice?.message?.content;
      if (typeof delta === 'string' && delta) {
        reply += delta;
        controller.enqueue(sse('delta', { text: delta }));
      }
    }
  };

  while (!finished) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() ?? '';
    for (const frame of frames) handleFrame(frame);
  }

  if (!finished && buffer.trim()) handleFrame(buffer);

  const text = reply.trim();
  if (!text) {
    controller.enqueue(sse('error', { message: 'The model returned an empty reply.' }));
    return;
  }

  controller.enqueue(sse('done', { reply: text, sources }));
}

export async function POST(req: Request) {
  console.info('[assistant] POST /api/assistant received');

  const quota = checkAssistantQuota(getClientIp(req));
  const quotaHeaders = {
    'X-Assistant-Remaining': String(quota.remaining),
    'X-Assistant-Reset': String(quota.reset),
  };

  if (!quota.allowed) {
    console.warn('[assistant] visitor quota is exhausted; skipping AI Gateway call');
    return NextResponse.json(
      {
        error: `You have reached today's assistant limit of ${ASSISTANT_QUOTA_LIMIT} questions. New questions will be available tomorrow, or you can reach Vyacheslav via the contact section.`,
        remaining: 0,
        reset: quota.reset,
      },
      { status: 429, headers: quotaHeaders },
    );
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    console.error('[assistant] AI_GATEWAY_API_KEY is missing from the Vercel function environment');
    const localFallback =
      process.env.ASSISTANT_LOCAL_FALLBACK === 'true' ||
      process.env.CHAT_LOCAL_FALLBACK === 'true';
    return NextResponse.json(
      {
        code: localFallback ? 'LOCAL_ASSISTANT_FALLBACK' : 'AI_GATEWAY_NOT_CONFIGURED',
        error: localFallback
          ? 'The AI Gateway is not configured; local assistant mode is enabled.'
          : 'AI Gateway is not configured. Check AI_GATEWAY_API_KEY in the environment and restart the dev server.',
      },
      { status: 503, headers: quotaHeaders },
    );
  }

  let body: RequestBody = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const clean = incoming
    .filter(
      (message) =>
        message &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string',
    )
    .map((message) => ({ role: message.role, content: message.content.slice(0, 4000) }))
    .slice(-16);

  if (clean.length === 0 || clean[clean.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'Send at least one user message.' }, { status: 400 });
  }

  const lastQuestion = [...clean].reverse().find((message) => message.role === 'user')?.content ?? '';
  const sources = getRelatedSources(lastQuestion);
  const model = pickModel(body.model);
  const context = safeContext(body.context);
  const systemPrompt = buildAssistantSystemPrompt(context);

  console.info(`[assistant] forwarding request to AI Gateway with model ${model}`);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        sse('tool', {
          id: 'portfolio-context',
          name: 'portfolio_search',
          label: 'Checked portfolio context',
          detail: sources.map((source) => source.title).join(' · '),
          status: 'done',
        }),
      );
      controller.enqueue(sse('status', { phase: 'thinking' }));

      try {
        const upstream = await fetch(GATEWAY_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: systemPrompt }, ...clean],
            max_tokens: 700,
            temperature: 0.3,
            stream: true,
          }),
          signal: req.signal,
        });

        if (!upstream.ok) {
          console.error(`[assistant] AI Gateway returned HTTP ${upstream.status}`);
          const details = await upstream.text().catch(() => '');
          controller.enqueue(
            sse('error', {
              message: `AI Gateway returned HTTP ${upstream.status}.${details ? ' Try again in a moment.' : ''}`,
            }),
          );
          return;
        }

        controller.enqueue(sse('status', { phase: 'answering' }));
        await forwardCompletion(upstream, sources, controller);
      } catch (error) {
        if (!req.signal.aborted) {
          console.error('[assistant] AI Gateway request failed:', error);
          controller.enqueue(
            sse('error', { message: 'Could not reach AI Gateway. Please try again.' }),
          );
        }
      } finally {
        try {
          controller.close();
        } catch {
          // The client disconnected before the stream closed.
        }
      }
    },
    cancel() {
      // req.signal is aborted by the runtime when the browser disconnects.
    },
  });

  return new Response(stream, {
    headers: {
      ...quotaHeaders,
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
