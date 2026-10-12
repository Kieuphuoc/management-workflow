'use client';

import { BookOpenCheck, Boxes, Calculator, Check, CircleAlert, Landmark, ListChecks, type LucideIcon } from 'lucide-react';
import TaskAuditLog from './TaskAuditLog';
import { useClose } from './CloseContext';
import { type CloseTask, type DepartmentId, departmentName, statusLabel, taskProgress, type TaskStatus } from './model';
import { groupDepartment } from '../workflow/config';

const DEPARTMENT_ICON: Record<DepartmentId, LucideIcon> = {
  warehouse: Boxes,
  cost: Calculator,
  receivables: Landmark,
  finance: BookOpenCheck,
};

const STATUS_STYLE: Record<TaskStatus, { color: string; surface: string; Icon: LucideIcon }> = {
  todo: { color: 'text-slate-400', surface: 'bg-slate-100', Icon: ListChecks },
  doing: { color: 'text-sky-700', surface: 'bg-sky-50', Icon: ListChecks },
  review: { color: 'text-amber-700', surface: 'bg-amber-50', Icon: ListChecks },
  done: { color: 'text-emerald-700', surface: 'bg-emerald-50', Icon: Check },
  blocked: { color: 'text-rose-700', surface: 'bg-rose-50', Icon: CircleAlert },
};

function groupStatus(tasks: CloseTask[]): TaskStatus {
  if (tasks.some(task => task.status === 'blocked')) return 'blocked';
  if (tasks.length > 0 && tasks.every(task => task.status === 'done')) return 'done';
  if (tasks.some(task => task.status === 'review')) return 'review';
  if (tasks.some(task => task.status === 'doing' || task.checklist.some(item => item.checked))) return 'doing';
  return 'todo';
}

export default function CloseWorkflowOverview() {
  const { state, period } = useClose();
  const workflow = state.workflows?.[period];
  if (!workflow) return null;

  const groups = workflow.groups.map(group => {
    const tasks = group.tasks.map(template => state.tasks.find(task => task.period === period && task.groupId === group.id && task.templateId === template.id)).filter((task): task is CloseTask => Boolean(task));
    return { group, tasks, status: groupStatus(tasks), department: groupDepartment(group) };
  });
  const totalTasks = groups.reduce((sum, item) => sum + item.tasks.length, 0);
  const completedTasks = groups.reduce((sum, item) => sum + item.tasks.filter(task => task.status === 'done').length, 0);

  return <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_14px_rgba(33,59,91,.025)] sm:p-6" aria-labelledby="published-workflow-title">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#2585b8]"><ListChecks size={14} /> Quy trình 2D đã chốt · Bản {workflow.revision}</div>
        <h3 id="published-workflow-title" className="text-lg font-extrabold text-[#183355]">Nhóm và công việc trong kỳ</h3>
        <p className="mt-1 text-xs text-slate-500">Đồng bộ từ khai báo quy trình · {completedTasks}/{totalTasks} công việc hoàn thành</p>
      </div>
      <span className="rounded-full bg-[#eef5fb] px-3 py-1.5 text-xs font-extrabold text-[#286e9a]">{taskProgress(groups.flatMap(item => item.tasks))}%</span>
    </div>

    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {groups.map(({ group, tasks, status, department }, index) => {
        const GroupIcon = DEPARTMENT_ICON[department];
        const style = STATUS_STYLE[status];
        const StatusIcon = style.Icon;
        const dependencies = group.dependsOnGroupIds.map(id => workflow.groups.find(candidate => candidate.id === id)?.name).filter((name): name is string => Boolean(name));
        return <article key={group.id} className="overflow-hidden rounded-xl border border-slate-200 bg-[#fcfdff]">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eaf3fa] text-[#2679a7]"><GroupIcon size={19} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Nhóm {String(index + 1).padStart(2, '0')} · {departmentName(department)}</p>
              <h4 className="truncate text-sm font-extrabold text-[#183355]">{group.name}</h4>
            </div>
            <span title={statusLabel[status]} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${style.surface} ${style.color}`}><StatusIcon size={12} />{taskProgress(tasks)}%</span>
          </div>
          {dependencies.length > 0 && <p className="px-4 pt-3 text-[10px] text-slate-400">Sau: {dependencies.join(' · ')}</p>}
          <ul className="space-y-1.5 p-3">
            {group.tasks.map((template, taskIndex) => {
              const task = tasks.find(item => item.templateId === template.id);
              const checked = task?.status === 'done';
              return <li key={template.id} className="min-w-0 rounded-lg px-2 py-2 hover:bg-white"><div className="flex min-w-0 items-start gap-2.5">
                <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${checked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent'}`}><Check size={11} /></span>
                <span className={`min-w-0 flex-1 text-xs leading-5 ${checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}><span className="mr-1.5 text-[10px] font-bold tabular-nums text-slate-400">{index + 1}.{taskIndex + 1}</span>{template.title}</span>
                {task && <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : task.status === 'blocked' ? 'bg-rose-500' : task.status === 'review' ? 'bg-amber-500' : task.status === 'doing' ? 'bg-sky-500' : 'bg-slate-300'}`} title={statusLabel[task.status]} />}
              </div>{task && <TaskAuditLog taskId={task.id} />}</li>;
            })}
          </ul>
        </article>;
      })}
    </div>
  </section>;
}
