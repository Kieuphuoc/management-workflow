'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, CalendarDays, CheckSquare, ClipboardList, LayoutDashboard, Menu, X, ChevronDown, Workflow, ListChecks, MousePointerClick } from 'lucide-react';
import { useClose } from '../close/CloseContext';
import { canSeeTask, DEPARTMENTS, monthLabel, USERS } from '../close/model';

const navigation = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard, manager: false },
  { href: '/admin/checklist', label: 'Công việc', icon: CheckSquare, manager: false },
  { href: '/admin/calendar', label: 'Lịch biểu', icon: CalendarDays, manager: true },
  { href: '/admin/report', label: 'Báo cáo bộ phận', icon: ClipboardList, manager: true },
  { href: '/admin/progress', label: 'Tiến độ thao tác', icon: ListChecks, manager: true },
  { href: '/admin/controllers', label: 'Mô phỏng controller', icon: MousePointerClick, manager: false },
  { href: '/admin/workflow', label: 'Khai báo quy trình', icon: Workflow, manager: true, chiefOnly: true },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, user, setUserId, period, setPeriod, toast } = useClose();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const visibleNavigation = navigation.filter(item => (!item.manager || user.role !== 'staff') && (!item.chiefOnly || user.role === 'chief'));
  const title = navigation.find(item => item.href === pathname)?.label ?? 'Kỳ chốt kế toán';
  const today = new Date().toISOString().slice(0, 10);
  const notifications = state.tasks.filter(task => task.period === period && canSeeTask(user, task) && (
    task.status === 'blocked' || task.status === 'review' || (task.status !== 'done' && task.dueDate < today)
  )).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6);

  return <div className="min-h-screen bg-[#f5f7fb] text-slate-800 lg:flex">
    {open && <button className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" aria-label="Đóng menu" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen ${open ? '' : '-translate-x-full lg:translate-x-0'} transition-transform`}>
      <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5">
        <Link href="/dashboard" onClick={() => setOpen(false)} className="flex min-w-0 items-center">
          <img src="/brands/Arito-brandname.webp" alt="Arito" className="h-auto max-h-11 w-[150px] object-contain object-left" />
        </Link>
        <button onClick={() => setOpen(false)} className="text-slate-500 lg:hidden" aria-label="Đóng menu"><X size={20} /></button>
      </div>
      <div className="flex-1 px-3 py-6">
        <nav aria-label="Điều hướng chính" className="space-y-1">
          {visibleNavigation.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-[#e9f0fb] text-[#194b87]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#194b87]'}`} aria-current={active ? 'page' : undefined}>
              <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />{item.label}
            </Link>;
          })}
        </nav>
        {pathname !== '/dashboard' && <div className="mt-8 rounded-2xl border border-[#dce8f3] bg-[#f5f9fd] p-4">
          <div className="text-xs font-bold text-[#215b8e]">Quy trình chốt kỳ</div>
          <p className="mt-2 text-xs leading-5 text-slate-600">Kho → Giá thành → Công nợ → Kế toán tổng hợp → Báo cáo tài chính.</p>
        </div>}
      </div>
      <div className="border-t border-slate-100 p-4">
        <div className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Chế độ xem thử vai trò</div>
        <div className="relative">
          <select aria-label="Xem thử với vai trò" value={user.id} onChange={event => { setUserId(event.target.value); router.push('/dashboard'); setOpen(false); }} className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-700">
            <optgroup label="Kế toán trưởng">{USERS.filter(item => item.role === 'chief').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>
            <optgroup label="Trưởng bộ phận">{USERS.filter(item => item.role === 'manager').map(item => <option key={item.id} value={item.id}>{item.name} · {DEPARTMENTS.find(department => department.id === item.department)?.short}</option>)}</optgroup>
            <optgroup label="Nhân viên">{USERS.filter(item => item.role === 'staff').map(item => <option key={item.id} value={item.id}>{item.name} · {DEPARTMENTS.find(department => department.id === item.department)?.short}</option>)}</optgroup>
          </select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3.5 text-slate-500" />
        </div>
        <p className="mt-2 text-[11px] leading-4 text-slate-400">Dữ liệu mẫu lưu trong trình duyệt; chọn vai trò chỉ để xem thử giao diện.</p>
      </div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3"><button className="rounded-lg p-2 text-slate-600 lg:hidden" onClick={() => setOpen(true)} aria-label="Mở menu"><Menu size={21} /></button><div><p className="text-[11px] font-semibold text-slate-400">Vận hành chốt kỳ</p><h1 className="text-base font-bold text-[#183355] sm:text-lg">{title}</h1></div></div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button type="button" aria-label="Thông báo" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#194b87]"><Bell size={19} />{notifications.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[9px] font-bold leading-none text-white">{notifications.length}</span>}</button>
            {notificationsOpen && <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"><div className="border-b border-slate-100 px-4 py-3"><p className="text-sm font-extrabold text-[#183355]">Thông báo</p><p className="mt-0.5 text-xs text-slate-500">{monthLabel(period)} · {notifications.length} việc cần chú ý</p></div>{notifications.length ? <div className="max-h-80 overflow-y-auto">{notifications.map(task => <button key={task.id} type="button" onClick={() => { setNotificationsOpen(false); router.push('/admin/checklist'); }} className="block w-full border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-slate-50"><span className="block truncate text-xs font-bold text-slate-700">{task.title}</span><span className="mt-1 block text-[11px] text-slate-500">{task.status === 'blocked' ? 'Đang vướng' : task.status === 'review' ? 'Chờ duyệt' : `Quá hạn · ${new Date(`${task.dueDate}T00:00:00`).toLocaleDateString('vi-VN')}`}</span></button>)}</div> : <p className="px-4 py-6 text-center text-xs text-slate-500">Bạn chưa có thông báo mới.</p>}</div>}
          </div>
          <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#dbeafa] text-xs font-extrabold text-[#17477d]">{user.initials}</span><div className="hidden xl:block"><p className="text-xs font-bold text-slate-800">{user.name}</p><p className="text-[11px] text-slate-500">{user.role === 'chief' ? 'Kế toán trưởng' : user.role === 'manager' ? 'Trưởng bộ phận' : 'Nhân viên'}</p></div></div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] p-4 pb-16 sm:p-7 lg:p-9">{children}</main>
      {toast && <div key={toast.message} role="status" className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${toast.error ? 'bg-rose-700 text-white' : 'bg-[#183b65] text-white'}`}>{toast.message}</div>}
    </div>
  </div>;
}
