'use client';

import React from 'react';
import { useClose } from '../close/CloseContext';
import type { WorkflowBinding } from '../workflow/config';

/**
 * Nút nghiệp vụ gắn vào một màn hình controller. Khi bấm: ghi ActionLog và tự tích đầu việc đã gắn.
 * Trong ERP thật, thay `act` bằng lời gọi API ghi log phía máy chủ sau khi thao tác nghiệp vụ thành công.
 */
export default function ControllerActionButton({ controller, screen, action, label, docRef, className }: { controller: string; screen: string; action: WorkflowBinding['action']; label: string; docRef?: string; className?: string }) {
  const { act, period } = useClose();
  return <button type="button" onClick={() => act({ type: 'record-action', controller, screen, action, period, docRef })} className={className ?? 'rounded-xl bg-[#183b65] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#102d52]'}>{label}</button>;
}
