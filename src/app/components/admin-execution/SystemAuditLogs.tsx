'use client';

import React, { useMemo, useState } from 'react';
import { Activity, AlertTriangle, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, CircleX, Filter, Search, ShieldCheck } from 'lucide-react';
import { AVAILABLE_SUBSYSTEMS, SystemAuditLogItem } from '../../data/mockAdminExecutionData';

interface Props {
  logs: SystemAuditLogItem[];
}

const statusMeta = {
  success: { label: 'Thành công', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-800 border-emerald-200', Icon: CheckCircle2 },
  warning: { label: 'Cảnh báo', dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-800 border-amber-200', Icon: AlertTriangle },
  failed: { label: 'Thất bại', dot: 'bg-rose-500', pill: 'bg-rose-50 text-rose-800 border-rose-200', Icon: CircleX },
};

export default function SystemAuditLogs({ logs }: Props) {
  const [search, setSearch] = useState('');
  const [subsystem, setSubsystem] = useState('all');
  const [result, setResult] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const filteredLogs = useMemo(() => logs.filter(log => {
    const searchText = `${log.userName} ${log.userId} ${log.screenCode} ${log.actionName} ${log.details}`.toLocaleLowerCase();
    const date = log.timestamp.slice(0, 10);
    return (!search || searchText.includes(search.toLocaleLowerCase()))
      && (subsystem === 'all' || log.subsystem === subsystem)
      && (result === 'all' || log.resultStatus === result)
      && (!fromDate || date >= fromDate)
      && (!toDate || date <= toDate);
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [logs, search, subsystem, result, fromDate, toDate]);

  const grouped = useMemo(() => {
    const map = new Map<string, SystemAuditLogItem[]>();
    filteredLogs.forEach(log => {
      const day = log.timestamp.slice(0, 10);
      map.set(day, [...(map.get(day) ?? []), log]);
    });
    return Array.from(map.entries());
  }, [filteredLogs]);

  const counts = {
    total: filteredLogs.length,
    success: filteredLogs.filter(log => log.resultStatus === 'success').length,
    warning: filteredLogs.filter(log => log.resultStatus === 'warning').length,
    failed: filteredLogs.filter(log => log.resultStatus === 'failed').length,
  };

  const toggleExpand = (id: string) => setExpandedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);

  return (
    <div className="space-y-5 pb-8">
      <section className="relative overflow-hidden rounded-[28px] border border-[#8fa8c9]/40 bg-[#102a56] px-6 py-6 text-white shadow-[0_20px_55px_rgba(16,42,86,.15)] md:px-8">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-[#d6e3f4]"><ShieldCheck size={14} /> Dấu vết hệ thống</div><h1 className="text-2xl font-bold tracking-tight md:text-3xl">Nhật ký sự kiện</h1><p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Dòng thời gian ghi lại ai đã thao tác gì, vào lúc nào và kết quả ra sao.</p></div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><div className="flex items-center gap-2 text-xs font-semibold text-[#d6e3f4]"><Activity size={15} /> Bản ghi phù hợp</div><div className="mt-1 text-3xl font-black">{counts.total}</div></div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <LogMetric label="Thành công" value={counts.success} tone="green" />
        <LogMetric label="Cảnh báo" value={counts.warning} tone="amber" />
        <LogMetric label="Thất bại" value={counts.failed} tone="rose" />
      </section>

      <section className="rounded-[22px] border border-[#d8e1ed] bg-[#ffffff]/90 p-4 shadow-[0_10px_30px_rgba(23,43,77,.04)] md:p-5">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#718096]"><Filter size={15} /> Tìm trong nhật ký</div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_150px_150px_160px_160px]">
          <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#95a3b8]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Người dùng, màn hình, thao tác…" className="w-full rounded-xl border border-[#d8e1ed] py-2.5 pl-9 pr-3 text-xs" /></label>
          <select value={subsystem} onChange={event => setSubsystem(event.target.value)} className="rounded-xl border border-[#d8e1ed] px-3 py-2.5 text-xs text-[#526784]"><option value="all">Tất cả phân hệ</option>{AVAILABLE_SUBSYSTEMS.map(item => <option key={item.code} value={item.code}>{item.code}</option>)}</select>
          <select value={result} onChange={event => setResult(event.target.value)} className="rounded-xl border border-[#d8e1ed] px-3 py-2.5 text-xs text-[#526784]"><option value="all">Mọi kết quả</option><option value="success">Thành công</option><option value="warning">Cảnh báo</option><option value="failed">Thất bại</option></select>
          <input aria-label="Từ ngày" type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} className="rounded-xl border border-[#d8e1ed] px-3 py-2.5 text-xs text-[#526784]" />
          <input aria-label="Đến ngày" type="date" value={toDate} onChange={event => setToDate(event.target.value)} className="rounded-xl border border-[#d8e1ed] px-3 py-2.5 text-xs text-[#526784]" />
        </div>
      </section>

      <section className="rounded-[24px] border border-[#d8e1ed] bg-[#ffffff]/90 p-4 shadow-[0_12px_36px_rgba(23,43,77,.045)] md:p-6">
        {grouped.length === 0 ? <div className="rounded-2xl border border-dashed border-[#d3deeb] py-16 text-center"><Activity className="mx-auto h-9 w-9 text-[#a6b4c7]" /><p className="mt-3 text-sm font-bold text-[#526784]">Chưa có sự kiện phù hợp</p><p className="mt-1 text-xs text-[#8290a4]">Thử thay đổi bộ lọc hoặc khoảng thời gian.</p></div> : <div className="space-y-8">
          {grouped.map(([day, dayLogs]) => <div key={day}>
              <div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf1fa] text-[#31588f]"><CalendarDays size={18} /></span><div><h2 className="text-sm font-bold capitalize text-[#1d355b]">{new Date(`${day}T12:00:00`).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h2><p className="text-[10px] text-[#95a3b8]">{dayLogs.length} sự kiện được ghi nhận</p></div></div>
            <div className="relative ml-5 border-l-2 border-[#d8e1ed] pl-6">
              <div className="space-y-3">{dayLogs.map(log => {
                const meta = statusMeta[log.resultStatus];
                const expanded = expandedIds.includes(log.id);
                const StatusIcon = meta.Icon;
                return <article key={log.id} className="relative rounded-2xl border border-[#e2e9f2] bg-white shadow-[0_4px_16px_rgba(23,43,77,.035)]">
                  <span className={`absolute -left-[34px] top-5 h-3.5 w-3.5 rounded-full border-[3px] border-[#ffffff] ${meta.dot}`} />
                  <button type="button" onClick={() => toggleExpand(log.id)} className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3"><span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${meta.pill}`}><StatusIcon size={17} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[11px] font-bold text-[#8290a4]">{log.timestamp.slice(11)}</span><span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${meta.pill}`}>{meta.label}</span><span className="rounded-full bg-[#edf2f8] px-2 py-0.5 text-[9px] font-black tracking-wide text-[#526784]">{log.subsystem}</span></div><h3 className="mt-1 truncate text-sm font-bold text-[#1d355b]">{log.actionName} <span className="font-medium text-[#8290a4]">tại {log.screenName || log.screenCode}</span></h3><p className="mt-1 text-xs text-[#718096]">{log.userName} <span className="text-[#a6b4c7]">· {log.userId} · {log.department}</span></p></div></div>
                    <span className="ml-12 flex shrink-0 items-center gap-2 text-[10px] font-semibold text-[#8290a4] sm:ml-0"><span>{log.entity}</span>{expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                  </button>
                  {expanded && <div className="grid gap-3 border-t border-[#edf2f8] bg-[#f6f8fb] px-4 py-3 sm:grid-cols-3"><Detail label="Mã màn hình" value={`${log.screenCode} · ${log.subsystem}`} /><Detail label="Thời điểm" value={log.timestamp} /><Detail label="Chi tiết hành động" value={log.details} wide /></div>}
                </article>;
              })}</div>
            </div>
          </div>)}
        </div>}
      </section>
      <p className="px-1 text-[10px] text-[#8290a4]">Nhật ký là bản ghi tra cứu theo sự kiện. Các bản ghi mẫu đang minh họa giao diện; log vận hành thật cần được phát sinh tại thao tác nghiệp vụ.</p>
    </div>
  );
}

function LogMetric({ label, value, tone }: { label: string; value: number; tone: 'green' | 'amber' | 'rose' }) {
  const styles = { green: 'border-l-emerald-500 text-emerald-800', amber: 'border-l-amber-500 text-amber-800', rose: 'border-l-rose-500 text-rose-800' };
  return <div className={`rounded-2xl border border-[#d8e1ed] border-l-4 bg-[#ffffff]/90 p-3.5 ${styles[tone]}`}><p className="text-[10px] font-bold uppercase tracking-wider text-[#8290a4]">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}

function Detail({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? 'sm:col-span-3' : ''}><p className="text-[9px] font-bold uppercase tracking-wider text-[#a6b4c7]">{label}</p><p className="mt-1 text-xs leading-5 text-[#526784]">{value}</p></div>;
}
