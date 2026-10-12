'use client';

import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Pencil, Bell, Check, Clock3, X, Trash2, Mail, Smartphone, MessageSquare, CalendarRange } from 'lucide-react';
import {
  AVAILABLE_DEPARTMENTS,
  AVAILABLE_ENTITIES,
  AVAILABLE_SCREENS_BY_SUBSYSTEM,
  AVAILABLE_SUBSYSTEMS,
  SubsystemType,
  TaskDeclarationItem,
} from '../../data/mockAdminExecutionData';
import { buildTaskOccurrences, formatTaskDate, TaskOccurrenceView } from './executionViewModel';

interface Props {
  tasks: TaskDeclarationItem[];
  logs: import('../../data/mockAdminExecutionData').SystemAuditLogItem[];
  onAddTask: (task: TaskDeclarationItem) => void;
  onUpdateTask: (task: TaskDeclarationItem) => void;
  onDeleteTasks: (ids: string[]) => void;
  onToggleStatus: (id: string) => void;
  onShowToast: (message: string) => void;
}

type Draft = {
  description: string;
  subsystem: SubsystemType;
  screenCode: string;
  actionName: string;
  cycle: TaskDeclarationItem['cycle'];
  dayRule: string;
  assignedTo: string;
  department: string;
  entity: string;
  notificationEnabled: boolean;
  notificationChannels: ('email' | 'sms' | 'app')[];
  remindBeforeDays: number;
};

