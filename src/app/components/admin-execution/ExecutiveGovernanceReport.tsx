'use client';

import React, { useMemo, useState } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, Check, ChevronLeft, ChevronRight, CircleAlert, Clock3, Filter, Layers3, X } from 'lucide-react';
import { SystemAuditLogItem, TaskDeclarationItem } from '../../data/mockAdminExecutionData';
import { buildTaskOccurrences, formatTaskDate, getWeekRanges, TaskOccurrenceView } from './executionViewModel';

interface Props {
  tasks: TaskDeclarationItem[];
  logs: SystemAuditLogItem[];
}

type GroupMode = 'entity' | 'department' | 'userGroup';
const statusOrder: TaskOccurrenceView['status'][] = ['overdue', 'late', 'notyet', 'ontime'];
const statusNames: Record<TaskOccurrenceView['status'], string> = {
  ontime: 'Đúng hạn', late: 'Hoàn thành trễ', overdue: 'Quá hạn', notyet: 'Chưa đến hạn',
};

function groupName(occurrence: TaskOccurrenceView, mode: GroupMode) {
  if (mode === 'entity') return occurrence.task.entity || 'Chưa phân đơn vị';
  if (mode === 'department') return occurrence.task.department || 'Chưa phân bộ phận';
  return occurrence.task.assignedTo || 'Chưa phân công';
}

