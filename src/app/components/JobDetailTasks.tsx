'use client';

import React, { useState } from 'react';
import { GanttChart, CheckCircle2 } from 'lucide-react';
import { JobItem } from '../data/mockJmsData';

interface TaskRow {
  id: string;
  name: string;
  assignee: string;
  timeRange: string;
  startDay: number; // 1-20
  duration: number; // in days
  progress: number;
  status: 'Done' | 'In Progress' | 'Pending';
}

interface JobDetailTasksProps {
  job: JobItem;
}

export default function JobDetailTasks({ job }: JobDetailTasksProps) {
  const totalDays = 20;
  const currentDay = 14; // Today marker

  const [tasks, setTasks] = useState<TaskRow[]>([
    {
      id: '1',
      name: '1. Khảo sát & Chốt Brief',
      assignee: job.accountLead?.name || 'Trần Minh Quang',
      timeRange: '27/08 - 30/08',
      startDay: 1,
      duration: 4,
      progress: 100,
      status: 'Done',
    },
    {
      id: '2',
      name: '2. Thiết kế 3D Key Visual',
      assignee: 'Creative Studio',
      timeRange: '30/08 - 04/09',
      startDay: 4,
      duration: 5,
      progress: 100,
      status: 'Done',
    },
    {
      id: '3',
      name: '3. Sản xuất & Gia công POSM',
      assignee: job.projectLeader?.name || 'Lê Thị Mỹ Duyên',
      timeRange: '04/09 - 09/09',
      startDay: 8,
      duration: 6,
      progress: 75,
      status: 'In Progress',
    },
    {
      id: '4',
      name: '4. Vận chuyển & Lắp đặt',
      assignee: 'Logistics & Field',
      timeRange: '09/09 - 13/09',
      startDay: 13,
      duration: 4,
      progress: 30,
      status: 'In Progress',
    },
    {
      id: '5',
      name: '5. Nghiệm thu & Quyết toán',
      assignee: job.accountLead?.name || 'Trần Minh Quang',
      timeRange: '13/09 - 15/09',
      startDay: 16,
      duration: 5,
      progress: 0,
      status: 'Pending',
    },
  ]);

  const handleToggle = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const isDone = t.status === 'Done';
          return {
            ...t,
            status: isDone ? 'In Progress' : 'Done',
            progress: isDone ? 50 : 100,
          };
        }
        return t;
      })
    );
  };

  const doneCount = tasks.filter(t => t.status === 'Done').length;
  const overallProgress = Math.round(
    tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Streamlined Header */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <GanttChart className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Quản lý tiến độ công việc (Biểu đồ Gantt)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Tiến độ: {overallProgress}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {doneCount}/{tasks.length} công việc hoàn thành ({job.startDate} → {job.endDate})
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Hoàn thành</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-600" /> Đang làm</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-300" /> Chờ xử lý</span>
        </div>
      </div>

      {/* Gantt Chart with Clear Grid Lines & Ticks */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Timeline Header (4 Weeks & 20 Day Ticks) */}
            <div className="grid grid-cols-10 border-b border-slate-200/80 bg-slate-50 select-none text-[11px]">
              {/* Left Column: Task Name Header */}
              <div className="col-span-4 px-4 py-2 border-r border-slate-200/80 font-bold text-slate-700 flex items-center justify-between">
                <span>Đầu việc ({tasks.length})</span>
                <span className="text-[10px] text-slate-400 font-mono">Thời gian</span>
              </div>

              {/* Right Column: Weeks & Ruler Ticks */}
              <div className="col-span-6 flex flex-col">
                {/* 4 Week Headers */}
                <div className="grid grid-cols-4 divide-x divide-slate-200/80 text-center font-bold text-slate-700 py-1.5 border-b border-slate-200/60">
                  <div>Tuần 1</div>
                  <div>Tuần 2</div>
                  <div>Tuần 3</div>
                  <div>Tuần 4</div>
                </div>

                {/* Day Ticks Ruler */}
                <div className="flex text-center text-[9px] font-mono text-slate-400">
                  {Array.from({ length: totalDays }).map((_, i) => {
                    const isWeekEnd = (i + 1) % 5 === 0;
                    const isToday = i + 1 === currentDay;
                    return (
                      <div
                        key={i}
                        className={`flex-1 py-1 relative ${
                          isWeekEnd ? 'border-r border-slate-300 font-bold text-slate-600' : 'border-r border-dashed border-slate-200/80'
                        } ${isToday ? 'bg-blue-100/70 text-blue-700 font-bold' : ''}`}
                      >
                        {/* Vertical tick mark */}
                        <div className={`h-1.5 w-[1px] mx-auto -mt-1 mb-0.5 ${isWeekEnd ? 'bg-slate-400' : 'bg-slate-300'}`} />
                        <span>D{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Task Rows with Vertical Grid Lines */}
            <div className="divide-y divide-slate-100 relative">
              {tasks.map((task) => {
                const leftPct = ((task.startDay - 1) / totalDays) * 100;
                const widthPct = (task.duration / totalDays) * 100;

                return (
                  <div
                    key={task.id}
                    className="grid grid-cols-10 items-center px-4 py-3 hover:bg-blue-50/20 transition-colors text-xs relative"
                  >
                    {/* Left: Task info with toggle checkbox */}
                    <div className="col-span-4 flex items-center gap-2.5 pr-4 z-5">
                      <button
                        type="button"
                        onClick={() => handleToggle(task.id)}
                        className="cursor-pointer shrink-0 text-slate-300 hover:text-blue-600 transition-colors"
                        title={task.status === 'Done' ? 'Đã hoàn thành' : 'Đang xử lý'}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            task.status === 'Done' ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'
                          }`}
                        />
                      </button>

                      <div className="min-w-0">
                        <span
                          className={`font-semibold truncate block ${
                            task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {task.assignee} • {task.timeRange}
                        </span>
                      </div>
                    </div>

                    {/* Right: Gantt Bar with Grid Lines */}
                    <div className="col-span-6 relative h-7 flex items-center">
                      {/* Background Vertical Grid Lines */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {Array.from({ length: totalDays }).map((_, idx) => {
                          const isWeekEnd = (idx + 1) % 5 === 0;
                          return (
                            <div
                              key={idx}
                              className={`flex-1 h-full ${
                                isWeekEnd
                                  ? 'border-r border-slate-200/90'
                                  : 'border-r border-dashed border-slate-100'
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Today vertical indicator line */}
                      <div
                        className="absolute top-0 bottom-0 pointer-events-none z-10"
                        style={{ left: `${((currentDay - 0.5) / totalDays) * 100}%` }}
                      >
                        <div className="w-[1.5px] h-full bg-blue-500/80 border-l border-dashed border-blue-500" />
                      </div>

                      {/* Gantt Bar */}
                      <div
                        className="absolute h-5 rounded-lg transition-all flex items-center px-2 z-20 overflow-hidden shadow-2xs hover:shadow-xs cursor-pointer"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                        title={`${task.name}: ${task.progress}% (${task.timeRange})`}
                      >
                        {/* Background Color */}
                        <div
                          className={`absolute inset-0 ${
                            task.status === 'Done'
                              ? 'bg-emerald-500'
                              : task.status === 'In Progress'
                              ? 'bg-blue-600'
                              : 'bg-slate-300'
                          }`}
                        />

                        {/* Progress Overlay */}
                        <div
                          className="absolute top-0 bottom-0 left-0 bg-white/20"
                          style={{ width: `${task.progress}%` }}
                        />

                        {/* Label */}
                        <span className="relative z-10 text-[9px] font-bold text-white truncate drop-shadow-2xs">
                          {task.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-0.5 bg-blue-500 border-t border-dashed border-blue-500" />
            <span>Đường kẻ đứt màu xanh chỉ báo mốc ngày hôm nay (Day {currentDay}).</span>
          </div>
          <span>Các vạch dọc phân định ranh giới ngày và tuần.</span>
        </div>
      </div>
    </div>
  );
}