const cycles: TaskDeclarationItem['cycle'][] = ['Hàng ngày', 'Hàng tuần', 'Hàng tháng', 'Hàng quý', 'Hàng năm'];
const dayRules = ['Hằng ngày', 'Thứ 2', 'Ngày 05', 'Ngày 10', 'Ngày 20', 'Ngày cuối tháng', '31/03'];
const statusStyles = {
  ontime: { label: 'Đúng hạn', color: 'border-emerald-300 bg-emerald-50 text-emerald-800', dot: 'bg-emerald-500' },
  late: { label: 'Hoàn thành trễ', color: 'border-rose-300 bg-rose-50 text-rose-800', dot: 'bg-rose-500' },
  overdue: { label: 'Quá hạn', color: 'border-amber-300 bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  notyet: { label: 'Chưa đến hạn', color: 'border-slate-200 bg-slate-50 text-slate-600', dot: 'bg-slate-400' },
};

const emptyDraft = (): Draft => ({
  description: '', subsystem: 'GL', screenCode: 'xtgtcb', actionName: 'Tính giá',
  cycle: 'Hàng tháng', dayRule: 'Ngày 05', assignedTo: 'Nhóm: Kế toán tổng hợp',
  department: AVAILABLE_DEPARTMENTS[1], entity: AVAILABLE_ENTITIES[0],
  notificationEnabled: true, notificationChannels: ['email', 'app'], remindBeforeDays: 1,
});

const draftFromTask = (task: TaskDeclarationItem): Draft => ({
  description: task.description, subsystem: task.subsystem, screenCode: task.screenCode,
  actionName: task.actionName, cycle: task.cycle, dayRule: task.dayRule,
  assignedTo: task.assignedTo, department: task.department, entity: task.entity,
  notificationEnabled: task.notificationEnabled, notificationChannels: task.notificationChannels,
  remindBeforeDays: task.remindBeforeDays,
});

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function TaskDeclarationChecklist({ tasks, logs, onAddTask, onUpdateTask, onDeleteTasks, onToggleStatus, onShowToast }: Props) {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMode, setCalendarMode] = useState<'month' | 'week'>('month');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDeclarationItem | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const occurrences = buildTaskOccurrences(tasks, logs, month.getFullYear(), month.getMonth(), today);
  const selectedOccurrences = occurrences.filter(item => dateKey(item.dueDate) === dateKey(selectedDate));
  const totals = {
    today: occurrences.filter(item => dateKey(item.dueDate) === dateKey(today)).length,
    active: tasks.filter(task => task.status === 'active').length,
    reminders: tasks.filter(task => task.status === 'active' && task.notificationEnabled).length,
    paused: tasks.filter(task => task.status === 'inactive').length,
  };

  const calendarDays = useMemo(() => {
    if (calendarMode === 'week') {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return { date, inMonth: date.getMonth() === month.getMonth() };
      });
    }
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { date, inMonth: date.getMonth() === month.getMonth() };
    });
  }, [calendarMode, month, selectedDate]);

  const openCreate = () => {
    setEditingTask(null);
    setDraft(emptyDraft());
    setIsDrawerOpen(true);
  };

  const openEdit = (task: TaskDeclarationItem) => {
    setEditingTask(task);
    setDraft(draftFromTask(task));
    setIsDrawerOpen(true);
  };

  const selectSubsystem = (subsystem: SubsystemType) => {
    const firstScreen = AVAILABLE_SCREENS_BY_SUBSYSTEM[subsystem]?.[0];
    setDraft(current => ({
      ...current,
      subsystem,
      screenCode: firstScreen?.code ?? '',
      actionName: firstScreen?.defaultAction ?? '',
    }));
  };

  const saveDraft = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.description.trim()) return;
    const screen = AVAILABLE_SCREENS_BY_SUBSYSTEM[draft.subsystem]?.find(item => item.code === draft.screenCode);
    const nextTask: TaskDeclarationItem = {
      ...(editingTask ?? {
        id: `decl-${Date.now()}`,
        stt: tasks.length + 1,
        status: 'active' as const,
      }),
      ...draft,
      description: draft.description.trim(),
      screenName: screen?.name ?? draft.screenCode,
      assignedType: draft.assignedTo.toLowerCase().startsWith('nhóm:') ? 'group' : 'user',
      cycleDetail: 'định kỳ',
      notificationChannels: draft.notificationEnabled ? draft.notificationChannels : [],
    };
    if (editingTask) onUpdateTask(nextTask);
    else onAddTask(nextTask);
    setIsDrawerOpen(false);
    onShowToast(editingTask ? 'Đã cập nhật danh mục công việc' : 'Đã thêm công việc vào lịch');
  };

  const toggleChannel = (channel: Draft['notificationChannels'][number]) => {
    setDraft(current => ({
      ...current,
      notificationChannels: current.notificationChannels.includes(channel)
        ? current.notificationChannels.filter(item => item !== channel)
        : [...current.notificationChannels, channel],
    }));
  };

  const navigateMonth = (direction: number) => {
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + direction, 1);
    setMonth(nextMonth);
    setSelectedDate(nextMonth);
  };

  return (
    <div className="space-y-5 pb-8">
      <section className="relative overflow-hidden rounded-[28px] border border-[#8fa8c9]/40 bg-[#102a56] px-6 py-6 text-white shadow-[0_20px_55px_rgba(16,42,86,.15)] md:px-8">
        <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute right-16 -top-16 h-56 w-56 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-[#d6e3f4]">
              <CalendarDays size={14} /> Lịch điều hành
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Công việc theo lịch</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Một nơi để khai báo việc định kỳ, xem hạn sắp tới và mở nhanh cấu hình từng đầu việc.</p>
          </div>
          <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b78] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 hover:bg-[#102a56]">
            <Plus size={17} /> Khai báo công việc
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Đầu việc đang bật" value={totals.active} hint="trong danh mục" icon="✦" />
        <MetricCard label="Đến hạn hôm nay" value={totals.today} hint="theo lịch đã khai báo" icon="◷" accent="coral" />
        <MetricCard label="Có nhắc việc" value={totals.reminders} hint="đang bật cấu hình" icon="♧" accent="green" />
        <MetricCard label="Đang tạm dừng" value={totals.paused} hint="đầu việc trong danh mục" icon="Ⅱ" accent="amber" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="overflow-hidden rounded-[24px] border border-[#d8e1ed] bg-[#ffffff]/90 shadow-[0_12px_36px_rgba(23,43,77,.045)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e9f2] px-4 py-4 md:px-5">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => navigateMonth(-1)} aria-label="Tháng trước" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d8e1ed] text-[#31588f] hover:bg-[#edf2f8]"><ChevronLeft size={17} /></button>
              <button type="button" onClick={() => navigateMonth(1)} aria-label="Tháng sau" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d8e1ed] text-[#31588f] hover:bg-[#edf2f8]"><ChevronRight size={17} /></button>
              <h2 className="ml-2 text-lg font-bold capitalize text-[#172b4d]">{month.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(today); }} className="rounded-lg px-3 py-2 text-xs font-bold text-[#31588f] hover:bg-[#edf2f8]">Hôm nay</button>
              <div className="flex rounded-xl bg-[#edf2f8] p-1">
                <button type="button" onClick={() => setCalendarMode('month')} className={`rounded-lg px-3 py-2 text-xs font-bold ${calendarMode === 'month' ? 'bg-white text-[#172b4d] shadow-sm' : 'text-[#718096]'}`}>Tháng</button>
                <button type="button" onClick={() => setCalendarMode('week')} className={`rounded-lg px-3 py-2 text-xs font-bold ${calendarMode === 'week' ? 'bg-white text-[#172b4d] shadow-sm' : 'text-[#718096]'}`}>Tuần</button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-[#edf2f8] bg-[#f6f8fb] px-4 py-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#95a3b8]">Trạng thái</span>
            {(['ontime', 'late', 'overdue', 'notyet'] as const).map(status => <span key={status} className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-[#718096]"><span className={`h-2 w-2 rounded-full ${statusStyles[status].dot}`} />{statusStyles[status].label}</span>)}
          </div>
          <div className="grid grid-cols-7 border-b border-[#edf2f8] bg-[#f3f6fa]">
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(day => <div key={day} className="py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-[#8290a4]">{day}</div>)}
          </div>
          <div className={`grid grid-cols-7 ${calendarMode === 'week' ? 'min-h-[360px]' : ''}`}>
            {calendarDays.map(({ date, inMonth }) => {
              const dayEvents = occurrences.filter(item => dateKey(item.dueDate) === dateKey(date));
              const isSelected = dateKey(date) === dateKey(selectedDate);
              const isToday = dateKey(date) === dateKey(today);
              return (
                <button type="button" key={dateKey(date)} onClick={() => { setSelectedDate(date); if (!inMonth) setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); }} className={`min-h-[112px] border-b border-r border-[#edf2f8] p-1.5 text-left transition-colors md:min-h-[132px] md:p-2.5 ${isSelected ? 'bg-[#f3f6fa]' : 'bg-[#ffffff] hover:bg-[#f3f6fa]'} ${!inMonth ? 'opacity-45' : ''}`}>
                  <div className="mb-1.5 flex justify-end">
                    <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${isToday ? 'bg-[#173b78] text-white' : isSelected ? 'bg-[#102a56] text-white' : 'text-[#718096]'}`}>{date.getDate()}</span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, calendarMode === 'week' ? 5 : 3).map(event => (
                      <span key={event.id} className={`flex items-center gap-1.5 truncate rounded-md border px-1.5 py-1 text-[9px] font-semibold leading-tight md:text-[10px] ${statusStyles[event.status].color}`} title={`${event.task.description} · ${statusStyles[event.status].label}`}>
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyles[event.status].dot}`} />
                        <span className="truncate">{event.task.description}</span>
                      </span>
                    ))}
                    {dayEvents.length > 3 && calendarMode === 'month' && <span className="block pl-1 text-[9px] font-bold text-[#718096]">+{dayEvents.length - 3} việc</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-[24px] border border-[#d8e1ed] bg-[#ffffff]/90 p-4 shadow-[0_12px_36px_rgba(23,43,77,.045)] md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8290a4]">Chi tiết ngày</p>
              <h2 className="mt-1 text-lg font-bold capitalize text-[#172b4d]">{selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
            </div>
            <span className="rounded-full bg-[#edf2f8] px-2.5 py-1 text-xs font-bold text-[#31588f]">{selectedOccurrences.length} việc</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {selectedOccurrences.length ? selectedOccurrences.map(item => <OccurrenceCard key={item.id} item={item} onEdit={openEdit} onToggle={onToggleStatus} />) : (
              <div className="rounded-2xl border border-dashed border-[#d3deeb] bg-[#f3f6fa] px-4 py-8 text-center">
                <CalendarRange className="mx-auto h-8 w-8 text-[#a6b4c7]" />
                <p className="mt-2 text-sm font-semibold text-[#526784]">Ngày này chưa có công việc</p>
                <p className="mt-1 text-xs text-[#8290a4]">Chọn ngày khác hoặc khai báo đầu việc mới.</p>
              </div>
            )}
          </div>
          <div className="mt-5 border-t border-[#e2e9f2] pt-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#8290a4]">Danh mục công việc</p>
            <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">
              {tasks.map(task => (
                <button type="button" key={task.id} onClick={() => openEdit(task)} className="flex w-full items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-left hover:border-[#e2e9f2] hover:bg-white">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf2f8] text-[10px] font-black text-[#31588f]">{task.subsystem}</span>
                  <span className={`min-w-0 flex-1 truncate text-xs font-semibold ${task.status === 'active' ? 'text-[#40534f]' : 'text-[#a6b4c7]'}`}>{task.description}</span>
                  <span className="text-[9px] font-semibold text-[#95a3b8]">{task.status === 'active' ? 'Bật' : 'Tạm dừng'}</span>
                  <Pencil size={13} className="text-[#95a3b8]" />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-[#152522]/35 backdrop-blur-[2px]" onMouseDown={event => { if (event.target === event.currentTarget) setIsDrawerOpen(false); }}>
          <form onSubmit={saveDraft} className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-[#ffffff] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#e2e9f2] px-6 py-5">
              <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8290a4]">Danh mục công việc</p><h2 className="mt-1 text-xl font-bold text-[#172b4d]">{editingTask ? 'Chỉnh sửa đầu việc' : 'Khai báo đầu việc'}</h2></div>
              <button type="button" onClick={() => setIsDrawerOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#edf2f8]" aria-label="Đóng"><X size={18} /></button>
            </div>
            <div className="flex-1 space-y-5 px-6 py-5">
              <label className="block text-xs font-bold text-[#526784]">Tên công việc<input required value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder="Ví dụ: Đối chiếu công nợ khách hàng" className="mt-2 w-full rounded-xl border border-[#d8e1ed] px-3.5 py-3 text-sm font-medium" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold text-[#526784]">Chu kỳ<select value={draft.cycle} onChange={event => setDraft({ ...draft, cycle: event.target.value as Draft['cycle'] })} className="mt-2 w-full rounded-xl border border-[#d8e1ed] px-3 py-3 text-sm">{cycles.map(cycle => <option key={cycle}>{cycle}</option>)}</select></label>
                <label className="block text-xs font-bold text-[#526784]">Quy tắc hạn<select value={draft.dayRule} onChange={event => setDraft({ ...draft, dayRule: event.target.value })} className="mt-2 w-full rounded-xl border border-[#d8e1ed] px-3 py-3 text-sm">{dayRules.map(rule => <option key={rule}>{rule}</option>)}</select></label>
              </div>
              <div className="rounded-2xl border border-[#e2e9f2] bg-[#f3f6fa] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#31588f]"><Clock3 size={16} /> Hành động cần theo dõi</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="text-[11px] font-bold text-[#718096]">Phân hệ<select value={draft.subsystem} onChange={event => selectSubsystem(event.target.value as SubsystemType)} className="mt-1.5 w-full rounded-lg border border-[#d8e1ed] px-2.5 py-2 text-xs">{AVAILABLE_SUBSYSTEMS.map(item => <option key={item.code} value={item.code}>{item.code}</option>)}</select></label>
                  <label className="text-[11px] font-bold text-[#718096]">Màn hình<select value={draft.screenCode} onChange={event => { const screen = AVAILABLE_SCREENS_BY_SUBSYSTEM[draft.subsystem]?.find(item => item.code === event.target.value); setDraft({ ...draft, screenCode: event.target.value, actionName: screen?.defaultAction ?? '' }); }} className="mt-1.5 w-full rounded-lg border border-[#d8e1ed] px-2.5 py-2 text-xs">{(AVAILABLE_SCREENS_BY_SUBSYSTEM[draft.subsystem] ?? []).map(item => <option key={item.code} value={item.code}>{item.code}</option>)}</select></label>
                  <label className="text-[11px] font-bold text-[#718096]">Thao tác<select value={draft.actionName} onChange={event => setDraft({ ...draft, actionName: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#d8e1ed] px-2.5 py-2 text-xs"><option>{draft.actionName}</option><option>Submit</option><option>Lưu</option><option>Tính giá</option></select></label>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold text-[#526784]">Đơn vị<select value={draft.entity} onChange={event => setDraft({ ...draft, entity: event.target.value })} className="mt-2 w-full rounded-xl border border-[#d8e1ed] px-3 py-3 text-sm">{AVAILABLE_ENTITIES.map(entity => <option key={entity}>{entity}</option>)}</select></label>
                <label className="block text-xs font-bold text-[#526784]">Bộ phận<select value={draft.department} onChange={event => setDraft({ ...draft, department: event.target.value })} className="mt-2 w-full rounded-xl border border-[#d8e1ed] px-3 py-3 text-sm">{AVAILABLE_DEPARTMENTS.map(department => <option key={department}>{department}</option>)}</select></label>
              </div>
              <label className="block text-xs font-bold text-[#526784]">Người hoặc nhóm phụ trách<input value={draft.assignedTo} onChange={event => setDraft({ ...draft, assignedTo: event.target.value })} placeholder="Tên người dùng hoặc Nhóm: ..." className="mt-2 w-full rounded-xl border border-[#d8e1ed] px-3.5 py-3 text-sm" /></label>
              <div className="rounded-2xl border border-[#e2e9f2] p-4">
                <label className="flex cursor-pointer items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-bold text-[#31588f]"><Bell size={16} /> Nhắc trước hạn</span><input type="checkbox" checked={draft.notificationEnabled} onChange={event => setDraft({ ...draft, notificationEnabled: event.target.checked })} className="h-4 w-4 accent-[#173b78]" /></label>
                {draft.notificationEnabled && <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">{([['email', Mail, 'Email'], ['app', Smartphone, 'Trong ứng dụng'], ['sms', MessageSquare, 'SMS']] as const).map(([channel, Icon, label]) => <button type="button" key={channel} onClick={() => toggleChannel(channel)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${draft.notificationChannels.includes(channel) ? 'border-[#8fa8c9] bg-[#eaf1fa] text-[#31588f]' : 'border-[#e2e9f2] text-[#8290a4]'}`}><Icon size={14} />{label}{draft.notificationChannels.includes(channel) && <Check size={13} />}</button>)}</div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#718096]">Nhắc trước <input type="number" min={0} max={30} value={draft.remindBeforeDays} onChange={event => setDraft({ ...draft, remindBeforeDays: Number(event.target.value) })} className="w-16 rounded-lg border border-[#d8e1ed] px-2 py-1.5 text-center" /> ngày <span className="text-[10px] font-normal">(cấu hình; chưa kết nối gửi thật)</span></label>
                </div>}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#e2e9f2] px-6 py-4">
              <div>{editingTask && <button type="button" onClick={() => { onDeleteTasks([editingTask.id]); setIsDrawerOpen(false); onShowToast('Đã xóa đầu việc khỏi danh mục'); }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"><Trash2 size={14} /> Xóa</button>}</div>
              <div className="flex gap-2"><button type="button" onClick={() => setIsDrawerOpen(false)} className="rounded-xl border border-[#d8e1ed] px-4 py-2.5 text-sm font-bold text-[#526784]">Hủy</button><button type="submit" className="rounded-xl bg-[#173b78] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#102a56]">{editingTask ? 'Lưu thay đổi' : 'Thêm vào lịch'}</button></div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, hint, icon, accent = 'sea' }: { label: string; value: number; hint: string; icon: string; accent?: 'sea' | 'coral' | 'green' | 'amber' }) {
  const tones = { sea: 'bg-[#eaf1fa] text-[#31588f]', coral: 'bg-[#eaf1fa] text-[#173b78]', green: 'bg-[#e8f4eb] text-[#31804f]', amber: 'bg-[#fff5dd] text-[#a87510]' };
  return <div className="flex items-center gap-3 rounded-2xl border border-[#d8e1ed] bg-[#ffffff]/90 p-4 shadow-[0_8px_24px_rgba(23,43,77,.035)]"><span className={`grid h-10 w-10 place-items-center rounded-xl text-lg font-black ${tones[accent]}`}>{icon}</span><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#8290a4]">{label}</p><div className="mt-0.5 flex items-baseline gap-2"><span className="text-xl font-black text-[#172b4d]">{value}</span><span className="text-[10px] text-[#8290a4]">{hint}</span></div></div></div>;
}

function OccurrenceCard({ item, onEdit, onToggle }: { item: TaskOccurrenceView; onEdit: (task: TaskDeclarationItem) => void; onToggle: (id: string) => void }) {
  const style = statusStyles[item.status];
  return <article className="rounded-2xl border border-[#e2e9f2] bg-white p-3.5 shadow-[0_4px_15px_rgba(23,43,77,.035)]">
    <div className="flex items-start gap-3"><span className={`mt-1 h-2.5 w-2.5 rounded-full ${style.dot}`} /><div className="min-w-0 flex-1"><h3 className="text-sm font-bold leading-5 text-[#1d355b]">{item.task.description}</h3><p className="mt-1 text-[11px] text-[#8290a4]">{item.task.subsystem} · {item.task.screenCode} · {item.task.actionName}</p></div><button type="button" onClick={() => onEdit(item.task)} aria-label="Sửa công việc" className="rounded-lg p-1.5 text-[#95a3b8] hover:bg-[#edf2f8] hover:text-[#31588f]"><Pencil size={14} /></button></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf2f8] pt-3"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${style.color}`}>{style.label}</span><span className="text-[10px] font-semibold text-[#718096]">{item.task.assignedTo}</span></div>
    {item.completedLog ? <div className="mt-2 rounded-xl bg-[#f3f6fa] px-3 py-2"><p className="text-[10px] font-semibold text-[#456184]">Ghi nhận bởi {item.completedLog.userName} · {item.completedLog.timestamp.slice(11, 16)}</p><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#8290a4]">{item.completedLog.details}</p></div> : <p className="mt-2 text-[10px] text-[#95a3b8]">Chưa có log thành công khớp với thao tác này trong kỳ.</p>}
    {item.logs.length > 1 && <details className="mt-2 text-[10px] text-[#718096]"><summary className="cursor-pointer font-semibold">Xem {item.logs.length} log trong kỳ</summary><div className="mt-2 space-y-1.5">{item.logs.map(log => <p key={log.id} className="border-l-2 border-[#c8d5e6] pl-2">{log.timestamp.slice(11, 16)} · {log.userName} · {log.resultStatus}</p>)}</div></details>}
    <div className="mt-2 flex items-center justify-between"><span className="text-[10px] text-[#8290a4]">Hạn {formatTaskDate(item.dueDate)}</span><button type="button" onClick={() => onToggle(item.task.id)} className={`text-[10px] font-bold ${item.task.status === 'active' ? 'text-[#9a6254]' : 'text-[#31588f]'}`}>{item.task.status === 'active' ? 'Tạm dừng lịch' : 'Bật lịch'}</button></div>
  </article>;
}
