/*  Curated free models served through Vercel AI Gateway. The same list is
    used by the server allowlist and the client picker, so a model can never
    be selected in the UI and rejected by the API.  */

export const ASSISTANT_MODELS = [
  {
    id: 'openai/gpt-5-nano',
    label: 'GPT-5 nano',
    note: 'Best factual accuracy',
  },
  {
    id: 'inclusionai/ling-3.0-flash-sante',
    label: 'Ling Flash',
    note: 'Fast and light',
  },
  {
    id: 'inclusionai/ling-3.1-flash-1019',
    label: 'Ling 3.1',
    note: 'Fast and light',
  },
  {
    id: 'poolside/laguna-s-2.1-free',
    label: 'Laguna',
    note: 'Free fallback',
  },
] as const;

export type AssistantModelId = (typeof ASSISTANT_MODELS)[number]['id'];

export const DEFAULT_ASSISTANT_MODEL: AssistantModelId = 'openai/gpt-5-nano';

export function isAssistantModel(value: unknown): value is AssistantModelId {
  return typeof value === 'string' && ASSISTANT_MODELS.some((model) => model.id === value);
}

export function assistantModelLabel(id: AssistantModelId): string {
  return ASSISTANT_MODELS.find((model) => model.id === id)?.label ?? id;
}
