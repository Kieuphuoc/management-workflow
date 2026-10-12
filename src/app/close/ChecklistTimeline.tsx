'use client';

import { Check } from 'lucide-react';
import TaskAuditLog from './TaskAuditLog';
import { useState } from 'react';
import { useClose } from './CloseContext';
import { blockers, canManageDepartment, type CloseTask, type DepartmentId, departmentName, monthLabel, taskProgress, userName } from './model';
import CustomSelect, { type CustomSelectOption } from '../components/CustomSelect';

interface ChecklistTimelineProps {
  tasks: CloseTask[];
  allTasks: CloseTask[];
  period: string;
  onCreate: (department: DepartmentId) => void;
  departments: { id: DepartmentId; name: string }[];
}

export default function ChecklistTimeline({ tasks, allTasks, period, onCreate, departments }: ChecklistTimelineProps) {
  const { state, user, act } = useClose();
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [openAuditTaskId, setOpenAuditTaskId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const dates = [...new Set(tasks.map(task => task.dueDate))].sort();
  const completed = allTasks.filter(task => task.status === 'done').length;
  const departmentOptions: CustomSelectOption[] = departments.map(department => ({ value: department.id, label: department.name }));

  return <section aria-label="Tiến độ công việc theo hạn xử lý" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-[#fbfcfe] px-5 py-4">
      <div>
        <h3 className="font-extrabold text-[#183355]">{monthLabel(period)}</h3>
        <p className="mt-1 text-xs text-slate-500">{completed}/{allTasks.length} công việc hoàn thành · {taskProgress(allTasks)}%</p>
      </div>
      {departments.length > 0 && <CustomSelect
        ariaLabel="Chọn bộ phận để giao việc"
        value=""
        onChange={value => onCreate(value as DepartmentId)}
        options={departmentOptions}
        placeholder="+ Giao việc mới"
        className="w-full sm:w-56"
        buttonClassName="border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        menuClassName="min-w-56"
      />}
    </div>
    {dates.length ? <ol className="space-y-5 p-5">
      {dates.map(date => <li key={date} className="relative border-l-2 border-slate-100 pl-5">
        <span aria-hidden="true" className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#2585b8]" />
        <time dateTime={date} className="text-xs font-extrabold text-[#2378a9]">
          {new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </time>
        <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {tasks.filter(task => task.dueDate === date).map(task => {
            const waiting = blockers(state, task);
            const reportClosed = state.reports.some(report => report.period === task.period && report.department === task.department && report.status === 'closed');
            const canEdit = !reportClosed && task.status !== 'review' && task.status !== 'done' && (task.assigneeId === user.id || canManageDepartment(user, task.department));
            const checklistComplete = task.checklist.every(item => item.checked);
            const completionOpen = completingTaskId === task.id;
            const checkboxHint = task.status === 'done' ? 'Công việc đã hoàn thành'
              : task.status === 'review' ? 'Công việc đang chờ quản lý duyệt'
              : reportClosed ? 'Báo cáo bộ phận đã chốt'
              : !canEdit ? 'Chỉ người được giao hoặc quản lý bộ phận được cập nhật'
              : waiting.length ? `Cần hoàn tất trước: ${waiting.join(', ')}`
              : 'Đánh dấu hoàn thành';
            return <li key={task.id} className="relative">
              <div className="flex items-center gap-1">
              <button
                type="button"
                role="checkbox"
                aria-checked={task.status === 'done' || task.status === 'review'}
                aria-label={`Đánh dấu hoàn thành: ${task.title}`}
                title={checkboxHint}
                disabled={!canEdit || Boolean(waiting.length) || task.status === 'review' || task.status === 'done'}
                onClick={() => { setCompletionNote(''); setCompletingTaskId(task.id); }}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2585b8] ${task.status === 'done' ? 'text-emerald-600' : task.status === 'review' ? 'text-blue-600' : 'text-slate-400'} ${canEdit && !waiting.length ? 'cursor-pointer hover:bg-blue-50 hover:text-[#2585b8]' : 'cursor-not-allowed opacity-70'}`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded-md border-2 transition-colors ${task.status === 'done' ? 'border-emerald-600 bg-emerald-600 text-white' : task.status === 'review' ? 'border-blue-600 bg-blue-600 text-white' : 'border-current bg-white'}`}>
                  {(task.status === 'done' || task.status === 'review') && <Check size={13} strokeWidth={3} />}
                </span>
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[#213b5a]">{task.ordinal ?? task.step}. {task.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{departmentName(task.department)} · {userName(task.assigneeId)} · Checklist {task.checklist.filter(item => item.checked).length}/{task.checklist.length}</span>
                </span>
              </div>
              <div className="pr-3"><TaskAuditLog taskId={task.id} compact expanded={openAuditTaskId === task.id} onOpen={() => setOpenAuditTaskId(openAuditTaskId === task.id ? null : task.id)} /></div>
              </div>
              {openAuditTaskId === task.id && <div className="border-t border-slate-100 px-4 py-3"><TaskAuditLog taskId={task.id} expanded /></div>}
              {completionOpen && <div className="ml-12 mr-3 mb-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700">Các mục cần hoàn tất</p>
                  <span className="text-[11px] font-semibold text-slate-400">{task.checklist.filter(item => item.checked).length}/{task.checklist.length}</span>
                </div>
                <div className="mb-3 space-y-1">
                  {task.checklist.map((item, index) => <label key={`${task.id}-completion-${index}`} className={`flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-xs ${item.checked ? 'text-slate-400' : 'text-slate-600'} hover:bg-white/70`}>
                    <input type="checkbox" checked={item.checked} onChange={event => act({ type: 'set-check', taskId: task.id, index, checked: event.target.checked })} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#2585b8]" />
                    <span className={item.checked ? 'line-through' : ''}>{item.label}</span>
                  </label>)}
                </div>
                <label className="block text-xs font-bold text-slate-700" htmlFor={`completion-note-${task.id}`}>Ghi chú khi hoàn thành <span className="font-normal text-slate-400">(không bắt buộc)</span></label>
                <textarea id={`completion-note-${task.id}`} value={completionNote} onChange={event => setCompletionNote(event.target.value)} rows={2} maxLength={2000} placeholder="Mô tả kết quả hoặc ghi chú hoàn thành..." className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" />
                {waiting.length > 0 && <p className="mt-1 text-xs text-amber-700">Cần xử lý trước: {waiting.join(', ')}</p>}
                {!checklistComplete && <p className="mt-1 text-xs text-slate-500">Tích đủ các mục kiểm tra để gửi quản lý duyệt.</p>}
                <div className="mt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setCompletingTaskId(null)} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-white">Hủy</button>
                  <button type="button" disabled={Boolean(waiting.length) || !checklistComplete} onClick={() => { if (act({ type: 'task-status', taskId: task.id, status: 'review', note: completionNote })) setCompletingTaskId(null); }} className="rounded-lg bg-[#183b65] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Gửi quản lý duyệt</button>
                </div>
              </div>}
            </li>;
          })}
        </ul>
      </li>)}
    </ol> : <p className="p-12 text-center text-sm text-slate-500">Không có công việc phù hợp bộ lọc.</p>}
  </section>;
}
