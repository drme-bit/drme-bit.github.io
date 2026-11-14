import findAnswer from '@/entities/knowledge/pageKnowledge';

/*  Offline answers are only used when the server explicitly opts into local
    mode. They come from the same page knowledge as the online context, so the
    assistant never invents a different biography when the gateway is down.  */

const GREETING = /^(hi|hello|hey|yo|how are you|good (morning|evening|afternoon))\b/i;

export const FALLBACK_DEFAULTS = [
  'I can help with projects, experience, writing, availability, or contact details. Try one of those directions.',
  'Could you make that a little more specific? For example: “Which project shows backend work?”',
  'I do not have that detail in the portfolio context. The contact section is the best place to ask Vyacheslav directly.',
] as const;

export function pickFallbackResponse(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return FALLBACK_DEFAULTS[0];

  if (GREETING.test(trimmed)) {
    return 'Hi — I’m the portfolio assistant. I can help you find a project, relevant experience, or a way to get in touch with Vyacheslav.';
  }

  const knowledge = findAnswer(trimmed);
  if (knowledge) return knowledge;

  return FALLBACK_DEFAULTS[Math.floor(Math.random() * FALLBACK_DEFAULTS.length)];
}
