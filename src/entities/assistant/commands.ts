/*  Slash commands are handled entirely in the client: they navigate, control
    the conversation or seed a question without spending an AI request.  */

export type AssistantCommandAction = 'new' | 'stop' | 'copy';

export interface AssistantCommand {
  id: string;
  name: string;
  description: string;
  kind: 'navigate' | 'action' | 'prompt';
  target?: string;
  action?: AssistantCommandAction;
  prompt?: string;
}

export const ASSISTANT_COMMANDS: AssistantCommand[] = [
  {
    id: 'projects',
    name: '/projects',
    description: 'Open selected projects',
    kind: 'navigate',
    target: '/#projects',
  },
  {
    id: 'experience',
    name: '/experience',
    description: 'Open the experience timeline',
    kind: 'navigate',
    target: '/#experience',
  },
  {
    id: 'about',
    name: '/about',
    description: 'Open the about section',
    kind: 'navigate',
    target: '/#about',
  },
  {
    id: 'contact',
    name: '/contact',
    description: 'Open contact options',
    kind: 'navigate',
    target: '/#contact',
  },
  {
    id: 'resume',
    name: '/resume',
    description: 'Open the résumé page',
    kind: 'navigate',
    target: '/resume',
  },
  {
    id: 'blog',
    name: '/blog',
    description: 'Open the writing section',
    kind: 'navigate',
    target: '/#blog',
  },
  {
    id: 'new',
    name: '/new',
    description: 'Start a new conversation',
    kind: 'action',
    action: 'new',
  },
  {
    id: 'stop',
    name: '/stop',
    description: 'Stop the current answer',
    kind: 'action',
    action: 'stop',
  },
  {
    id: 'copy',
    name: '/copy',
    description: 'Copy the latest answer',
    kind: 'action',
    action: 'copy',
  },
  {
    id: 'help',
    name: '/help',
    description: 'Ask what the assistant can do',
    kind: 'prompt',
    prompt: 'What can you help me with on this portfolio?',
  },
];

export function filterAssistantCommands(query: string): AssistantCommand[] {
  const q = query.trim().toLowerCase().replace(/^\//, '');
  if (!q) return ASSISTANT_COMMANDS;
  return ASSISTANT_COMMANDS.filter(
    (command) =>
      command.name.slice(1).includes(q) || command.description.toLowerCase().includes(q),
  );
}
