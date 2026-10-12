'use client';

import React from 'react';
import ControllerActionButton from '../components/ControllerActionButton';
import { useClose } from './CloseContext';
import { statusLabel, userName, type ActionResult } from './model';
import { useWorkflowConfig } from '../workflow/useWorkflow';

const resultStyle: Record<ActionResult, { label: string; style: string }> = {
  completed: { label: 'Đã tích hoàn thành', style: 'bg-emerald-50 text-emerald-700' },
  blocked: { label: 'Ghi log, chưa tích', style: 'bg-amber-50 text-amber-700' },
  forbidden: { label: 'Ghi log, sai bộ phận', style: 'bg-rose-50 text-rose-700' },
  logged: { label: 'Chỉ ghi log', style: 'bg-slate-100 text-slate-600' },
  unmatched: { label: 'Không gắn việc', style: 'bg-slate-100 text-slate-600' },
};
const time = (value: string) => new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

export default function ControllerSimulator() {
  const { state, period, user } = useClose();
  const config = useWorkflowConfig();
  const screens = new Map<string, { module: string; controller: string; screen: string; bindings: typeof config.bindings }>();
  for (const binding of config.bindings.filter(item => item.enabled)) {
    const key = `${binding.controller}|${binding.screen}`;
    screens.set(key, { module: binding.module, controller: binding.controller, screen: binding.screen, bindings: [...(screens.get(key)?.bindings ?? []), binding] });
  }
  const logs = (state.actionLogs ?? []).filter(item => item.period === period).slice(0, 12);
  return <>
    <div className="mb-5"><p className="text-[11px] font-bold uppercase tracking-widest text-[#2585b8]">Mô phỏng màn hình ERP</p><h2 className="mt-1 text-2xl font-extrabold text-[#183355]">Nút nghiệp vụ trên controller</h2><p className="mt-1 text-sm text-slate-500">Đang thao tác với tư cách <strong>{user.name}</strong>. Bấm nút để ghi log; đầu việc đã gắn sẽ tự tích hoàn thành.</p></div>
    <div className="grid gap-4 lg:grid-cols-2">{[...screens.values()].map(item => {
      const tasks = [...new Set(item.bindings.map(binding => binding.taskId))].map(id => state.tasks.filter(task => task.period === period && task.templateId === id).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).find(task => task.status !== 'done') ?? state.tasks.find(task => task.period === period && task.templateId === id)).filter(Boolean);
      return <section key={`${item.controller}${item.screen}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_14px_rgba(33,59,91,.035)]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{item.module} · <code>{item.controller}</code></p>
        <h3 className="mt-1 text-base font-extrabold text-[#183355]">{item.screen}</h3>
        <ul className="mt-3 space-y-1 text-xs text-slate-500">{tasks.map(task => <li key={task!.id}>Gắn với: <strong className="text-slate-700">{task!.title}</strong> · {statusLabel[task!.status]}</li>)}</ul>
        <div className="mt-4 flex flex-wrap gap-2">{item.bindings.map(binding => <ControllerActionButton key={binding.id} controller={binding.controller} screen={binding.screen} action={binding.action} label={binding.buttonLabel} className={binding.action === 'save-filter' ? 'rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50' : undefined} />)}</div>
      </section>;
    })}</div>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"><h3 className="text-sm font-extrabold text-[#183355]">Nhật ký thao tác gần đây</h3>
      {logs.length ? <ul className="mt-3 divide-y divide-slate-100">{logs.map(log => <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"><span className="min-w-0"><strong className="text-slate-700">{log.screen}</strong> · {log.action} · {userName(log.actorId)} · {time(log.at)}{log.message && <span className="block text-[10px] text-slate-400">{log.message}</span>}</span><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${resultStyle[log.result].style}`}>{resultStyle[log.result].label}</span></li>)}</ul> : <p className="mt-3 text-xs text-slate-500">Chưa có thao tác nào trong kỳ này.</p>}
    </section>
  </>;
}
