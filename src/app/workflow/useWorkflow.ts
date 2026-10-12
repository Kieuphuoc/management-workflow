'use client';

import { useSyncExternalStore } from 'react';
import { getWorkflowServerSnapshot, getWorkflowSnapshot, subscribeWorkflow } from './store';

export const useWorkflowConfig = () => useSyncExternalStore(subscribeWorkflow, getWorkflowSnapshot, getWorkflowServerSnapshot);
