'use client';
import { History } from 'lucide-react';
import { useClose } from './CloseContext';
import { canSeeTask, userName, USERS } from './model';
export default function TaskAuditLog({ taskId, compact = false, expanded = false, onOpen }: { taskId: string; compact?: boolean; expanded?: boolean; onOpen?: () => void }) {
 const { state, user } = useClose();
 const task = state.tasks.find(item => item.id === taskId);
 if (!task || !canSeeTask(user, task)) return null;
 const logs = state.audit.filter(entry => entry.targetType === 'task' && entry.targetId === taskId);
 if (compact) return <button type="button" onClick={onOpen} aria-expanded={expanded} aria-label={`${expanded ? 'Ẩn' : 'Xem'} ${logs.length} nhật ký thao tác của ${task.title}`} title="Nhật ký thao tác" className={`grid h-9 w-9 place-items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2679a7] ${expanded ? 'bg-blue-50 text-[#2679a7]' : 'text-slate-400 hover:bg-slate-100 hover:text-[#2679a7]'}`}><History size={17} /></button>;
 if (expanded) return <section aria-label={`Nhật ký thao tác của ${task.title}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
   <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-[#f8fafc] px-4 py-3">
    <div className="flex min-w-0 items-center gap-2.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#2679a7]"><History size={16} /></span><div><h4 className="text-xs font-extrabold text-[#183355]">Nhật ký thao tác</h4><p className="mt-0.5 text-[10px] text-slate-500">Ai đã làm gì, ghi chú và thời gian thực hiện.</p></div></div>
    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">{logs.length} hoạt động</span>
   </header>
   {logs.length ? <ol className="divide-y divide-slate-100 px-4">{logs.map(entry => {
     const actor = USERS.find(item => item.id === entry.actorId);
     const detail = entry.action === 'Ghi chú công việc' && entry.after && typeof entry.after === 'object' && 'note' in entry.after ? String(entry.after.note || 'Đã xóa ghi chú.') : entry.detail;
     const tone = entry.action.includes('Duyệt') || entry.action.includes('Chốt') ? 'bg-emerald-50 text-emerald-700' : entry.action.includes('Trình') ? 'bg-blue-50 text-blue-700' : entry.action.includes('vướng') ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600';
     return <li key={entry.id} className="flex gap-2.5 py-3">
      <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e6f0fb] text-[10px] font-extrabold text-[#17477d]">{actor?.initials ?? entry.actorId.slice(0, 2).toUpperCase()}</span>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><p className="text-xs font-bold text-[#213b5a]">{userName(entry.actorId)}</p><span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${tone}`}>{entry.action}</span><time dateTime={entry.at} className="ml-auto text-[10px] text-slate-400">{new Date(entry.at).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok' })}</time></div><p className="mt-1 break-words text-[11px] leading-5 text-slate-600">{detail}</p></div>
     </li>;
    })}</ol> : <p className="px-4 py-5 text-center text-xs text-slate-400">Chưa có thao tác nào được ghi nhận cho công việc này.</p>}
  </section>;
 return <details className={compact ? 'relative' : 'mt-2 min-w-0 rounded-lg border border-slate-100 bg-white px-3 py-2'}>
  <summary aria-label={`Nhật ký thao tác của ${task.title}`} title="Nhật ký thao tác" className={compact ? 'grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#2679a7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2679a7] [&::-webkit-details-marker]:hidden' : 'flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-[#2679a7]'}>
   <History size={16} />{compact ? <span className="sr-only">Nhật ký thao tác</span> : <> Nhật ký thao tác <span className="ml-auto text-slate-400">{logs.length}</span></>}
  </summary>
  <div className={compact ? 'absolute right-0 top-10 z-30 max-h-72 w-[min(20rem,calc(100vw-5rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl' : ''}>
   {compact && <p className="mb-3 text-xs font-bold text-slate-600">Nhật ký thao tác <span className="ml-1 text-slate-400">{logs.length}</span></p>}
   {logs.length ? <ol className="space-y-3">{logs.map(entry => <li key={entry.id} className="text-xs"><p className="font-bold text-slate-700">{entry.action} · {userName(entry.actorId)}</p><time dateTime={entry.at} className="text-[10px] text-slate-400">{new Date(entry.at).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok' })}</time><p className="mt-1 break-words leading-5 text-slate-500">{entry.detail}</p></li>)}</ol> : <p className="text-xs text-slate-400">Chưa có thay đổi nào trong kỳ này.</p>}
  </div>
 </details>;
}
