'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, BookOpenCheck, Boxes, Calculator, Check, ChevronDown, CircleHelp, GitBranch, History, Landmark, Link2, ListChecks, Plus, Search, Settings2, ShieldCheck, Trash2, Workflow, X } from 'lucide-react';
import { useClose } from '../close/CloseContext';
import { AccessDenied } from '../close/CloseUI';
import { DEPARTMENTS, RECURRENCE_LABEL, USERS, WEEKDAYS, monthLabel, recurrenceText, type DepartmentId } from '../close/model';
import { allWorkflowTasks, groupDepartment, taskDepartment, publishedWorkflow, type Recurrence, INITIAL_WORKFLOW_CONFIG, WorkflowAuditEntry, WorkflowBinding, WorkflowConfig, WorkflowGroup, WorkflowTask } from './config';
import { commitWorkflowConfig, getWorkflowServerSnapshot, getWorkflowSnapshot, subscribeWorkflow } from './store';

type Tab = 'groups' | 'bindings' | 'audit';
type GroupDraft = { id: string | null; name: string; department: DepartmentId; dependsOnGroupIds: string[] };
type TaskDraft = { groupId: string; id: string | null; title: string; dependsOnTaskIds: string[]; assigneeId: string; department: DepartmentId; dueDay: number | 'last'; checklist: string; recurrence: Recurrence };
const DAY_OPTIONS: (number | 'last')[] = [...Array.from({ length: 31 }, (_, index) => index + 1), 'last'];
const staffOf = (department: DepartmentId) => USERS.filter(user => user.role === 'staff' && user.department === department);
type BindingDraft = Omit<WorkflowBinding, 'id'> & { id?: string };

const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition';
const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#2e80af] focus:ring-2 focus:ring-sky-100';
const panelClass = 'rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(25,55,87,.035)]';
const makeId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)}`;
const formatDateTime = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const taskNumber = (groupIndex: number, taskIndex: number) => `${groupIndex + 1}.${taskIndex + 1}`;
const DEPARTMENT_ICONS = { warehouse: Boxes, cost: Calculator, receivables: Landmark, finance: BookOpenCheck };

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-[#247ca8]' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} /></button>;
}

function Modal({ title, eyebrow, children, onClose, onSubmit, submitLabel }: { title: string; eyebrow: string; children: React.ReactNode; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; submitLabel: string }) {
  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#0f2035]/45 p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><form onSubmit={onSubmit} className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 px-6 py-5"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#2585b8]">{eyebrow}</p><h3 className="mt-1 text-xl font-extrabold text-[#183355]">{title}</h3></div><button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={19} /></button></div><div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">{children}</div><div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4"><button type="button" onClick={onClose} className={`${buttonClass} border border-slate-200 text-slate-600 hover:bg-slate-50`}>Hủy</button><button type="submit" className={`${buttonClass} bg-[#183b65] px-5 text-white hover:bg-[#102d52]`}>{submitLabel}</button></div></form></div>;
}

