'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpenCheck, Boxes, Calculator, ChevronLeft, ChevronRight, FileBarChart2, Landmark, Pause, Route, type LucideIcon } from 'lucide-react';
import { useClose } from './CloseContext';
import { type CloseTask, type DepartmentId, monthLabel, taskProgress } from './model';
import { type StageKey } from './WorkflowIllustration';
import WorkflowScene3D from './WorkflowScene3D';
import './workflow.css';

type WorkflowStatus = 'todo' | 'doing' | 'review' | 'done' | 'blocked';
type StageDefinition = {
  key: StageKey; number: string; name: string; shortName: string; description: string;
  Icon: LucideIcon; filter: (task: CloseTask) => boolean; reportDepartment?: DepartmentId;
};
const STAGES: StageDefinition[] = [
  { key: 'warehouse', number: '01', name: 'Kho & giao nhận', shortName: 'Chốt tồn kho', Icon: Boxes,
    description: 'Mọi con số bắt đầu từ đây. Đối chiếu nhập, xuất và giao hàng để xác nhận số lượng tồn cuối kỳ.',
    filter: task => task.department === 'warehouse', reportDepartment: 'warehouse' },
  { key: 'cost', number: '02', name: 'Giá thành', shortName: 'Tính giá thành', Icon: Calculator,
    description: 'Từ nguyên liệu đến thành phẩm. Tập hợp chi phí sản xuất, tính giá thành và đối chiếu giá vốn.',
    filter: task => task.department === 'cost', reportDepartment: 'cost' },
  { key: 'receivables', number: '03', name: 'Công nợ', shortName: 'Đối chiếu công nợ', Icon: Landmark,
    description: 'Kết nối các dòng tiền. Đối chiếu phải thu, phải trả, tiền mặt và số dư ngân hàng.',
    filter: task => task.department === 'receivables', reportDepartment: 'receivables' },
  { key: 'accounting', number: '04', name: 'Kế toán tổng hợp', shortName: 'Kết chuyển sổ', Icon: BookOpenCheck,
    description: 'Đưa số liệu về cùng một bức tranh. Kiểm tra bút toán cuối kỳ và kết chuyển doanh thu, chi phí.',
    filter: task => task.department === 'finance' && task.step === 5 },
  { key: 'report', number: '05', name: 'Báo cáo tài chính', shortName: 'Chốt báo cáo', Icon: FileBarChart2,
    description: 'Hoàn tất hành trình của số liệu. Lập, rà soát và xác nhận bộ báo cáo tài chính của kỳ.',
    filter: task => task.department === 'finance' && task.step === 6, reportDepartment: 'finance' },
];
const STATUS: Record<WorkflowStatus, { label: string; color: string }> = {
  todo: { label: 'Chưa bắt đầu', color: '#71847d' }, doing: { label: 'Đang thực hiện', color: '#287b91' },
  review: { label: 'Chờ xác nhận', color: '#aa741f' }, done: { label: 'Đã chốt', color: '#278064' },
  blocked: { label: 'Đang vướng', color: '#bc5547' },
};
function resolveStatus(tasks: CloseTask[], reportClosed: boolean, hasReport: boolean): WorkflowStatus {
  if (reportClosed) return 'done';
  if (tasks.some(task => task.status === 'blocked')) return 'blocked';
  if (tasks.length > 0 && tasks.every(task => task.status === 'done')) return hasReport ? 'review' : 'done';
  if (tasks.some(task => task.status === 'review')) return 'review';
  if (tasks.some(task => task.status === 'doing' || task.checklist.some(item => item.checked))) return 'doing';
  return 'todo';
}

