import { INITIAL_WORKFLOW_CONFIG, WorkflowConfig } from './config';

const STORAGE_KEY = 'arito-workflow-config-v2';
const serverSnapshot = INITIAL_WORKFLOW_CONFIG;
let current: WorkflowConfig | null = null;
const listeners = new Set<() => void>();

export function getWorkflowSnapshot(): WorkflowConfig {
  if (current) return current;
  if (typeof window === 'undefined') return serverSnapshot;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as WorkflowConfig;
      if (parsed.version === 1 && Array.isArray(parsed.groups) && Array.isArray(parsed.bindings) && Array.isArray(parsed.audit)) current = parsed;
    }
  } catch { /* The demo remains usable if browser storage is unavailable. */ }
  current ??= serverSnapshot;
  return current;
}

export const getWorkflowServerSnapshot = () => serverSnapshot;

export function subscribeWorkflow(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    current = null;
    listeners.forEach(callback => callback());
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

export function commitWorkflowConfig(next: WorkflowConfig) {
  current = next;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep working in memory if storage is unavailable. */ }
  listeners.forEach(listener => listener());
}