export default function ExecutiveGovernanceReport({ tasks, logs }: Props) {
  const now = new Date();
  const [period, setPeriod] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [groupBy, setGroupBy] = useState<GroupMode>('department');
  const [selectedCell, setSelectedCell] = useState<{ group: string; week: string; items: TaskOccurrenceView[] } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | TaskOccurrenceView['status']>('all');

  const allOccurrences = buildTaskOccurrences(tasks, logs, period.getFullYear(), period.getMonth(), now);
  const occurrences = allOccurrences.filter(item => statusFilter === 'all' || item.status === statusFilter);
  const weeks = getWeekRanges(period.getFullYear(), period.getMonth());
  const groups = useMemo(() => Array.from(new Set(occurrences.map(item => groupName(item, groupBy)))).sort((a, b) => a.localeCompare(b)), [occurrences, groupBy]);

  const stats = {
    total: occurrences.length,
    ontime: occurrences.filter(item => item.status === 'ontime').length,
    late: occurrences.filter(item => item.status === 'late').length,
    overdue: occurrences.filter(item => item.status === 'overdue').length,
    notyet: occurrences.filter(item => item.status === 'notyet').length,
  };
  const compliance = stats.total ? Math.round(stats.ontime / stats.total * 100) : 0;

  const changePeriod = (delta: number) => setPeriod(new Date(period.getFullYear(), period.getMonth() + delta, 1));
  const getCellItems = (group: string, weekIndex: number) => occurrences.filter(item => {
    const day = item.dueDate.getDate();
    const week = weeks[weekIndex];
    return groupName(item, groupBy) === group && day >= week.start && day <= week.end;
  });

  return (
    <div className="space-y-5 pb-8">
      <section className="relative overflow-hidden rounded-[28px] border border-[#8fa8c9]/40 bg-[#102a56] px-6 py-6 text-white shadow-[0_20px_55px_rgba(16,42,86,.15)] md:px-8">
        <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border border-white/10" /><div className="absolute right-16 -top-16 h-56 w-56 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-[#d6e3f4]"><BarChart3 size={14} /> Bức tranh SLA</div><h1 className="text-2xl font-bold tracking-tight md:text-3xl">Tiến độ và thời hạn</h1><p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Mỗi ô là kết quả các lượt công việc trong một tuần. Chọn ô để xem việc và dấu vết log đã tạo nên kết quả.</p></div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-1.5">
            <button type="button" onClick={() => changePeriod(-1)} aria-label="Kỳ trước" className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/10"><ChevronLeft size={18} /></button>
            <span className="min-w-[150px] text-center text-sm font-bold capitalize">{period.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
            <button type="button" onClick={() => changePeriod(1)} aria-label="Kỳ tiếp" className="grid h-9 w-9 place-items-center rounded-xl hover:bg-white/10"><ChevronRight size={18} /></button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard label="Lượt trong kỳ" value={stats.total} icon={<Layers3 size={17} />} tone="sea" />
        <StatCard label="Đúng hạn" value={stats.ontime} icon={<Check size={17} />} tone="green" suffix={compliance + '%'} />
        <StatCard label="Hoàn thành trễ" value={stats.late} icon={<ArrowDownRight size={17} />} tone="rose" />
        <StatCard label="Quá hạn" value={stats.overdue} icon={<CircleAlert size={17} />} tone="amber" />
        <StatCard label="Chưa đến hạn" value={stats.notyet} icon={<Clock3 size={17} />} tone="slate" />
      </section>

      <section className="rounded-[24px] border border-[#d8e1ed] bg-[#ffffff]/90 p-4 shadow-[0_12px_36px_rgba(23,43,77,.045)] md:p-5">
        <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#8290a4]"><Activity size={14} /> Ma trận hoàn thành theo hạn</div><h2 className="mt-1 text-lg font-bold text-[#1d355b]">Một màu cho mỗi kết quả</h2></div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-[#d8e1ed] bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#8290a4]"><Filter size={13} /><select value={groupBy} onChange={event => setGroupBy(event.target.value as GroupMode)} className="border-0 bg-transparent p-0 text-xs font-semibold normal-case tracking-normal text-[#526784] focus:ring-0"><option value="entity">Nhóm theo đơn vị</option><option value="department">Nhóm theo bộ phận</option><option value="userGroup">Nhóm theo người/nhóm</option></select></label>
            <label className="rounded-xl border border-[#d8e1ed] bg-white px-3 py-2"><select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)} className="border-0 bg-transparent p-0 text-xs font-semibold text-[#526784] focus:ring-0"><option value="all">Tất cả trạng thái</option><option value="ontime">Đúng hạn</option><option value="late">Hoàn thành trễ</option><option value="overdue">Quá hạn</option><option value="notyet">Chưa đến hạn</option></select></label>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">{(['ontime', 'late', 'overdue', 'notyet'] as const).map(status => <span key={status} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#718096]"><span className={`h-2.5 w-2.5 rounded-sm ${cellTone(status)}`} />{statusNames[status]}</span>)}</div>

        <div className="overflow-x-auto rounded-2xl border border-[#e2e9f2]">
          <div className="min-w-[740px]">
            <div className="grid border-b border-[#e2e9f2] bg-[#f3f6fa]" style={{ gridTemplateColumns: `minmax(190px, 1.35fr) repeat(${weeks.length}, minmax(92px, 1fr))` }}>
              <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8290a4]">{groupBy === 'entity' ? 'Đơn vị' : groupBy === 'department' ? 'Bộ phận' : 'Người / nhóm'}</div>
              {weeks.map((week, index) => <div key={week.label} className="border-l border-[#e2e9f2] px-2 py-3 text-center"><span className="block text-[10px] font-bold text-[#31588f]">Tuần {index + 1}</span><span className="mt-0.5 block text-[9px] text-[#95a3b8]">{week.label}/{String(period.getMonth() + 1).padStart(2, '0')}</span></div>)}
            </div>
            {groups.length === 0 ? <div className="px-4 py-14 text-center text-sm text-[#8290a4]">Không có lượt công việc trong bộ lọc này.</div> : groups.map(group => {
              const groupItems = occurrences.filter(item => groupName(item, groupBy) === group);
              const passed = groupItems.filter(item => item.status === 'ontime').length;
              return <div key={group} className="grid border-b border-[#edf2f8] last:border-b-0" style={{ gridTemplateColumns: `minmax(190px, 1.35fr) repeat(${weeks.length}, minmax(92px, 1fr))` }}>
                <div className="flex items-center justify-between gap-2 bg-white px-4 py-3"><span className="truncate text-xs font-bold text-[#1d355b]" title={group}>{group}</span><span className="shrink-0 rounded-full bg-[#edf2f8] px-2 py-0.5 text-[9px] font-bold text-[#718096]">{passed}/{groupItems.length}</span></div>
                {weeks.map((week, index) => {
                  const items = getCellItems(group, index);
                  const dominant = statusOrder.find(status => items.some(item => item.status === status));
                  const statusCounts = { ontime: items.filter(item => item.status === 'ontime').length, late: items.filter(item => item.status === 'late').length, overdue: items.filter(item => item.status === 'overdue').length, notyet: items.filter(item => item.status === 'notyet').length };
                  return <button type="button" key={week.label} disabled={!items.length} onClick={() => setSelectedCell({ group, week: week.label, items })} className={`group border-l border-[#edf2f8] p-2 text-center transition-colors ${items.length ? 'hover:bg-[#f3f6fa]' : 'cursor-default bg-[#f6f8fb]'}`}>
                    {items.length ? <><span className={`mx-auto grid h-9 w-9 place-items-center rounded-xl text-xs font-black ${cellTone(dominant!)}`}>{statusCounts.ontime === items.length ? <Check size={15} /> : items.length}</span><span className="mt-1 block text-[9px] font-semibold text-[#8290a4]">{statusCounts.ontime}/{items.length} đúng hạn</span><div className="mx-auto mt-1 flex h-1 w-12 overflow-hidden rounded-full bg-[#edf2f8]">{(['ontime', 'late', 'overdue', 'notyet'] as const).map(status => statusCounts[status] > 0 && <span key={status} className={`h-full ${cellTone(status)}`} style={{ width: `${statusCounts[status] / items.length * 100}%` }} />)}</div></> : <span className="text-[10px] text-[#c3cedd]">—</span>}
                  </button>;
                })}
              </div>;
            })}
          </div>
        </div>
        <p className="mt-3 text-[10px] text-[#8290a4]">Chỉ lượt có log thành công trước hoặc đúng hạn mới được xác nhận SLA. Chọn ô màu để xem công việc và log liên quan.</p>
      </section>

      {selectedCell && <section className="rounded-[24px] border border-[#d8e1ed] bg-[#ffffff]/90 p-4 shadow-[0_12px_36px_rgba(23,43,77,.045)] md:p-5">
        <div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8290a4]">Chi tiết ô báo cáo · {selectedCell.week}/{String(period.getMonth() + 1).padStart(2, '0')}</p><h2 className="mt-1 text-lg font-bold text-[#1d355b]">{selectedCell.group}</h2></div><button type="button" onClick={() => setSelectedCell(null)} className="grid h-9 w-9 place-items-center rounded-full border border-[#d8e1ed] text-[#718096] hover:bg-[#edf2f8]" aria-label="Đóng chi tiết"><X size={16} /></button></div>
        <div className="grid gap-3 lg:grid-cols-2">{selectedCell.items.map(item => <article key={item.id} className="rounded-2xl border border-[#e2e9f2] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-[#1d355b]">{item.task.description}</h3><p className="mt-1 text-[10px] text-[#8290a4]">{item.task.subsystem} · {item.task.screenCode} · hạn {formatTaskDate(item.dueDate)}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ${cellTone(item.status)}`}>{statusNames[item.status]}</span></div><div className="mt-3 border-t border-[#edf2f8] pt-3">{item.logs.length ? item.logs.map(log => <div key={log.id} className="mb-2 last:mb-0"><div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-[#456184]"><span>{log.userName} · {log.actionName}</span><span className="font-mono text-[#95a3b8]">{log.timestamp}</span></div><p className="mt-1 text-[10px] leading-4 text-[#8290a4]">{log.details}</p></div>) : <p className="flex items-center gap-2 text-[10px] text-[#9b8a59]"><CircleAlert size={13} /> Chưa tìm thấy log thành công khớp trong kỳ.</p>}</div></article>)}</div>
      </section>}
    </div>
  );
}

function cellTone(status: TaskOccurrenceView['status']) {
  return {
    ontime: 'bg-emerald-100 text-emerald-800',
    late: 'bg-rose-100 text-rose-800',
    overdue: 'bg-amber-100 text-amber-900',
    notyet: 'bg-slate-100 text-slate-600',
  }[status];
}

function StatCard({ label, value, icon, tone, suffix }: { label: string; value: number; icon: React.ReactNode; tone: 'sea' | 'green' | 'rose' | 'amber' | 'slate'; suffix?: string }) {
  const styles = { sea: 'bg-[#eaf1fa] text-[#31588f]', green: 'bg-emerald-50 text-emerald-700', rose: 'bg-rose-50 text-rose-700', amber: 'bg-amber-50 text-amber-800', slate: 'bg-slate-100 text-slate-600' };
  return <div className="rounded-2xl border border-[#d8e1ed] bg-[#ffffff]/90 p-3.5 shadow-[0_8px_24px_rgba(23,43,77,.035)]"><div className="flex items-start justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-wider text-[#8290a4]">{label}</span><span className={`grid h-8 w-8 place-items-center rounded-lg ${styles[tone]}`}>{icon}</span></div><div className="mt-2 flex items-baseline gap-2"><span className="text-2xl font-black text-[#172b4d]">{value}</span>{suffix && <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700"><ArrowUpRight size={12} />{suffix}</span>}</div></div>;
}