export default function CloseWorkflowMap() {
  const { state, period } = useClose();
  const [activeKey, setActiveKey] = useState<StageKey | null>('cost');
  const [touring, setTouring] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const stageData = useMemo(() => {
    const periodTasks = state.tasks.filter(task => task.period === period);
    return STAGES.map(stage => {
      const tasks = periodTasks.filter(stage.filter);
      const reportClosed = Boolean(stage.reportDepartment && state.reports.some(report => report.period === period && report.department === stage.reportDepartment && report.status === 'closed'));
      return { ...stage, tasks, status: resolveStatus(tasks, reportClosed, Boolean(stage.reportDepartment)), progress: reportClosed ? 100 : taskProgress(tasks) };
    });
  }, [state, period]);
  const sceneStages = useMemo(() => stageData.map(stage => ({
    key: stage.key,
    color: STATUS[stage.status].color,
    status: stage.status
  })), [stageData]);
  const active = stageData.find(stage => stage.key === activeKey);
  const totalProgress = Math.round(stageData.reduce((sum, stage) => sum + stage.progress, 0) / stageData.length);
  const closedCount = stageData.filter(stage => stage.status === 'done').length;
  const selectStage = (key: StageKey | null) => { setTouring(false); setActiveKey(key); };
  const currentStatus = active ? active.status : 'doing';
  const currentProgress = active ? active.progress : totalProgress;

  return <section className="close-world" aria-labelledby="close-workflow-title">
    <div className="close-world__topbar">
      <div className="close-world__topbar-left">
        <div className="close-world__title-row">
          <h2 className="close-world__title">Quy trình chốt kỳ</h2>
          <span className="close-world__badge">5 CHẶNG</span>
        </div>
        <p className="close-world__subtitle">Dòng dữ liệu đi tuần tự từ kho đến báo cáo tài chính</p>
      </div>
      <div className="close-world__topbar-right">
        <button
          type="button"
          className="close-world__view-btn"
          aria-pressed={!activeKey}
          onClick={() => selectStage(null)}
        >
          Toàn cảnh
        </button>
        <div className="close-world__summary-pill">
          <div className="close-world__summary-info">
            <span className="close-world__summary-label">TOÀN QUY TRÌNH</span>
            <strong className="close-world__summary-value">{totalProgress}%</strong>
          </div>
          <Link href="/admin/checklist" className="close-world__summary-link" aria-label="Xem toàn quy trình">
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <span className="close-world__period" style={{ display: 'none' }}>{monthLabel(period)}</span>
      </div>
    </div>
    <div className="close-world__experience">
      <WorkflowScene3D
        stages={sceneStages}
        activeKey={activeKey}
        touring={touring}
        paused={paused}
        onSelect={setActiveKey}
        onInteraction={() => setTouring(false)}
        onReset={() => selectStage(null)}
        onPause={value => { setPaused(value); if (value) setTouring(false); }}
        onReady={setReady}
        onUnavailable={setUnavailable}
      />
      <div className="close-world__detail-card" key={active?.key ?? 'overview'}>
        <p className="close-world__eyebrow">
          {active ? `CHẶNG ${active.number} / 05` : 'TOÀN QUY TRÌNH / 05'}
        </p>
        <h3 id="close-workflow-title">{active ? active.name : 'Chốt kỳ kế toán'}</h3>
        <p className="close-world__description">
          {active?.description ?? 'Dòng dữ liệu đi tuần tự từ kho đến báo cáo tài chính. Chọn từng chặng để xem chi tiết.'}
        </p>
        <div className="close-world__status" style={{ color: STATUS[currentStatus].color }}>
          <span style={{ background: STATUS[currentStatus].color }} />
          {STATUS[currentStatus].label}
        </div>
        <div
          className="close-world__progress"
          role="progressbar"
          aria-label={`Tiến độ ${active ? active.name : 'toàn kỳ'}`}
          aria-valuenow={currentProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${currentProgress}%`, background: STATUS[currentStatus].color }} />
        </div>
        <div className="close-world__progress-caption">
          <span>{active ? `${active.tasks.filter(task => task.status === 'done').length}/${active.tasks.length} việc đã duyệt` : `${closedCount}/5 chặng đã chốt`}</span>
          <strong>{currentProgress}%</strong>
        </div>
        <div className="close-world__actions">
          <Link href="/admin/checklist" className="close-world__task-link">
            Xem công việc <ArrowUpRight size={14} />
          </Link>
          <button
            type="button"
            className="close-world__tour"
            disabled={!ready || unavailable}
            aria-pressed={touring}
            onClick={() => { setTouring(!touring); if (!touring) setPaused(false); }}
            title={touring ? 'Dừng hành trình' : 'Khám phá quy trình'}
          >
            <span>{touring ? 'Dừng' : 'Tour'}</span>
            {touring ? <Pause size={13} /> : <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  </section>;
}
