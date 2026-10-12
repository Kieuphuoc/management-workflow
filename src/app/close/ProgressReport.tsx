'use client';

import React, { useState } from 'react';
import { Download, Lock, RotateCcw, Search } from 'lucide-react';
import { useClose } from './CloseContext';
import { AccessDenied } from './CloseUI';
import { blockers, chainOrder, DEPARTMENTS, departmentName, doneInfo, monthLabel, timing, timingLabel, todayVn, userName, type DepartmentId, type Timing } from './model';
import { useWorkflowConfig } from '../workflow/useWorkflow';

type Filter = { from: string; to: string; group: string; department: 'all' | DepartmentId; status: 'all' | Timing; context: boolean };
const EMPTY: Filter = { from: '', to: '', group: 'all', department: 'all', status: 'all', context: true };
const timingStyle: Record<Timing, string> = { ontime: 'bg-emerald-50 text-emerald-700', late: 'bg-rose-50 text-rose-700', overdue: 'bg-amber-50 text-amber-700', upcoming: 'bg-slate-100 text-slate-500' };
const date = (value?: string) => value ? value.split('-').reverse().join('/') : '—';
const dateTime = (value?: string) => value ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const field = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700';

export function ProgressReport() {
  const { state, user, period } = useClose();
  const config = useWorkflowConfig();
  const [draft, setDraft] = useState<Filter>(EMPTY);
  const [applied, setApplied] = useState<Filter>(EMPTY);
  if (user.role === 'staff') return <AccessDenied />;

  const groups = state.workflows?.[period]?.groups ?? [];
  const today = todayVn();
  const inScope = state.tasks.filter(task => task.period === period && (applied.group === 'all' || task.groupId === applied.group) && (!applied.from || task.dueDate >= applied.from) && (!applied.to || task.dueDate <= applied.to));
  const rows = chainOrder(inScope, groups.map(group => group.id)).map(task => {
    const info = doneInfo(state, task);
    const binding = config.bindings.find(item => item.enabled && item.action !== 'save-filter' && item.taskId === task.templateId);
    const result = timing(task.dueDate, info?.at, today);
    const deptOk = applied.department === 'all' || task.department === applied.department;
    const statusOk = applied.status === 'all' || result === applied.status;
    return { task, info, binding, result, deptOk, statusOk, match: deptOk && statusOk, waiting: task.status === 'done' ? [] : blockers(state, task) };
  });
  const groupsWithMatch = new Set(rows.filter(row => row.match).map(row => row.task.groupId));
  const visible = rows.filter(row => row.statusOk && (row.deptOk || (applied.context && groupsWithMatch.has(row.task.groupId))));
  const matched = rows.filter(row => row.match);
  const stats = {
    total: matched.length,
    ontime: matched.filter(row => row.result === 'ontime').length,
    late: matched.filter(row => row.result === 'late' || row.result === 'overdue').length,
    notDone: matched.filter(row => row.result === 'overdue' || row.result === 'upcoming').length,
    overdue: matched.filter(row => row.result === 'overdue').length,
    upcoming: matched.filter(row => row.result === 'upcoming').length,
  };

  const exportCsv = () => {
    const header = ['STT', 'Mô tả thao tác', 'Phân hệ', 'Màn hình', 'Thao tác', 'Bộ phận', 'User/nhóm phụ trách', 'Ngày đến hạn', 'Người thao tác', 'Ngày thao tác', 'Đã thực hiện', 'Trạng thái'];
    const lines = visible.map(({ task, info, binding, result }) => [task.ordinal ?? '', task.title, binding?.module ?? '', binding?.screen ?? '', binding?.buttonLabel ?? 'Thủ công', departmentName(task.department), userName(task.assigneeId), date(task.dueDate), info ? userName(info.by) : '', info ? dateTime(info.at) : '', info ? 'Có' : 'Không', timingLabel[result]]);
    const csv = [header, ...lines].map(line => line.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `tinh-hinh-thuc-hien-${period}.csv`; link.click();
    URL.revokeObjectURL(url);
  };

  return <>
    <div className="mb-5"><p className="text-[11px] font-bold uppercase tracking-widest text-[#2585b8]">Báo cáo theo chuỗi công việc</p><h2 className="mt-1 text-2xl font-extrabold text-[#183355]">Tình hình thực hiện công việc · {monthLabel(period)}</h2><p className="mt-1 text-sm text-slate-500">Chọn một nhóm công việc để xem cả chuỗi liên thông giữa các bộ phận theo thứ tự phụ thuộc. Bộ phận chỉ là bộ lọc.</p></div>
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-[11px] font-semibold text-slate-500">Từ ngày<input aria-label="Từ ngày" type="date" value={draft.from} onChange={event => setDraft({ ...draft, from: event.target.value })} className={field} /></label>
        <label className="text-[11px] font-semibold text-slate-500">Đến ngày<input aria-label="Đến ngày" type="date" value={draft.to} onChange={event => setDraft({ ...draft, to: event.target.value })} className={field} /></label>
        <label className="text-[11px] font-semibold text-slate-500">Nhóm công việc / luồng<select aria-label="Nhóm công việc" value={draft.group} onChange={event => setDraft({ ...draft, group: event.target.value })} className={field}><option value="all">Tất cả nhóm</option>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
        <label className="text-[11px] font-semibold text-slate-500">Bộ phận<select aria-label="Bộ phận" value={draft.department} onChange={event => setDraft({ ...draft, department: event.target.value as Filter['department'] })} className={field}><option value="all">Tất cả bộ phận</option>{DEPARTMENTS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-[11px] font-semibold text-slate-500">Trạng thái<select aria-label="Trạng thái" value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as Filter['status'] })} className={field}><option value="all">Tất cả</option>{(Object.keys(timingLabel) as Timing[]).map(key => <option key={key} value={key}>{timingLabel[key]}</option>)}</select></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={draft.context} onChange={event => setDraft({ ...draft, context: event.target.checked })} className="accent-[#267da9]" />Giữ ngữ cảnh chuỗi khi lọc bộ phận (làm mờ các việc bộ phận khác)</label>
        <div className="flex gap-2">
          <button onClick={() => { setDraft(EMPTY); setApplied(EMPTY); }} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><RotateCcw size={13} />Đặt lại</button>
          <button onClick={() => setApplied(draft)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#1d5f93] px-4 py-2 text-xs font-bold text-white hover:bg-[#174e7b]"><Search size={13} />Xem báo cáo</button>
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><Download size={13} />Xuất Excel</button>
        </div>
      </div>
    </div>

    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1100px] text-left text-xs">
        <thead className="bg-[#f8fafc] text-[10px] font-extrabold uppercase tracking-wider text-slate-500"><tr>{['STT', 'Mô tả thao tác', 'Phân hệ', 'Màn hình', 'Thao tác', 'Bộ phận', 'User/nhóm phụ trách', 'Ngày đến hạn', 'Người thao tác', 'Ngày thao tác', 'Đã thực hiện', 'Trạng thái'].map(label => <th key={label} className="px-3 py-3">{label}</th>)}</tr></thead>
        <tbody>{visible.map(({ task, info, binding, result, deptOk, waiting }) => <tr key={task.id} data-testid="progress-row" className={`border-t border-slate-100 ${deptOk ? '' : 'opacity-45'}`}>
          <td className="px-3 py-3 font-bold tabular-nums text-[#42678c]">{task.ordinal ?? '—'}</td>
          <td className="px-3 py-3 font-semibold text-[#1d6f9f]">{task.title}{waiting.length > 0 && <span title={`Chờ: ${waiting.join(', ')}`} className="ml-2 inline-flex align-middle text-slate-400"><Lock size={12} /></span>}</td>
          <td className="px-3 py-3 text-slate-600">{binding?.module ?? '—'}</td>
          <td className="px-3 py-3 text-slate-600">{binding?.screen ?? '—'}</td>
          <td className="px-3 py-3"><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{binding?.buttonLabel ?? 'Thủ công'}</span></td>
          <td className="px-3 py-3 text-slate-700">{departmentName(task.department)}</td>
          <td className="px-3 py-3 text-slate-700">{userName(task.assigneeId)}</td>
          <td className="px-3 py-3 tabular-nums text-slate-600">{date(task.dueDate)}</td>
          <td className="px-3 py-3 text-slate-700">{info ? userName(info.by) : '—'}</td>
          <td className="px-3 py-3 tabular-nums text-slate-600">{info ? dateTime(info.at) : '—'}</td>
          <td className="px-3 py-3"><input type="checkbox" checked={Boolean(info)} readOnly disabled aria-label={`Đã thực hiện: ${task.title}`} className="accent-[#2563a8]" /></td>
          <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${timingStyle[result]}`}>{timingLabel[result]}</span></td>
        </tr>)}{!visible.length && <tr><td colSpan={12} className="px-3 py-12 text-center text-sm text-slate-500">Không có thao tác phù hợp với bộ lọc.</td></tr>}</tbody>
      </table>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
      ['Tổng số thao tác', stats.total, 'border-[#1d4f7c] text-[#1d4f7c]', `Trong kỳ ${monthLabel(period)}`],
      ['Số đúng hạn', stats.ontime, 'border-emerald-600 text-emerald-700', 'Đã thực hiện, trong quy định'],
      ['Số trễ hạn', stats.late, 'border-rose-600 text-rose-700', 'Bao gồm đã thực hiện trễ và quá hạn chưa làm'],
      ['Số chưa thực hiện', stats.notDone, 'border-slate-400 text-slate-500', `Gồm ${stats.overdue} quá hạn và ${stats.upcoming} chưa đến hạn`],
    ].map(([label, value, style, caption]) => <div key={String(label)} className={`rounded-xl border border-slate-200 border-l-4 bg-white p-4 ${String(style).split(' ')[0]}`}><p className="text-[11px] text-slate-500">{label}</p><p className={`mt-1 text-3xl font-extrabold ${String(style).split(' ')[1]}`} data-testid={`stat-${label}`}>{value}</p><p className="mt-1 text-[10px] text-slate-400">{caption}</p></div>)}</div>

    <div className="mt-6 text-[11px] leading-5 text-slate-500"><p className="font-bold text-slate-600">Ghi chú thiết kế</p><ul className="mt-1 list-disc space-y-1 pl-5">
      <li><strong>Từ ngày / Đến ngày</strong> lọc theo ngày đến hạn của công việc; <strong>Nhóm công việc</strong> hiển thị toàn bộ chuỗi, qua nhiều bộ phận, theo thứ tự phụ thuộc. <strong>Bộ phận</strong> chỉ làm mờ hoặc ẩn dòng.</li>
      <li><strong>Người thao tác</strong> và <strong>Ngày thao tác</strong> lấy tự động từ log khi người dùng bấm đúng nút nghiệp vụ; chưa thực hiện thì để trống (—). Ô <strong>Đã thực hiện</strong> không cho sửa tay với việc đã gắn nút.</li>
      <li><strong>Trạng thái:</strong> Đúng hạn (đã làm, ngày thao tác ≤ hạn), Trễ hạn (đã làm, sau hạn), Quá hạn (chưa làm, đã qua hạn), Chưa đến hạn (chưa làm, hạn còn ở tương lai).</li>
      <li>Khối thống kê cộng dồn theo đúng bộ lọc đang áp dụng; <strong>trễ hạn</strong> gộp “Trễ hạn” và “Quá hạn”, <strong>chưa thực hiện</strong> gộp “Quá hạn” và “Chưa đến hạn”.</li>
    </ul></div>
  </>;
}
