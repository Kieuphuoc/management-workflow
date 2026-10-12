'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, ListChecks, FileCheck2, History, LockKeyhole, Plus, Search, X, Save, Send } from 'lucide-react';
import { useClose } from './CloseContext';
import { blockers, canManageDepartment, canSeeTask, CloseTask, DEPARTMENTS, DepartmentId, departmentName, monthLabel, reportMetrics, statusLabel, taskProgress, USERS, userName } from './model';
import { getSavedReportFilter, ReportViewFilter, saveReportFilter, subscribeSavedReportFilter } from './reportViewPrefs';
import ChecklistTimeline from './ChecklistTimeline';
import { completingBindings } from '../workflow/config';
import { useWorkflowConfig } from '../workflow/useWorkflow';
import CustomSelect, { type CustomSelectOption } from '../components/CustomSelect';

const formatDate = (value?: string) => value ? new Date(value.length === 10 ? `${value}T00:00:00` : value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

function Heading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-[#2585b8]">{eyebrow}</div><h2 className="text-2xl font-extrabold tracking-tight text-[#182e4d] sm:text-[29px]">{title}</h2>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>{action}</div>;
}

function Badge({ status }: { status: CloseTask['status'] }) {
  const styles = { todo: 'bg-slate-100 text-slate-600', doing: 'bg-blue-50 text-blue-700', review: 'bg-amber-50 text-amber-700', done: 'bg-emerald-50 text-emerald-700', blocked: 'bg-rose-50 text-rose-700' };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[status]}`}>{statusLabel[status]}</span>;
}

function Progress({ value }: { value: number }) { return <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#2685bc]" style={{ width: `${value}%` }} /></div>; }

function Stat({ label, value, caption, icon }: { label: string; value: string | number; caption: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_14px_rgba(33,59,91,.025)]"><div className="flex items-center justify-between text-xs font-semibold text-slate-500"><span>{label}</span><span className="rounded-xl bg-[#eef5fb] p-2 text-[#2878aa]">{icon}</span></div><div className="mt-3 text-3xl font-extrabold tracking-tight text-[#1b3455]">{value}</div><p className="mt-1 text-xs text-slate-400">{caption}</p></div>;
}

function TaskRow({ task, onOpen, compact = false, showChecklist = false }: { task: CloseTask; onOpen: (id: string) => void; compact?: boolean; showChecklist?: boolean }) {
  const { state, user, act } = useClose();
  const autoBinding = completingBindings(useWorkflowConfig(), task.templateId)[0];
  const waiting = blockers(state, task);
  const reportClosed = state.reports.some(report => report.period === task.period && report.department === task.department && report.status === 'closed');
  const canEdit = !reportClosed && task.status !== 'review' && task.status !== 'done' && (task.assigneeId === user.id || canManageDepartment(user, task.department));
  const taskLogs = state.audit.filter(entry => entry.targetType === 'task' && entry.targetId === task.id);
  return <div className="border-b border-slate-100 px-4 py-3.5 last:border-b-0 sm:px-5">
    <div className="flex items-center gap-3">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${task.status === 'done' ? 'bg-emerald-50 text-emerald-600' : task.status === 'blocked' ? 'bg-rose-50 text-rose-600' : 'bg-[#edf3fa] text-[#3476a5]'}`}>{task.status === 'done' ? <Check size={16} /> : task.status === 'blocked' ? <CircleAlert size={16} /> : <span className="text-xs font-extrabold">{task.step}</span>}</span>
      <button type="button" onClick={() => onOpen(task.id)} className="group min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-bold text-[#213b5a] group-hover:text-[#1b77ab]">{task.title}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">{user.role === 'staff' ? '' : compact ? `${departmentName(task.department)} · ` : `${userName(task.assigneeId)} · `}Hạn {formatDate(task.dueDate)}{waiting.length && task.status === 'todo' ? ` · Chờ ${waiting[0]}` : ''}</span>
      </button>
      <span className="hidden sm:block"><Badge status={task.status} /></span>
      <button type="button" onClick={() => onOpen(task.id)} aria-label={`Xem ${taskLogs.length} ghi nhận trong lịch sử của ${task.title}`} title={`${taskLogs.length} ghi nhận trong lịch sử`} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-[#edf5fa] hover:text-[#2679a7]"><History size={14} /><span>{taskLogs.length}</span></button>
      <button type="button" onClick={() => onOpen(task.id)} aria-label={`Chi tiết ${task.title}`} className="shrink-0 text-slate-300 hover:text-[#2585b8]"><ChevronRight size={17} /></button>
    </div>
    {showChecklist && <div className="mt-3 grid gap-x-4 gap-y-1.5 pl-11 sm:grid-cols-2">{task.checklist.map((item, index) => <label key={`${index}-${item.label}`} className={`flex min-w-0 items-start gap-2 rounded-md px-1 py-1 text-xs ${item.checked ? 'text-slate-400' : 'text-slate-600'} ${canEdit && !waiting.length ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}>
      <input type="checkbox" checked={item.checked} disabled={!canEdit || Boolean(waiting.length) || Boolean(autoBinding)} onChange={event => act({ type: 'set-check', taskId: task.id, index, checked: event.target.checked })} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#2585b8]" />
      <span className={`min-w-0 leading-5 ${item.checked ? 'line-through' : ''}`}>{item.label}</span>
    </label>)}{autoBinding && task.status !== 'done' && <p className="pl-1 text-[10px] text-[#2679a7] sm:col-span-2">Tự tích khi bấm “{autoBinding.buttonLabel}” tại {autoBinding.screen}.</p>}{waiting.length > 0 && task.status === 'todo' && <p className="pl-1 text-[10px] text-amber-700 sm:col-span-2">Mở sau khi hoàn tất: {waiting.join(', ')}</p>}</div>}
  </div>;
}

function TaskDetail({ id, onClose, focusHistory = false, inline = false }: { id: string; onClose: () => void; focusHistory?: boolean; inline?: boolean }) {
  const { state, user, act } = useClose();
  const workflowConfig = useWorkflowConfig();
  const task = state.tasks.find(item => item.id === id && canSeeTask(user, item));
  const [note, setNote] = useState(task?.note ?? '');
  const [reason, setReason] = useState('');
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? '');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const historyRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (focusHistory) historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusHistory, id]);
  if (!task) return null;
  const autoBinding = completingBindings(workflowConfig, task.templateId)[0];
  const waiting = blockers(state, task);
  const reportClosed = state.reports.find(item => item.period === task.period && item.department === task.department)?.status === 'closed';
  const manager = canManageDepartment(user, task.department);
  const editable = !reportClosed && task.status !== 'review' && task.status !== 'done' && (manager || task.assigneeId === user.id);
  const staffInDepartment = USERS.filter(item => item.department === task.department && item.role === 'staff');
  const taskLogs = state.audit.filter(entry => entry.targetType === 'task' && entry.targetId === task.id);

  return <div className={inline ? 'mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm' : 'fixed inset-0 z-50 flex justify-end bg-[#0f2035]/50'} onMouseDown={event => { if (!inline && event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal={inline ? undefined : true} aria-label={`Chi tiết ${task.title}`} className={inline ? 'w-full bg-white' : 'flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl'}>
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-5 py-5 sm:px-7"><div><p className="text-[11px] font-bold uppercase tracking-widest text-[#2585b8]">Bước {task.step} · {departmentName(task.department)}</p><h3 className="mt-1 text-xl font-extrabold text-[#183355]">{task.title}</h3><div className="mt-2"><Badge status={task.status} /></div></div><button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" onClick={onClose} aria-label="Đóng chi tiết"><X size={21} /></button></div>
      <div className="space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
        <p className="text-sm leading-6 text-slate-600">{task.description}</p>
        <div className={`grid ${user.role === 'staff' ? 'grid-cols-1' : 'grid-cols-2'} gap-3 rounded-2xl bg-[#f6f9fc] p-4 text-sm`}>{user.role !== 'staff' && <div><p className="text-xs text-slate-400">Người phụ trách</p><p className="mt-1 font-bold">{userName(task.assigneeId)}</p></div>}<div><p className="text-xs text-slate-400">Hạn hoàn thành</p><p className="mt-1 font-bold">{formatDate(task.dueDate)}</p></div></div>
        {manager && !reportClosed && task.status !== 'review' && task.status !== 'done' && <div className="rounded-2xl border border-slate-200 p-4"><h4 className="mb-3 text-sm font-bold">Điều chỉnh phân công</h4><div className="flex flex-wrap gap-2"><select value={assigneeId} onChange={event => setAssigneeId(event.target.value)} className="min-w-[170px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm">{staffInDepartment.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input aria-label="Hạn hoàn thành" type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><button onClick={() => act({ type: 'assign', taskId: task.id, assigneeId, dueDate })} className="rounded-lg bg-[#e9f2f9] px-4 py-2 text-xs font-bold text-[#1b689b]">Lưu phân công</button></div></div>}
        {autoBinding && <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900"><strong>Việc tự hoàn thành.</strong> Checklist được tích khi {task.assigneeId === user.id ? 'bạn' : 'người phụ trách'} bấm “{autoBinding.buttonLabel}” tại màn hình <em>{autoBinding.screen}</em>; không tích hoặc trình duyệt thủ công.</div>}
        {waiting.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><strong>Đang chờ bước trước:</strong><ul className="mt-1 list-inside list-disc">{waiting.map(item => <li key={item}>{item}</li>)}</ul></div>}
        <section><div className="mb-3 flex justify-between"><h4 className="text-sm font-extrabold text-[#183355]">Checklist cần hoàn thành</h4><span className="text-xs font-bold text-slate-400">{task.checklist.filter(item => item.checked).length}/{task.checklist.length}</span></div><div className="space-y-2">{task.checklist.map((item, index) => <label key={`${index}-${item.label}`} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${item.checked ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-200'}`}><input type="checkbox" checked={item.checked} disabled={!editable || Boolean(waiting.length) || Boolean(autoBinding)} onChange={event => act({ type: 'set-check', taskId: task.id, index, checked: event.target.checked })} className="mt-0.5 h-4 w-4 accent-[#2585b8]" /><span className={item.checked ? 'text-slate-600' : 'text-slate-700'}>{item.label}</span></label>)}</div></section>
        {task.metricDefinitions.length > 0 && <section><h4 className="mb-1 text-sm font-extrabold text-[#183355]">Số liệu kết quả</h4><p className="mb-3 text-xs text-slate-500">Điền số liệu đã đối chiếu trước khi trình duyệt.</p><div className="grid gap-3 sm:grid-cols-2">{task.metricDefinitions.map(definition => <div key={definition.key}><label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor={`${task.id}-${definition.key}`}>{definition.label} <span className="text-slate-400">({definition.unit})</span></label><input key={`${task.id}-${definition.key}-${task.metrics[definition.key] ?? ''}`} id={`${task.id}-${definition.key}`} type="number" min="0" step="any" defaultValue={task.metrics[definition.key] ?? ''} disabled={!editable} onBlur={event => { const value = event.target.value === '' ? null : Number(event.target.value); if (value !== (task.metrics[definition.key] ?? null)) act({ type: 'set-metric', taskId: task.id, key: definition.key, value }); }} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Nhập số liệu" /></div>)}</div></section>}
        <section><label className="mb-2 block text-sm font-extrabold text-[#183355]" htmlFor="task-note">Ghi chú / bằng chứng đối chiếu</label><textarea id="task-note" value={note} disabled={!editable} onChange={event => setNote(event.target.value)} onBlur={() => { if (note !== task.note) act({ type: 'set-note', taskId: task.id, note }); }} rows={3} placeholder="Ghi nguồn số liệu, chứng từ hoặc vướng mắc..." className="w-full rounded-xl border border-slate-200 p-3 text-sm" /></section>
        {!reportClosed && <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
          {editable && task.status === 'todo' && <button disabled={Boolean(waiting.length)} onClick={() => act({ type: 'task-status', taskId: task.id, status: 'doing' })} className="rounded-xl bg-[#1a5f91] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Bắt đầu làm</button>}
          {editable && !autoBinding && task.status !== 'blocked' && <button disabled={Boolean(waiting.length)} onClick={() => act({ type: 'task-status', taskId: task.id, status: 'review' })} className="rounded-xl bg-[#183b65] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Trình duyệt công việc</button>}
          {editable && task.status === 'blocked' && <button onClick={() => act({ type: 'task-status', taskId: task.id, status: 'doing' })} className="rounded-xl bg-[#183b65] px-4 py-2.5 text-sm font-bold text-white">Tiếp tục thực hiện</button>}
          {task.status === 'review' && manager && <button onClick={() => act({ type: 'task-status', taskId: task.id, status: 'done' })} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white">Duyệt hoàn thành</button>}
          {((editable && task.status !== 'blocked') || (manager && (task.status === 'review' || task.status === 'done'))) && <div className="flex w-full gap-2"><input value={reason} onChange={event => setReason(event.target.value)} placeholder={task.status === 'review' || task.status === 'done' ? 'Lý do trả lại (bắt buộc)' : 'Mô tả vướng mắc (bắt buộc)'} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" /><button onClick={() => { const ok = act({ type: 'task-status', taskId: task.id, status: task.status === 'review' || task.status === 'done' ? 'doing' : 'blocked', note: reason }); if (ok) setReason(''); }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">{task.status === 'review' || task.status === 'done' ? 'Trả lại' : 'Báo vướng'}</button></div>}
        </div>}
        {task.completedAt && <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">Đã duyệt lúc {formatDateTime(task.completedAt)} bởi {userName(task.completedBy ?? '')}</div>}
        <section ref={historyRef} className="scroll-mt-5 border-t border-slate-100 pt-5"><div className="mb-3 flex items-center justify-between"><h4 className="text-sm font-extrabold text-[#183355]">Lịch sử công việc</h4><span className="rounded-full bg-[#f1f5f9] px-2 py-1 text-[10px] font-bold text-slate-500">{taskLogs.length} ghi nhận</span></div>{taskLogs.length ? <ol className="space-y-3">{taskLogs.map(entry => <li key={entry.id} className="relative flex gap-3 text-xs"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#77a9c8] ring-4 ring-[#eef5fa]" /><div className="min-w-0 flex-1 rounded-lg bg-[#f8fafc] px-3 py-2.5"><div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><span className="font-bold text-slate-700">{entry.action} · {userName(entry.actorId)}</span><time className="text-[10px] text-slate-400">{formatDateTime(entry.at)}</time></div><p className="mt-1 break-words leading-5 text-slate-500">{entry.detail}</p></div></li>)}</ol> : <p className="text-xs text-slate-400">Chưa có thay đổi nào trong kỳ này.</p>}</section>
      </div>
    </div>
  </div>;
}

function NewTaskDialog({ department, initialDueDate, onClose }: { department: DepartmentId; initialDueDate?: string; onClose: () => void }) {
  const { period, act } = useClose();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(USERS.find(item => item.department === department && item.role === 'staff')?.id ?? '');
  const [dueDate, setDueDate] = useState(() => {
    if (initialDueDate) return initialDueDate;
    const [year, month] = period.split('-').map(Number);
    const date = new Date(year, month, 8);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  const [step, setStep] = useState(department === 'warehouse' ? 1 : department === 'cost' ? 3 : department === 'receivables' ? 4 : 5);
  const [checklist, setChecklist] = useState('');
  const staff = USERS.filter(item => item.department === department && item.role === 'staff');
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f2035]/50 p-4"><form onSubmit={event => { event.preventDefault(); if (act({ type: 'add-task', period, department, step, title, description, assigneeId, dueDate, checklist: checklist.split('\n') })) onClose(); }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#2585b8]">{departmentName(department)}</p><h3 className="mt-1 text-xl font-extrabold text-[#183355]">Giao công việc mới</h3></div><button type="button" onClick={onClose} aria-label="Đóng"><X size={20} /></button></div><div className="mt-5 space-y-4 text-sm"><label className="block text-xs font-bold">Tên công việc<input value={title} onChange={event => setTitle(event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm" /></label><label className="block text-xs font-bold">Mô tả<textarea value={description} onChange={event => setDescription(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm" /></label><div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Người thực hiện<select value={assigneeId} onChange={event => setAssigneeId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm">{staff.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-xs font-bold">Hạn hoàn thành<input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm" /></label></div><label className="block text-xs font-bold">Bước quy trình<select value={step} onChange={event => setStep(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm">{(department === 'warehouse' ? [1, 2] : department === 'finance' ? [5, 6] : department === 'cost' ? [3] : [4]).map(number => <option key={number} value={number}>Bước {number}</option>)}</select></label><label className="block text-xs font-bold">Checklist · mỗi dòng một mục<textarea value={checklist} onChange={event => setChecklist(event.target.value)} rows={3} required placeholder={'Kiểm tra chứng từ\nĐối chiếu số liệu\nXác nhận kết quả'} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500">Hủy</button><button type="submit" className="rounded-xl bg-[#183b65] px-5 py-2.5 text-sm font-bold text-white">Giao việc</button></div></form></div>;
}

export function DashboardView() {
  const { state, user, period, act, setPeriod } = useClose();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [newPeriod, setNewPeriod] = useState('');
  const periodTasks = state.tasks.filter(task => task.period === period);
  const visible = periodTasks.filter(task => canSeeTask(user, task));
  const unfinished = visible.filter(task => task.status !== 'done');
  const due = visible.filter(task => task.status !== 'done' && task.dueDate < new Date().toISOString().slice(0, 10));
  const review = visible.filter(task => task.status === 'review');
  const own = user.role === 'staff';
  const reports = state.reports.filter(report => report.period === period);

  return <>
    <Heading eyebrow={own ? 'Không gian cá nhân' : 'Điều hành kỳ chốt'} title={own ? `Xin chào, ${user.name.split(' ').at(-1)}` : `Tổng quan ${monthLabel(period)}`} description={own ? 'Theo dõi và cập nhật các việc được giao. Khi hoàn thành checklist và số liệu, hãy trình trưởng bộ phận duyệt.' : 'Theo dõi tiến độ chốt số liệu theo bộ phận và xử lý các điểm nghẽn trước khi chốt báo cáo.'} action={user.role === 'chief' && <div className="flex gap-2"><input aria-label="Kỳ chốt mới" type="month" value={newPeriod} onChange={event => setNewPeriod(event.target.value)} className="w-[150px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" /><button onClick={() => { if (act({ type: 'new-period', period: newPeriod })) { setPeriod(newPeriod); setNewPeriod(''); } }} className="inline-flex items-center gap-1 rounded-xl bg-[#183b65] px-4 py-2 text-xs font-bold text-white"><Plus size={15} /> Tạo kỳ chốt</button></div>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label={own ? 'Việc được giao' : 'Tổng công việc'} value={visible.length} caption={`Trong ${monthLabel(period).toLowerCase()}`} icon={<CheckCircle2 size={19} />} /><Stat label="Đã hoàn thành" value={visible.filter(task => task.status === 'done').length} caption={`${taskProgress(visible)}% tiến độ`} icon={<FileCheck2 size={19} />} /><Stat label={own ? 'Chờ duyệt' : 'Cần duyệt'} value={review.length} caption={own ? 'Đã gửi trưởng bộ phận' : 'Đang đợi xác nhận'} icon={<ListChecks size={19} />} /><Stat label="Quá hạn" value={due.length} caption="Công việc chưa hoàn thành" icon={<CircleAlert size={19} />} /></div>
    {own ? <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h3 className="font-extrabold text-[#183355]">Việc cần xử lý</h3><p className="mt-1 text-xs text-slate-500">Ưu tiên theo hạn hoàn thành</p></div><Link href="/admin/checklist" className="text-xs font-bold text-[#247ead]">Xem tất cả →</Link></div>{unfinished.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6).map(task => <TaskRow key={task.id} task={task} compact onOpen={setSelectedTask} />)}{!unfinished.length && <div className="p-8 text-center text-sm text-slate-500">Bạn đã hoàn tất mọi công việc được giao trong kỳ.</div>}</section><section className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-extrabold text-[#183355]">Tiến độ của tôi</h3><div className="mt-5 flex items-end justify-between"><span className="text-4xl font-extrabold text-[#1c659b]">{taskProgress(visible)}%</span><span className="text-xs text-slate-500">{visible.filter(task => task.status === 'done').length}/{visible.length} việc</span></div><div className="mt-3"><Progress value={taskProgress(visible)} /></div><div className="mt-7 rounded-xl bg-[#f3f8fc] p-4 text-sm leading-6 text-slate-600">Việc đã trình duyệt vẫn cần trưởng bộ phận xác nhận trước khi được tính là hoàn thành.</div></section></div> : <>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]"><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between"><div><h3 className="font-extrabold text-[#183355]">Tiến độ theo bộ phận</h3><p className="mt-1 text-xs text-slate-500">Số việc đã được duyệt / tổng số việc</p></div><Link href="/admin/report" className="text-xs font-bold text-[#247ead]">Báo cáo <ArrowRight size={13} className="inline" /></Link></div><div className="mt-6 space-y-6">{reports.map(report => { const tasks = periodTasks.filter(task => task.department === report.department); const progress = taskProgress(tasks); return <div key={report.department}><div className="mb-2 flex justify-between text-sm"><div className="font-bold text-slate-700">{departmentName(report.department)} <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${report.status === 'closed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{report.status === 'closed' ? 'Đã chốt' : 'Chưa chốt'}</span></div><span className="font-bold text-[#1a6297]">{progress}%</span></div><Progress value={progress} /></div>; })}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex justify-between"><h3 className="font-extrabold text-[#183355]">Cần chú ý</h3><CircleAlert size={18} className="text-amber-500" /></div><div className="mt-4 space-y-3">{[...visible.filter(task => task.status === 'blocked'), ...due.filter(task => task.status !== 'blocked'), ...review].slice(0, 5).map(task => <button key={task.id} onClick={() => setSelectedTask(task.id)} className="block w-full rounded-xl border border-slate-100 bg-[#fbfcfe] p-3 text-left hover:border-[#c0d9ec]"><p className="truncate text-xs font-bold text-slate-700">{task.title}</p><p className="mt-1 text-[11px] text-slate-500">{departmentName(task.department)} · {task.status === 'blocked' ? 'Đang vướng' : task.status === 'review' ? 'Chờ duyệt' : `Quá hạn ${formatDate(task.dueDate)}`}</p></button>)}{!due.length && !review.length && !visible.some(task => task.status === 'blocked') && <p className="py-5 text-sm text-slate-500">Chưa có điểm nghẽn cần xử lý.</p>}</div></section></div>
    </>}
    {selectedTask && <TaskDetail id={selectedTask} onClose={() => setSelectedTask(null)} />}
  </>;
}

export function ChecklistView() {
  const { state, user, period } = useClose();
  const [newTaskDepartment, setNewTaskDepartment] = useState<DepartmentId | null>(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const tasks = state.tasks.filter(task => task.period === period && canSeeTask(user, task));
  const filtered = tasks.filter(task => (filter === 'all' || task.status === filter) && `${task.title} ${task.description} ${departmentName(task.department)}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))).sort((a, b) => a.step - b.step || a.dueDate.localeCompare(b.dueDate));
  const departments = DEPARTMENTS;
  const manageable = departments.filter(item => canManageDepartment(user, item.id));
  return <><Heading eyebrow="Công việc theo kỳ" title={user.role === 'staff' ? 'Công việc của tôi' : `Theo dõi công việc · ${monthLabel(period)}`} description={user.role === 'staff' ? 'Đánh dấu từng mục, nhập số liệu và trình duyệt khi hoàn tất.' : 'Giao việc cho nhân viên, duyệt kết quả và theo dõi từng bước trong quy trình.'} />
    <div className="mb-5 flex flex-wrap gap-2">{([['all', 'Tất cả'], ['todo', 'Chưa bắt đầu'], ['doing', 'Đang làm'], ['blocked', 'Đang vướng'], ['review', 'Chờ duyệt'], ['done', 'Hoàn thành']] as const).map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-3.5 py-2 text-xs font-bold ${filter === value ? 'bg-[#183b65] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{label}</button>)}</div>
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"><Search size={17} className="text-slate-400" /><input aria-label="Tìm công việc" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm theo tên công việc hoặc bộ phận..." className="w-full border-0 bg-transparent text-sm outline-none" /></div>
    <ChecklistTimeline key={`${period}-${user.id}`} tasks={filtered} allTasks={tasks} period={period} onCreate={setNewTaskDepartment} departments={manageable} />
    {newTaskDepartment && <NewTaskDialog department={newTaskDepartment} onClose={() => setNewTaskDepartment(null)} />}
  </>;
}

export function CalendarView() {
  const { state, user, period } = useClose();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [newTaskDate, setNewTaskDate] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  if (user.role === 'staff') return <AccessDenied />;
  const [year, month] = period.split('-').map(Number);
  const focus = new Date(year, month + offset, 1);
  const viewYear = focus.getFullYear(); const viewMonth = focus.getMonth();
  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const days = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((firstWeekday + days) / 7) * 7 }, (_, index) => index - firstWeekday + 1);
  const tasks = state.tasks.filter(task => task.period === period && canSeeTask(user, task));
  const manageableDepartments = DEPARTMENTS.filter(item => canManageDepartment(user, item.id));
  return <><Heading eyebrow="Dành cho cấp trên" title="Lịch biểu chốt kỳ" description="Xem hạn từng công việc trên lịch. Chọn một công việc để kiểm tra checklist, số liệu và tiến độ. Chọn ngày để tạo công việc mới." action={<div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1"><button onClick={() => setOffset(offset - 1)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Tháng trước"><ChevronLeft size={16} /></button><span className="min-w-[115px] text-center text-sm font-bold">Tháng {String(viewMonth + 1).padStart(2, '0')}/{viewYear}</span><button onClick={() => setOffset(offset + 1)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Tháng sau"><ChevronRight size={16} /></button></div></div>} />
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div><p className="text-xs font-extrabold text-[#183355]">Lịch hạn công việc · Tháng {String(viewMonth + 1).padStart(2, '0')}/{viewYear}</p><p className="mt-0.5 text-[10px] text-slate-400">Công việc thuộc kỳ chốt {monthLabel(period)}</p></div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-500"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Đang làm</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Chờ duyệt</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Hoàn thành</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Đang vướng</span></div>
    </div>
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><div className="min-w-[980px] grid grid-cols-7 border-b border-slate-200 bg-[#f7f9fc]">{['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(day => <div key={day} className="border-r border-slate-100 px-3 py-3 text-center text-xs font-bold text-slate-500 last:border-r-0">{day}</div>)}</div><div className="min-w-[980px] grid grid-cols-7">{cells.map((day, index) => { const date = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const validDay = day >= 1 && day <= days; const dayTasks = validDay ? tasks.filter(task => task.dueDate === date) : []; const currentDay = date === new Date().toISOString().slice(0, 10); return <div key={index} onClick={() => validDay && setNewTaskDate(date)} title={validDay ? 'Nhấn để tạo công việc trong ngày này' : undefined} className={`min-h-[152px] border-b border-r border-slate-100 p-2 last:border-r-0 ${validDay ? 'cursor-pointer hover:bg-sky-50/50' : 'bg-slate-50/70'}`}><div className={`mb-1 grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${currentDay ? 'bg-[#1f73a6] text-white' : 'text-slate-500'}`}>{validDay ? day : ''}</div>{dayTasks.map(task => <button key={task.id} onClick={event => { event.stopPropagation(); setSelectedTask(task.id); }} title={task.title} className={`mb-1 block w-full line-clamp-2 rounded-lg border-l-4 px-2.5 py-2 text-left text-[11px] font-semibold ${task.status === 'done' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : task.status === 'review' ? 'border-amber-500 bg-amber-50 text-amber-800' : task.status === 'blocked' ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-blue-500 bg-blue-50 text-blue-800'}`}>{task.title}</button>)}</div>; })}</div></div>
    {selectedTask && <TaskDetail id={selectedTask} onClose={() => setSelectedTask(null)} />}
    {newTaskDate && <CalendarTaskCreateDialog date={newTaskDate} departments={manageableDepartments} onClose={() => setNewTaskDate(null)} />}
  </>;
}

function CalendarTaskCreateDialog({ date, departments, onClose }: { date: string; departments: typeof DEPARTMENTS; onClose: () => void }) {
  const [department, setDepartment] = useState<DepartmentId | null>(null);
  if (department) return <NewTaskDialog department={department} initialDueDate={date} onClose={onClose} />;
  const options: CustomSelectOption[] = departments.map(item => ({ value: item.id, label: item.name }));
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f2035]/50 p-4"><section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#2585b8]">{formatDate(date)}</p><h3 className="mt-1 text-xl font-extrabold text-[#183355]">Tạo công việc mới</h3></div><button type="button" onClick={onClose} aria-label="Đóng"><X size={20} /></button></div><p className="mb-2 mt-5 text-sm font-semibold text-slate-600">Chọn bộ phận phụ trách</p><CustomSelect ariaLabel="Bộ phận phụ trách" value="" onChange={value => setDepartment(value as DepartmentId)} options={options} className="w-full" buttonClassName="border-slate-200 bg-white" /><div className="mt-5 flex justify-end"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500">Hủy</button></div></section></div>;
}

function ReportCard({ department }: { department: DepartmentId }) {
  const { state, user, period, act } = useClose();
  const report = state.reports.find(item => item.period === period && item.department === department);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  if (!report) return null;
  const tasks = state.tasks.filter(task => task.period === period && task.department === department);
  const metrics = report.status === 'closed' ? report.snapshot ?? [] : reportMetrics(state, period, department);
  const doneTasks = tasks.filter(task => task.status === 'done');
  const waitingApproval = tasks.filter(task => task.status === 'review');
  const blockedTasks = tasks.filter(task => task.status === 'blocked');
  const inProgressTasks = tasks.filter(task => task.status === 'doing');
  const checklistTotal = tasks.reduce((total, task) => total + task.checklist.length, 0);
  const checklistDone = tasks.reduce((total, task) => total + task.checklist.filter(item => item.checked).length, 0);
  const today = new Date().toISOString().slice(0, 10);
  const overdueTasks = tasks.filter(task => task.status !== 'done' && task.status !== 'review' && task.dueDate < today);
  const visibleTasks = [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const canSubmit = canManageDepartment(user, department) && (department !== 'finance' || user.role === 'chief');
  const prerequisite: Partial<Record<DepartmentId, DepartmentId[]>> = { cost: ['warehouse'], finance: ['warehouse', 'cost', 'receivables'] };
  const waiting = (prerequisite[department] ?? []).filter(id => state.reports.find(item => item.period === period && item.department === id)?.status !== 'closed').map(departmentName);
  const ready = tasks.every(task => task.status === 'done') && waiting.length === 0;
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(33,59,91,.035)] transition-shadow hover:shadow-[0_8px_24px_rgba(33,59,91,.07)]"><div className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="mb-2 flex items-center gap-2"><span className="rounded-md bg-[#edf5fa] px-2 py-1 text-[10px] font-extrabold uppercase text-[#2177a7]">{DEPARTMENTS.find(item => item.id === department)?.short}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${report.status === 'closed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{report.status === 'closed' ? 'Đã chốt' : 'Chưa chốt'}</span></div><h3 className="text-lg font-extrabold text-[#183355]">{departmentName(department)}</h3><p className="mt-1 text-xs text-slate-500">{DEPARTMENTS.find(item => item.id === department)?.description}</p></div><div className="text-right"><div className="text-2xl font-extrabold text-[#1d75a6]">{taskProgress(tasks)}%</div><div className="text-xs text-slate-500">{doneTasks.length}/{tasks.length} việc hoàn thành</div></div></div><div className="mt-5"><Progress value={taskProgress(tasks)} /></div>
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between"><h4 className="text-xs font-extrabold text-slate-600">Tình hình công việc</h4><span className="text-[10px] text-slate-400">{checklistDone}/{checklistTotal} mục kiểm tra · {overdueTasks.length} quá hạn</span></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[['Đang làm', inProgressTasks.length, 'bg-blue-50 text-blue-700'], ['Chờ duyệt', waitingApproval.length, 'bg-amber-50 text-amber-700'], ['Đang vướng', blockedTasks.length, 'bg-rose-50 text-rose-700'], ['Chưa bắt đầu', tasks.length - doneTasks.length - inProgressTasks.length - waitingApproval.length - blockedTasks.length, 'bg-slate-100 text-slate-600']].map(([label, count, style]) => <div key={String(label)} className="rounded-xl border border-slate-100 bg-[#fbfcfe] p-3"><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${style}`}>{label}</span><p className="mt-2 text-lg font-extrabold text-[#183355]">{count}</p></div>)}
      </div>
    </div>
    {visibleTasks.length > 0 && <div className="mt-5 border-t border-slate-100 pt-4"><div className="mb-2 flex items-center justify-between"><h4 className="text-xs font-extrabold text-slate-600">Công việc theo hạn</h4><span className="text-[10px] text-slate-400">{tasks.length} công việc</span></div><ul className="divide-y divide-slate-100">{visibleTasks.map(task => <li key={task.id} className="flex items-center justify-between gap-3 py-2.5"><div className="min-w-0"><p className="truncate text-xs font-bold text-[#263d59]">{task.title}</p><p className="mt-1 truncate text-[10px] text-slate-400">{userName(task.assigneeId)} · Hạn {formatDate(task.dueDate)}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${task.status === 'done' ? 'bg-emerald-50 text-emerald-700' : task.status === 'review' ? 'bg-amber-50 text-amber-700' : task.status === 'blocked' ? 'bg-rose-50 text-rose-700' : task.status === 'doing' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{statusLabel[task.status]}</span></li>)}</ul>{tasks.length > visibleTasks.length && <p className="mt-2 text-[10px] text-slate-400">Còn {tasks.length - visibleTasks.length} công việc trong kỳ.</p>}</div>}
    {metrics.length > 0 && <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2"><div className="sm:col-span-2"><h4 className="text-xs font-extrabold text-slate-600">Số liệu đã nhập</h4></div>{metrics.map((metric, index) => <div key={`${metric.label}-${index}`} className="rounded-xl border border-slate-100 bg-[#f7f9fc] p-3"><p className="text-[11px] text-slate-500">{metric.label}</p><p className="mt-1 text-base font-extrabold text-[#183355]">{formatNumber(metric.value)} <span className="text-xs font-medium text-slate-400">{metric.unit}</span></p></div>)}</div>}
    {report.status === 'closed' ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm"><div className="font-bold text-emerald-800">Đã xác nhận lúc {formatDateTime(report.submittedAt)}</div><p className="mt-1 text-xs text-emerald-700">Người chốt: {userName(report.submittedBy ?? '')}</p>{report.note && <p className="mt-2 text-xs text-slate-600">Ghi chú: {report.note}</p>}{canSubmit && <div className="mt-3 flex gap-2"><input value={reason} onChange={event => setReason(event.target.value)} placeholder="Lý do mở lại (bắt buộc)" className="min-w-0 flex-1 rounded-lg border border-emerald-200 px-2 py-1.5 text-xs" /><button onClick={() => { if (act({ type: 'reopen-report', period, department, reason })) setReason(''); }} className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-800">Mở lại</button></div>}</div> : <div className="mt-5 border-t border-slate-100 pt-4"><div className="mb-3 text-xs text-slate-500">{ready ? 'Đã đủ điều kiện để chốt báo cáo.' : `Còn ${tasks.filter(task => task.status !== 'done').length} việc chưa duyệt${waiting.length ? `; chờ báo cáo ${waiting.join(', ')}` : ''}.`}</div>{canSubmit ? <><textarea aria-label={`Ghi chú báo cáo ${departmentName(department)}`} value={note} onChange={event => setNote(event.target.value)} placeholder="Ghi chú khi chốt báo cáo (nếu có)..." rows={2} className="mb-3 w-full rounded-xl border border-slate-200 p-3 text-sm" /><button disabled={!ready} onClick={() => { if (act({ type: 'close-report', period, department, note })) setNote(''); }} className="inline-flex items-center gap-2 rounded-xl bg-[#183b65] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><LockKeyhole size={14} /> Xác nhận chốt báo cáo</button></> : <div className="text-xs text-slate-500">Báo cáo tài chính do kế toán trưởng xác nhận.</div>}</div>}
  </div></section>;
}

export function ReportsView() {
  const { user, period, state } = useClose();
  const [filter, setFilter] = useState<ReportViewFilter>({ department: 'all', status: 'all', query: '' });
  const [notice, setNotice] = useState('');
  const savedFilter = useSyncExternalStore(
    listener => subscribeSavedReportFilter(user.id, listener),
    () => getSavedReportFilter(user.id),
    () => null,
  );
  if (user.role === 'staff') return <AccessDenied />;
  const reports = state.reports.filter(report => report.period === period);
  const periodTasks = state.tasks.filter(task => task.period === period);
  const closedReports = reports.filter(report => report.status === 'closed').length;
  const departments = DEPARTMENTS.filter(item => {
    const report = reports.find(entry => entry.department === item.id);
    return (filter.department === 'all' || item.id === filter.department)
      && (!report || filter.status === 'all' || report.status === filter.status)
      && `${item.name} ${item.description}`.toLocaleLowerCase('vi').includes(filter.query.toLocaleLowerCase('vi'));
  });
  const applySavedFilter = () => { if (savedFilter) setFilter(savedFilter); };
  const departmentOptions: CustomSelectOption[] = [{ value: 'all', label: 'Tất cả bộ phận' }, ...DEPARTMENTS.map(item => ({ value: item.id, label: item.name }))];
  const statusOptions: CustomSelectOption[] = [{ value: 'all', label: 'Mọi trạng thái' }, { value: 'open', label: 'Chưa chốt' }, { value: 'closed', label: 'Đã chốt' }];
  return <><Heading eyebrow="Báo cáo theo bộ phận" title={`Số liệu chốt ${monthLabel(period)}`} description="Theo dõi tiến độ, số liệu và trạng thái chốt của từng bộ phận." />
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 size={18} /></span><div><p className="text-[11px] font-semibold text-slate-500">Báo cáo đã chốt</p><p className="mt-0.5 text-lg font-extrabold text-[#183355]">{closedReports}<span className="ml-1 text-sm font-semibold text-slate-400">/ {reports.length}</span></p></div></div>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><CircleAlert size={18} /></span><div><p className="text-[11px] font-semibold text-slate-500">Cần xử lý</p><p className="mt-0.5 text-lg font-extrabold text-[#183355]">{reports.length - closedReports}</p></div></div>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><ListChecks size={18} /></span><div><p className="text-[11px] font-semibold text-slate-500">Tiến độ công việc</p><p className="mt-0.5 text-lg font-extrabold text-[#183355]">{taskProgress(periodTasks)}%</p></div></div>
    </div>
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_2px_10px_rgba(33,59,91,.025)]">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5"><Search size={16} className="shrink-0 text-slate-400" /><input aria-label="Tìm báo cáo" value={filter.query} onChange={event => setFilter({ ...filter, query: event.target.value })} placeholder="Tìm bộ phận hoặc nội dung báo cáo..." className="w-full border-0 bg-transparent text-xs outline-none" /></div>
        <CustomSelect ariaLabel="Lọc bộ phận" value={filter.department} onChange={value => setFilter({ ...filter, department: value as ReportViewFilter['department'] })} options={departmentOptions} className="w-full sm:w-56" buttonClassName="border-slate-200 bg-white" />
        <CustomSelect ariaLabel="Lọc trạng thái báo cáo" value={filter.status} onChange={value => setFilter({ ...filter, status: value as ReportViewFilter['status'] })} options={statusOptions} className="w-full sm:w-44" buttonClassName="border-slate-200 bg-white" />
        <button onClick={() => { saveReportFilter(user.id, filter); setNotice('Đã lưu bộ lọc cho tài khoản này.'); window.setTimeout(() => setNotice(''), 2500); }} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"><Save size={14} /><span>Lưu bộ lọc</span></button>
        {savedFilter && <button onClick={applySavedFilter} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#eaf3fa] px-3 py-2.5 text-xs font-bold text-[#246d98] hover:bg-[#dcecf7]"><Send size={13} /><span>Áp dụng đã lưu</span></button>}
      </div>
      <p className="mt-2 px-1 text-[10px] text-slate-400">Hiển thị {departments.length} / {DEPARTMENTS.length} bộ phận{savedFilter ? ' · Có bộ lọc đã lưu' : ''}</p>
    </div>
    <div className="mb-3 flex items-center justify-between text-[11px] text-slate-500"><span>{departments.length} báo cáo phù hợp</span>{savedFilter && <span>Bộ lọc đã lưu theo tài khoản</span>}</div>
    {departments.length ? <div className="grid gap-5 xl:grid-cols-2">{departments.map(item => <ReportCard key={item.id} department={item.id} />)}</div> : <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Không có báo cáo phù hợp với bộ lọc.</div>}
    {notice && <div role="status" className="fixed bottom-5 right-5 z-50 rounded-xl bg-[#183b65] px-4 py-3 text-xs font-bold text-white shadow-lg">{notice}</div>}
  </>;
}

export function AuditView({ embedded = false }: { embedded?: boolean }) {
  const { state, user, period } = useClose();
  const [query, setQuery] = useState('');
  const logs = state.audit.filter(entry => entry.period === period && (user.role === 'chief' || user.role === 'manager' && entry.department === user.department || user.role === 'staff' && entry.targetType === 'task' && state.tasks.find(task => task.id === entry.targetId)?.assigneeId === user.id)).filter(entry => `${entry.action} ${entry.detail} ${userName(entry.actorId)}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')));
  return <>{!embedded && <Heading eyebrow="Truy vết thao tác" title="Nhật ký công việc & báo cáo" description="Mỗi lần giao việc, cập nhật checklist, nhập số liệu, duyệt và chốt báo cáo đều được ghi cùng thời điểm và người thực hiện." />}<div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"><Search size={17} className="text-slate-400" /><input aria-label="Tìm nhật ký" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm hành động, người thực hiện, nội dung..." className="w-full border-0 bg-transparent text-sm outline-none" /></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="hidden grid-cols-[150px_1fr_180px_170px] gap-4 border-b border-slate-100 bg-[#f8fafc] px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 md:grid"><span>Thời gian</span><span>Hoạt động</span><span>Người thực hiện</span><span>Bộ phận</span></div>{logs.map(entry => <div key={entry.id} className="grid gap-1 border-b border-slate-100 px-5 py-4 text-xs last:border-b-0 md:grid-cols-[150px_1fr_180px_170px] md:gap-4"><span className="text-slate-500">{formatDateTime(entry.at)}</span><div><p className="font-bold text-[#183355]">{entry.action}</p><p className="mt-1 leading-5 text-slate-500">{entry.detail}</p></div><span className="font-semibold text-slate-700">{userName(entry.actorId)}</span><span className="text-slate-500">{entry.department ? departmentName(entry.department) : 'Toàn hệ thống'}</span></div>)}{!logs.length && <div className="p-12 text-center text-sm text-slate-500">Chưa có thao tác phù hợp trong kỳ này.</div>}</div></>;
}

export function AccessDenied() {
  return <div className="mx-auto mt-20 max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#edf5fa] text-[#277cac]"><LockKeyhole size={25} /></div><h2 className="text-xl font-extrabold text-[#183355]">Màn hình dành cho cấp trên</h2><p className="mt-2 text-sm leading-6 text-slate-500">Nhân viên chỉ xem và cập nhật các công việc được giao. Lịch biểu và báo cáo bộ phận thuộc quyền theo dõi của người quản lý.</p><Link href="/admin/checklist" className="mt-5 inline-block rounded-xl bg-[#183b65] px-4 py-2.5 text-sm font-bold text-white">Đến công việc của tôi</Link></div>;
}
