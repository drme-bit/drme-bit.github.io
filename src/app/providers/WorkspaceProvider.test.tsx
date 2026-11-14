import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WorkspaceProvider, useWorkspace } from './WorkspaceProvider';

describe('workspace navigation', () => {
  it('opens utility panels and routes existing assistant triggers back to the conversation', () => {
    const { result } = renderHook(useWorkspace, { wrapper: WorkspaceProvider });
    act(() => result.current.openPanel('settings'));
    expect(result.current.open).toBe(true);
    expect(result.current.panel).toBe('settings');
    act(() => result.current.setOpen(true));
    expect(result.current.panel).toBe('assistant');
  });

  it('collapses without losing the selected panel and can open the inbox directly', () => {
    const { result } = renderHook(useWorkspace, { wrapper: WorkspaceProvider });
    act(() => result.current.openPanel('notifications'));
    act(() => result.current.setOpen(false));
    expect(result.current.open).toBe(false);
    expect(result.current.panel).toBe('notifications');
    act(() => result.current.openPanel('notifications'));
    expect(result.current.open).toBe(true);
  });
});