function ConfigSummary({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div className={`${panelClass} flex items-center gap-3.5 p-4`}><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5fb] text-[#2878aa]">{icon}</span><div><p className="text-2xl font-extrabold leading-none text-[#183355]">{value}</p><p className="mt-1 text-[11px] font-semibold text-slate-500">{label}</p></div></div>;
}

function hasCycle(graph: Record<string, string[]>) {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const dependency of graph[id] ?? []) if (graph[dependency] && visit(dependency)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return Object.keys(graph).some(visit);
}

export default function WorkflowConfiguration() {
  const { user, period, state, act } = useClose();
  const [tab, setTab] = useState<Tab>('groups');
  const config = useSyncExternalStore(subscribeWorkflow, getWorkflowSnapshot, getWorkflowServerSnapshot);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(INITIAL_WORKFLOW_CONFIG.groups.map(group => group.id));
  const [groupDraft, setGroupDraft] = useState<GroupDraft | null>(null);
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);
  const [bindingDraft, setBindingDraft] = useState<BindingDraft | null>(null);
  const [bindingKindFilter, setBindingKindFilter] = useState<'all' | 'voucher' | 'report'>('all');
  const [bindingSearch, setBindingSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [toast, setToast] = useState('');

  const flatTasks = useMemo(() => allWorkflowTasks(config.groups), [config.groups]);
  const enabledBindings = config.bindings.filter(binding => binding.enabled).length;
  const visibleBindings = config.bindings.filter(binding => (bindingKindFilter === 'all' || binding.kind === bindingKindFilter) && `${binding.module} ${binding.controller} ${binding.screen} ${binding.buttonLabel}`.toLocaleLowerCase('vi').includes(bindingSearch.toLocaleLowerCase('vi')));
  const visibleAudit = config.audit.filter(entry => `${entry.action} ${entry.detail} ${entry.actor}`.toLocaleLowerCase('vi').includes(auditSearch.toLocaleLowerCase('vi')));

  const saveChange = (action: string, detail: string, update: (current: WorkflowConfig) => Pick<WorkflowConfig, 'groups' | 'bindings'>) => {
    const changed = update(config);
    const entry: WorkflowAuditEntry = { id: makeId('audit'), at: new Date().toISOString(), actor: user.name, action, detail };
    commitWorkflowConfig({ ...config, ...changed, audit: [entry, ...config.audit] });
    setToast('Đã lưu cấu hình và ghi nhật ký.');
    window.setTimeout(() => setToast(''), 2600);
  };

  const openNewGroup = () => setGroupDraft({ id: null, name: '', department: 'finance', dependsOnGroupIds: [] });
  const saveGroup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupDraft?.name.trim()) return;
    const id = groupDraft.id ?? makeId('group');
    const graph = Object.fromEntries(config.groups.map(group => [group.id, group.id === id ? groupDraft.dependsOnGroupIds : group.dependsOnGroupIds]));
    if (!config.groups.some(group => group.id === id)) graph[id] = groupDraft.dependsOnGroupIds;
    if (hasCycle(graph)) { setToast('Phụ thuộc nhóm đang tạo thành vòng lặp.'); window.setTimeout(() => setToast(''), 2600); return; }
    const exists = config.groups.some(group => group.id === id);
    saveChange(exists ? 'Sửa nhóm công việc' : 'Thêm nhóm công việc', `${groupDraft.name.trim()} · ${groupDraft.dependsOnGroupIds.length ? `chờ ${groupDraft.dependsOnGroupIds.map(dependency => config.groups.find(group => group.id === dependency)?.name).filter(Boolean).join(', ')}` : 'không phụ thuộc nhóm trước'}`, current => ({ ...current, groups: exists
      ? current.groups.map(group => group.id === id ? { ...group, name: groupDraft.name.trim(), department: groupDraft.department, dependsOnGroupIds: groupDraft.dependsOnGroupIds } : group)
      : [...current.groups, { id, name: groupDraft.name.trim(), department: groupDraft.department, dependsOnGroupIds: groupDraft.dependsOnGroupIds, tasks: [] }] }));
    if (!exists) setExpandedGroups(items => [...items, id]);
    setGroupDraft(null);
  };

  const deleteGroup = (group: WorkflowGroup) => {
    if (!window.confirm(`Xóa nhóm “${group.name}” cùng ${group.tasks.length} công việc và các liên kết thao tác?`)) return;
    const removedTaskIds = group.tasks.map(item => item.id);
    saveChange('Xóa nhóm công việc', `${group.name} · ${group.tasks.length} công việc`, current => ({
      ...current,
      groups: current.groups.filter(item => item.id !== group.id).map(item => ({ ...item, dependsOnGroupIds: item.dependsOnGroupIds.filter(id => id !== group.id), tasks: item.tasks.map(taskItem => ({ ...taskItem, dependsOnTaskIds: taskItem.dependsOnTaskIds.filter(id => !removedTaskIds.includes(id)) })) })),
      bindings: current.bindings.filter(binding => !removedTaskIds.includes(binding.taskId)),
    }));
  };

  const moveGroup = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= config.groups.length) return;
    const next = [...config.groups];
    [next[index], next[target]] = [next[target], next[index]];
    saveChange('Đổi thứ tự nhóm', `${next[target].name} chuyển vị trí ${target + 1}`, current => ({ ...current, groups: next }));
  };

  const saveTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!taskDraft?.title.trim()) return;
    const group = config.groups.find(item => item.id === taskDraft.groupId);
    if (!group) return;
    const id = taskDraft.id ?? makeId('task');
    const fields = { title: taskDraft.title.trim(), dependsOnTaskIds: taskDraft.dependsOnTaskIds, assigneeId: taskDraft.assigneeId, department: taskDraft.department, dueDay: taskDraft.dueDay, recurrence: taskDraft.recurrence.freq === 'none' ? undefined : taskDraft.recurrence, checklist: taskDraft.checklist.split('\n').map(label => label.trim()).filter(Boolean) };
    if (!fields.checklist.length) { setToast('Cần ít nhất một mục checklist.'); return; }
    const nextTasks = group.tasks.map(item => item.id === id ? { ...item, ...fields } : item);
    if (!group.tasks.some(item => item.id === id)) nextTasks.push({ id, ...fields });
    if (hasCycle(Object.fromEntries(nextTasks.map(item => [item.id, item.dependsOnTaskIds])))) { setToast('Phụ thuộc công việc đang tạo thành vòng lặp.'); window.setTimeout(() => setToast(''), 2600); return; }
    const exists = group.tasks.some(item => item.id === id);
    saveChange(exists ? 'Sửa công việc' : 'Thêm công việc', `${group.name} · ${taskDraft.title.trim()}`, current => ({ ...current, groups: current.groups.map(item => item.id === group.id ? { ...item, tasks: nextTasks } : item) }));
    if (!exists) setExpandedGroups(items => items.includes(group.id) ? items : [...items, group.id]);
    setTaskDraft(null);
  };

  const deleteTask = (group: WorkflowGroup, item: WorkflowTask) => {
    if (!window.confirm(`Xóa công việc “${item.title}” và các liên kết thao tác?`)) return;
    saveChange('Xóa công việc', `${group.name} · ${item.title}`, current => ({
      ...current,
      groups: current.groups.map(candidate => ({ ...candidate, tasks: candidate.tasks.filter(taskItem => taskItem.id !== item.id).map(taskItem => ({ ...taskItem, dependsOnTaskIds: taskItem.dependsOnTaskIds.filter(id => id !== item.id) })) })),
      bindings: current.bindings.filter(binding => binding.taskId !== item.id),
    }));
  };

  const moveTask = (group: WorkflowGroup, index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= group.tasks.length) return;
    const tasks = [...group.tasks];
    [tasks[index], tasks[target]] = [tasks[target], tasks[index]];
    saveChange('Đổi thứ tự công việc', `${group.name} · ${tasks[target].title} chuyển vị trí ${target + 1}`, current => ({ ...current, groups: current.groups.map(item => item.id === group.id ? { ...item, tasks } : item) }));
  };

  const saveBinding = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bindingDraft?.module.trim() || !bindingDraft.controller.trim() || !bindingDraft.screen.trim() || !bindingDraft.buttonLabel.trim() || !bindingDraft.taskId) return;
    const id = bindingDraft.id ?? makeId('binding');
    const nextBinding = { ...bindingDraft, id, module: bindingDraft.module.trim(), controller: bindingDraft.controller.trim(), screen: bindingDraft.screen.trim(), buttonLabel: bindingDraft.buttonLabel.trim() } as WorkflowBinding;
    const exists = config.bindings.some(item => item.id === id);
    saveChange(exists ? 'Sửa liên kết thao tác' : 'Thêm liên kết thao tác', `${nextBinding.module} · ${nextBinding.controller} · ${nextBinding.buttonLabel}`, current => ({ ...current, bindings: exists ? current.bindings.map(item => item.id === id ? nextBinding : item) : [...current.bindings, nextBinding] }));
    setBindingDraft(null);
  };

  const removeBinding = (binding: WorkflowBinding) => {
    saveChange('Xóa liên kết thao tác', `${binding.module} · ${binding.controller} · ${binding.buttonLabel}`, current => ({ ...current, bindings: current.bindings.filter(item => item.id !== binding.id) }));
  };

  const toggleBinding = (binding: WorkflowBinding) => saveChange(binding.enabled ? 'Tạm tắt liên kết' : 'Bật liên kết', `${binding.module} · ${binding.controller} · ${binding.buttonLabel}`, current => ({ ...current, bindings: current.bindings.map(item => item.id === binding.id ? { ...item, enabled: !item.enabled } : item) }));

  const published = publishedWorkflow(config);
  const draftChanged = JSON.stringify(config.groups) !== JSON.stringify(published.groups);
  const applied = state.workflows?.[period];
  const needsPublish = !config.published || draftChanged || JSON.stringify(applied?.groups) !== JSON.stringify(config.groups);
  const publish = () => {
    const revision = draftChanged || !config.published ? published.revision + 1 : published.revision;
    if (!act({ type: 'publish-workflow', period, groups: config.groups, revision })) return;
    const entry: WorkflowAuditEntry = { id: makeId('audit'), at: new Date().toISOString(), actor: user.name, action: 'Chốt quy trình', detail: `Bản ${revision} · ${config.groups.length} nhóm · ${flatTasks.length} công việc · ${monthLabel(period)}` };
    commitWorkflowConfig({ ...config, published: { revision, groups: structuredClone(config.groups) }, audit: [entry, ...config.audit] });
    setToast('Đã chốt quy trình và đồng bộ Tổng quan, Công việc.');
    window.setTimeout(() => setToast(''), 3000);
  };
  const openTask = (group: WorkflowGroup, item?: WorkflowTask) => {
    setTaskDraft({ groupId: group.id, id: item?.id ?? null, title: item?.title ?? '',
      dependsOnTaskIds: item?.dependsOnTaskIds ?? (group.tasks.length ? [group.tasks[group.tasks.length - 1].id] : []),
      department: item ? taskDepartment(group, item) : groupDepartment(group),
      assigneeId: item?.assigneeId ?? staffOf(item ? taskDepartment(group, item) : groupDepartment(group))[0].id,
      recurrence: item?.recurrence ?? { freq: 'none' },
      dueDay: item?.dueDay ?? config.groups.indexOf(group) + (item ? group.tasks.indexOf(item) : group.tasks.length) + 1,
      checklist: item?.checklist?.join('\n') ?? item?.title ?? '',
    });
  };

  if (user.role !== 'chief') return <AccessDenied />;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'groups', label: 'Nhóm công việc', icon: <ListChecks size={16} /> },
    { id: 'bindings', label: 'Gắn thao tác', icon: <Link2 size={16} /> },
    { id: 'audit', label: 'Nhật ký cấu hình', icon: <History size={16} /> },
  ];

  return <div className="mx-auto max-w-[1420px]">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#2585b8]"><Workflow size={14} /> Điều hành quy trình</div><h2 className="text-2xl font-extrabold tracking-tight text-[#183355] sm:text-[29px]">Khai báo quy trình công việc</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Tùy chỉnh nhóm, thứ tự thực hiện và điểm kích hoạt từ voucher hoặc báo cáo cho công ty hiện tại.</p></div><div className="inline-flex items-center gap-2 rounded-xl border border-[#dce8f3] bg-white px-3.5 py-2.5 text-xs font-bold text-[#315778]"><ShieldCheck size={16} className="text-[#2c7ba5]" /> Phạm vi: Công ty hiện tại</div></div>

    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3"><div><p className="text-xs font-bold text-[#215b8e]">{needsPublish ? 'Bản nháp chưa chốt' : `Đang áp dụng bản ${applied?.revision ?? published.revision}`}</p><p className="mt-1 text-[11px] text-slate-500">Chốt để sinh nhóm, checklist và luồng phụ thuộc cho {monthLabel(period).toLowerCase()}. Kỳ mới dùng bản đã chốt gần nhất.</p></div><button onClick={publish} disabled={!needsPublish} className={`${buttonClass} bg-[#183b65] text-white hover:bg-[#102d52] disabled:opacity-40`}><Check size={15} /> Chốt & sinh công việc</button></div>
    <div className="mb-6 grid gap-3 sm:grid-cols-3"><ConfigSummary label="Nhóm công việc" value={config.groups.length} icon={<Workflow size={19} />} /><ConfigSummary label="Đầu việc đã khai báo" value={flatTasks.length} icon={<ListChecks size={19} />} /><ConfigSummary label="Liên kết đang bật" value={enabledBindings} icon={<Link2 size={19} />} /></div>

    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200">{tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition ${tab === item.id ? 'border-[#267da9] text-[#1d6892]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{item.icon}{item.label}{item.id === 'audit' && config.audit.length > 0 && <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">{config.audit.length}</span>}</button>)}</div>

    {tab === 'groups' && <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-extrabold text-[#183355]">Luồng nhóm và công việc</h3><p className="mt-1 text-xs text-slate-500">Mỗi nhóm có thể chờ một hoặc nhiều nhóm khác; từng đầu việc có phụ thuộc riêng.</p></div><button onClick={openNewGroup} className={`${buttonClass} bg-[#183b65] text-white hover:bg-[#102d52]`}><Plus size={15} /> Thêm nhóm</button></div>
      <div className="space-y-3">{config.groups.map((group, groupIndex) => {
        const expanded = expandedGroups.includes(group.id);
        const GroupIcon = DEPARTMENT_ICONS[groupDepartment(group)];
        const previousGroups = group.dependsOnGroupIds.map(id => config.groups.find(item => item.id === id)?.name).filter(Boolean);
        return <article key={group.id} className={`${panelClass} overflow-hidden`}>
          <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5"><button aria-label={`${expanded ? 'Thu gọn' : 'Mở'} nhóm ${group.name}`} onClick={() => setExpandedGroups(items => expanded ? items.filter(id => id !== group.id) : [...items, group.id])} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf4fa] text-[#286e9a]"><ChevronDown size={17} className={expanded ? '' : '-rotate-90'} /></button><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#173f75] text-sm font-extrabold text-white">{String(groupIndex + 1).padStart(2, '0')}</span><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eaf3fa] text-[#2679a7]"><GroupIcon size={18} /></span><div className="min-w-[170px] flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-extrabold text-[#183355]">{group.name}</h4><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{group.tasks.length} đầu việc</span></div><p className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">{previousGroups.length ? <><GitBranch size={12} /> Sau nhóm {previousGroups.join(' · ')}</> : 'Không chờ nhóm khác'}</p></div><div className="flex items-center gap-1"><button onClick={() => moveGroup(groupIndex, -1)} disabled={groupIndex === 0} aria-label="Chuyển nhóm lên" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={15} /></button><button onClick={() => moveGroup(groupIndex, 1)} disabled={groupIndex === config.groups.length - 1} aria-label="Chuyển nhóm xuống" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={15} /></button><button onClick={() => setGroupDraft({ id: group.id, name: group.name, department: groupDepartment(group), dependsOnGroupIds: group.dependsOnGroupIds })} aria-label="Sửa nhóm" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#286e9a]"><Settings2 size={16} /></button><button onClick={() => deleteGroup(group)} aria-label="Xóa nhóm" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button></div></div>
          {expanded && <div className="border-t border-slate-100 bg-[#fbfcfe] px-4 py-3 sm:px-5"><div className="mb-2 grid grid-cols-[54px_minmax(0,1fr)_auto] gap-3 px-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-400"><span>STT</span><span>Đầu việc và điều kiện bắt đầu</span><span>Thao tác</span></div>
            {group.tasks.map((item, taskIndex) => {
              const required = item.dependsOnTaskIds.map(id => group.tasks.find(taskItem => taskItem.id === id)?.title).filter(Boolean);
              return <div key={item.id} className="group/task grid grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 px-2 py-3 first:border-t-0"><div className="flex items-center gap-2"><span className="text-xs font-extrabold tabular-nums text-[#42678c]">{taskNumber(groupIndex, taskIndex)}</span>{taskIndex < group.tasks.length - 1 && <ArrowRight size={13} className="text-slate-300" />}</div><div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white text-[#3680a8] shadow-sm"><ListChecks size={13} /></span><p className="truncate text-xs font-bold leading-5 text-slate-700">{item.title}</p></div><p className="mt-1 truncate text-[10px] text-slate-400">{[DEPARTMENTS.find(department => department.id === taskDepartment(group, item))?.short, recurrenceText(item), required.length ? `Bắt đầu sau: ${required.join(', ')}` : 'Có thể bắt đầu ngay khi nhóm được mở'].filter(Boolean).join(' · ')}</p></div><div className="flex items-center gap-0.5 opacity-70 transition group-hover/task:opacity-100"><button onClick={() => moveTask(group, taskIndex, -1)} disabled={taskIndex === 0} aria-label="Chuyển công việc lên" className="rounded-md p-1.5 text-slate-400 hover:bg-white disabled:opacity-30"><ArrowUp size={13} /></button><button onClick={() => moveTask(group, taskIndex, 1)} disabled={taskIndex === group.tasks.length - 1} aria-label="Chuyển công việc xuống" className="rounded-md p-1.5 text-slate-400 hover:bg-white disabled:opacity-30"><ArrowDown size={13} /></button><button onClick={() => openTask(group, item)} aria-label="Sửa công việc" className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-[#286e9a]"><Settings2 size={14} /></button><button onClick={() => deleteTask(group, item)} aria-label="Xóa công việc" className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={13} /></button></div></div>;
            })}
            <button onClick={() => openTask(group)} className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-bold text-[#247ca8] hover:bg-[#edf5fa]"><Plus size={14} /> Thêm đầu việc</button>
          </div>}
        </article>;
      })}</div>
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#dce8f3] bg-[#f6faff] p-3.5 text-[11px] leading-5 text-slate-600"><CircleHelp size={15} className="mt-0.5 shrink-0 text-[#4382a9]" /><p>Thứ tự hiển thị dùng để đánh số nhóm và đầu việc. Điều kiện phụ thuộc mới quyết định công việc nào được mở trước; có thể cho nhiều nhóm chạy song song bằng cách không khai báo phụ thuộc.</p></div>
    </section>}

    {tab === 'bindings' && <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-sm font-extrabold text-[#183355]">Điểm kích hoạt trong Arito ERP</h3><p className="mt-1 text-xs text-slate-500">Khai báo theo module, controller và màn hình; một màn báo cáo có thể có cả hai thao tác.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setBindingDraft({ kind: 'voucher', module: '', controller: '', screen: '', action: 'submit', buttonLabel: 'Gửi duyệt', taskId: flatTasks[0]?.id ?? '', enabled: true })} className={`${buttonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}><Plus size={14} /> Gắn nút voucher</button><button onClick={() => setBindingDraft({ kind: 'report', module: '', controller: '', screen: '', action: 'submit', buttonLabel: 'Gửi thao tác', taskId: flatTasks[0]?.id ?? '', enabled: true })} className={`${buttonClass} bg-[#183b65] text-white hover:bg-[#102d52]`}><Plus size={14} /> Gắn thao tác báo cáo</button></div></div>
      <div className={`${panelClass} mb-4 flex flex-wrap items-center gap-3 p-3`}><div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"><Search size={15} className="text-slate-400" /><input aria-label="Tìm liên kết" value={bindingSearch} onChange={event => setBindingSearch(event.target.value)} placeholder="Tìm module, controller, màn hình..." className="w-full border-0 bg-transparent text-xs outline-none" /></div><div className="flex rounded-lg bg-slate-100 p-1">{(['all', 'voucher', 'report'] as const).map(filter => <button key={filter} onClick={() => setBindingKindFilter(filter)} className={`rounded-md px-3 py-1.5 text-[10px] font-bold ${bindingKindFilter === filter ? 'bg-white text-[#1c5e87] shadow-sm' : 'text-slate-500'}`}>{filter === 'all' ? 'Tất cả' : filter === 'voucher' ? 'Voucher' : 'Báo cáo'}</button>)}</div></div>
      <div className="space-y-2">{visibleBindings.map(binding => {
        const taskInfo = flatTasks.find(item => item.id === binding.taskId);
        return <article key={binding.id} className={`${panelClass} flex flex-wrap items-center gap-3 p-4`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${binding.kind === 'voucher' ? 'bg-[#eff5ff] text-[#426ca1]' : 'bg-[#f0f7f4] text-[#3c866b]'}`}>{binding.kind === 'voucher' ? <Check size={18} /> : <ListChecks size={18} />}</span><div className="min-w-[180px] flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="text-xs font-extrabold text-[#183355]">{binding.screen}</h4><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${binding.kind === 'voucher' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>{binding.kind === 'voucher' ? 'Voucher' : 'Báo cáo'}</span></div><p className="mt-1 text-[10px] text-slate-500">{binding.module} <span className="mx-1 text-slate-300">/</span> <code className="text-[10px] text-slate-600">{binding.controller}</code></p><p className="mt-1 truncate text-[10px] text-slate-400">Liên kết tới: {taskInfo ? `${taskInfo.groupName} · ${taskInfo.title}` : 'Đầu việc đã bị xóa'}</p></div><span className="min-w-[105px] rounded-lg border border-slate-200 bg-[#fafbfd] px-3 py-2 text-center text-[10px] font-extrabold text-[#365b7d]">{binding.buttonLabel}</span>{binding.kind === 'report' && <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">{binding.action === 'save-filter' ? 'Lưu filter' : 'Submit'}</span>}<div className="flex items-center gap-1.5"><Toggle checked={binding.enabled} onChange={() => toggleBinding(binding)} label={`${binding.enabled ? 'Tắt' : 'Bật'} ${binding.buttonLabel}`} /><button onClick={() => setBindingDraft({ ...binding })} aria-label="Sửa liên kết" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#286e9a]"><Settings2 size={15} /></button><button onClick={() => removeBinding(binding)} aria-label="Xóa liên kết" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={14} /></button></div></article>;
      })}{!visibleBindings.length && <div className={`${panelClass} p-12 text-center text-sm text-slate-500`}>Không có liên kết phù hợp.</div>}</div>
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[11px] leading-5 text-amber-900"><CircleHelp size={15} className="mt-0.5 shrink-0" /><p>Cấu hình này mô phỏng điểm móc nối. Để nút thật gọi đúng thao tác trong từng controller, backend ERP cần phát sự kiện tương ứng và kiểm tra quyền ở máy chủ.</p></div>
    </section>}

    {tab === 'audit' && <section><div className="mb-4"><h3 className="text-sm font-extrabold text-[#183355]">Lịch sử thay đổi khai báo</h3><p className="mt-1 text-xs text-slate-500">Ghi người thay đổi, thời điểm và nội dung cấu hình đã lưu trên trình duyệt này.</p></div><div className={`${panelClass} mb-3 flex items-center gap-2 px-3 py-2.5`}><Search size={15} className="text-slate-400" /><input aria-label="Tìm nhật ký cấu hình" value={auditSearch} onChange={event => setAuditSearch(event.target.value)} placeholder="Tìm nội dung hoặc người thực hiện..." className="w-full border-0 bg-transparent text-xs outline-none" /></div><div className={`${panelClass} overflow-hidden`}><div className="hidden grid-cols-[170px_190px_190px_minmax(0,1fr)] gap-4 border-b border-slate-100 bg-[#f8fafc] px-5 py-3 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 md:grid"><span>Thời điểm</span><span>Thao tác</span><span>Người thực hiện</span><span>Chi tiết</span></div>{visibleAudit.map(entry => <div key={entry.id} className="grid gap-1 border-b border-slate-100 px-5 py-4 text-xs last:border-b-0 md:grid-cols-[170px_190px_190px_minmax(0,1fr)] md:gap-4"><span className="text-slate-500">{formatDateTime(entry.at)}</span><span className="font-bold text-[#183355]">{entry.action}</span><span className="font-semibold text-slate-600">{entry.actor}</span><span className="leading-5 text-slate-500">{entry.detail}</span></div>)}{!visibleAudit.length && <div className="p-12 text-center"><History size={23} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">{config.audit.length ? 'Không tìm thấy thay đổi phù hợp' : 'Chưa có thay đổi nào'}</p><p className="mt-1 text-xs text-slate-400">Mọi lần thêm, sửa, xóa hoặc bật tắt đều sẽ được ghi tại đây.</p></div>}</div></section>}

    {groupDraft && <Modal eyebrow="Cấu trúc quy trình" title={groupDraft.id ? 'Sửa nhóm công việc' : 'Thêm nhóm công việc'} onClose={() => setGroupDraft(null)} onSubmit={saveGroup} submitLabel="Lưu nhóm"><label className="block text-xs font-bold text-slate-600">Tên nhóm<input autoFocus required value={groupDraft.name} onChange={event => setGroupDraft({ ...groupDraft, name: event.target.value })} placeholder="Ví dụ: Nhân sự" className={inputClass} /></label><fieldset><legend className="text-xs font-bold text-slate-600">Chỉ mở nhóm sau khi các nhóm này hoàn tất</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{config.groups.filter(group => group.id !== groupDraft.id).map(group => <label key={group.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-600"><input type="checkbox" checked={groupDraft.dependsOnGroupIds.includes(group.id)} onChange={event => setGroupDraft({ ...groupDraft, dependsOnGroupIds: event.target.checked ? [...groupDraft.dependsOnGroupIds, group.id] : groupDraft.dependsOnGroupIds.filter(id => id !== group.id) })} className="accent-[#267da9]" />{group.name}</label>)}</div>{!config.groups.length && <p className="mt-2 text-xs text-slate-400">Chưa có nhóm nào khác để khai báo phụ thuộc.</p>}</fieldset></Modal>}

    {taskDraft && <Modal eyebrow={config.groups.find(group => group.id === taskDraft.groupId)?.name ?? 'Nhóm công việc'} title={taskDraft.id ? 'Sửa đầu việc' : 'Thêm đầu việc'} onClose={() => setTaskDraft(null)} onSubmit={saveTask} submitLabel="Lưu đầu việc"><label className="block text-xs font-bold text-slate-600">Tên công việc<input autoFocus required value={taskDraft.title} onChange={event => setTaskDraft({ ...taskDraft, title: event.target.value })} placeholder="Nhập tên công việc" className={inputClass} /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-bold text-slate-600">Bộ phận phụ trách<select value={taskDraft.department} onChange={event => { const department = event.target.value as DepartmentId; setTaskDraft({ ...taskDraft, department, assigneeId: staffOf(department)[0]?.id ?? '' }); }} className={inputClass}>{DEPARTMENTS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="block text-xs font-bold text-slate-600">Người thực hiện<select value={taskDraft.assigneeId} onChange={event => setTaskDraft({ ...taskDraft, assigneeId: event.target.value })} className={inputClass}>{staffOf(taskDraft.department).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div><div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-bold text-slate-600">Lặp lại<select aria-label="Lặp lại" value={taskDraft.recurrence.freq} onChange={event => { const freq = event.target.value as Recurrence['freq']; setTaskDraft({ ...taskDraft, recurrence: freq === 'weekly' ? { freq, weekday: taskDraft.recurrence.weekday ?? 5 } : freq === 'yearly' ? { freq, month: taskDraft.recurrence.month ?? 1, day: taskDraft.recurrence.day ?? 'last' } : { freq } }); }} className={inputClass}>{(Object.keys(RECURRENCE_LABEL) as Recurrence['freq'][]).map(freq => <option key={freq} value={freq}>{RECURRENCE_LABEL[freq]}</option>)}</select></label>{taskDraft.recurrence.freq === 'weekly' && <label className="block text-xs font-bold text-slate-600">Vào thứ<select aria-label="Thứ trong tuần" value={taskDraft.recurrence.weekday ?? 5} onChange={event => setTaskDraft({ ...taskDraft, recurrence: { ...taskDraft.recurrence, weekday: Number(event.target.value) } })} className={inputClass}>{WEEKDAYS.map((label, index) => <option key={label} value={index}>{label}</option>)}</select></label>}{taskDraft.recurrence.freq === 'yearly' && <div className="grid grid-cols-2 gap-2"><label className="block text-xs font-bold text-slate-600">Tháng<select aria-label="Tháng" value={taskDraft.recurrence.month ?? 1} onChange={event => setTaskDraft({ ...taskDraft, recurrence: { ...taskDraft.recurrence, month: Number(event.target.value) } })} className={inputClass}>{Array.from({ length: 12 }, (_, index) => index + 1).map(month => <option key={month} value={month}>Tháng {month}</option>)}</select></label><label className="block text-xs font-bold text-slate-600">Ngày<select aria-label="Ngày trong năm" value={String(taskDraft.recurrence.day ?? 'last')} onChange={event => setTaskDraft({ ...taskDraft, recurrence: { ...taskDraft.recurrence, day: event.target.value === 'last' ? 'last' : Number(event.target.value) } })} className={inputClass}>{DAY_OPTIONS.map(day => <option key={day} value={String(day)}>{day === 'last' ? 'Cuối tháng' : day}</option>)}</select></label></div>}{(taskDraft.recurrence.freq === 'none' || taskDraft.recurrence.freq === 'monthly') && <label className="block text-xs font-bold text-slate-600">Hạn hoàn thành (ngày của tháng sau kỳ)<select aria-label="Ngày hạn" value={String(taskDraft.dueDay)} onChange={event => setTaskDraft({ ...taskDraft, dueDay: event.target.value === 'last' ? 'last' : Number(event.target.value) })} className={inputClass}>{DAY_OPTIONS.map(day => <option key={day} value={String(day)}>{day === 'last' ? 'Ngày cuối tháng' : `Ngày ${day}`}</option>)}</select></label>}</div><label className="block text-xs font-bold text-slate-600">Checklist · mỗi dòng một mục<textarea value={taskDraft.checklist} onChange={event => setTaskDraft({ ...taskDraft, checklist: event.target.value })} rows={3} className={inputClass} /></label><fieldset><legend className="text-xs font-bold text-slate-600">Chỉ bắt đầu sau khi hoàn thành</legend><div className="mt-2 max-h-52 space-y-2 overflow-y-auto">{config.groups.find(group => group.id === taskDraft.groupId)?.tasks.filter(item => item.id !== taskDraft.id).map(item => <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-600"><input type="checkbox" checked={taskDraft.dependsOnTaskIds.includes(item.id)} onChange={event => setTaskDraft({ ...taskDraft, dependsOnTaskIds: event.target.checked ? [...taskDraft.dependsOnTaskIds, item.id] : taskDraft.dependsOnTaskIds.filter(id => id !== item.id) })} className="accent-[#267da9]" />{item.title}</label>)}</div><p className="mt-2 text-[10px] text-slate-400">Bỏ chọn hết nếu đầu việc có thể chạy song song với các việc khác trong nhóm.</p></fieldset></Modal>}

    {bindingDraft && <Modal eyebrow="Điểm kích hoạt" title={bindingDraft.id ? 'Sửa liên kết thao tác' : 'Thêm liên kết thao tác'} onClose={() => setBindingDraft(null)} onSubmit={saveBinding} submitLabel="Lưu liên kết"><div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-bold text-slate-600">Loại màn hình<select value={bindingDraft.kind} onChange={event => setBindingDraft({ ...bindingDraft, kind: event.target.value as WorkflowBinding['kind'], action: event.target.value === 'voucher' ? 'submit' : bindingDraft.action, buttonLabel: event.target.value === 'voucher' ? 'Gửi duyệt' : bindingDraft.action === 'save-filter' ? 'Lưu bộ lọc' : 'Gửi thao tác' })} className={inputClass}><option value="voucher">Voucher</option><option value="report">Báo cáo</option></select></label><label className="block text-xs font-bold text-slate-600">Thao tác<select disabled={bindingDraft.kind === 'voucher'} value={bindingDraft.action} onChange={event => setBindingDraft({ ...bindingDraft, action: event.target.value as WorkflowBinding['action'], buttonLabel: event.target.value === 'save-filter' ? 'Lưu bộ lọc' : event.target.value === 'run' ? 'Thực hiện' : bindingDraft.kind === 'voucher' ? 'Gửi duyệt' : 'Gửi thao tác' })} className={`${inputClass} disabled:bg-slate-50`}><option value="submit">Submit / gửi thao tác</option><option value="run">Chạy nghiệp vụ (Tính giá, Kết chuyển, Chốt sổ…)</option><option value="save-filter">Lưu bộ lọc (chỉ ghi log)</option></select></label></div><div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-bold text-slate-600">Module<input required value={bindingDraft.module} onChange={event => setBindingDraft({ ...bindingDraft, module: event.target.value })} placeholder="Ví dụ: Nhân sự" className={inputClass} /></label><label className="block text-xs font-bold text-slate-600">Controller<input required value={bindingDraft.controller} onChange={event => setBindingDraft({ ...bindingDraft, controller: event.target.value })} placeholder="Ví dụ: HRLeaveController" className={inputClass} /></label></div><label className="block text-xs font-bold text-slate-600">Tên màn hình<input required value={bindingDraft.screen} onChange={event => setBindingDraft({ ...bindingDraft, screen: event.target.value })} placeholder="Tên voucher hoặc báo cáo" className={inputClass} /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-bold text-slate-600">Nhãn nút<input required value={bindingDraft.buttonLabel} onChange={event => setBindingDraft({ ...bindingDraft, buttonLabel: event.target.value })} placeholder={bindingDraft.kind === 'voucher' ? 'Gửi duyệt' : 'Lưu bộ lọc'} className={inputClass} /></label><label className="block text-xs font-bold text-slate-600">Gắn với đầu việc<select required value={bindingDraft.taskId} onChange={event => setBindingDraft({ ...bindingDraft, taskId: event.target.value })} className={inputClass}>{flatTasks.map(item => <option key={item.id} value={item.id}>{item.groupName} · {item.title}</option>)}</select></label></div><label className="flex items-center gap-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={bindingDraft.enabled} onChange={event => setBindingDraft({ ...bindingDraft, enabled: event.target.checked })} className="accent-[#267da9]" />Bật liên kết sau khi lưu</label></Modal>}

    {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-xl bg-[#183b65] px-4 py-3 text-xs font-bold text-white shadow-lg">{toast}</div>}
  </div>;
}
