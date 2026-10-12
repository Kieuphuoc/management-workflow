'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { LoaderCircle, MousePointer2, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import WorkflowIllustration, { type StageKey } from './WorkflowIllustration';
import type { SceneStage, WorkflowSceneController } from './threeWorkflowScene';

type Props = {
  stages: SceneStage[]; activeKey: StageKey | null; touring: boolean; paused: boolean;
  onSelect: (key: StageKey) => void; onInteraction: () => void; onReset: () => void;
  onPause: (paused: boolean) => void; onReady: (ready: boolean) => void; onUnavailable: (unavailable: boolean) => void;
};
const STAGE_META: Record<StageKey, { number: string; name: string }> = {
  warehouse: { number: '01', name: 'Kho' },
  cost: { number: '02', name: 'Giá thành' },
  receivables: { number: '03', name: 'Công nợ' },
  accounting: { number: '04', name: 'Kế toán tổng hợp' },
  report: { number: '05', name: 'Báo cáo tài chính' },
};
const STATUS_TEXT: Record<string, string> = {
  todo: 'CHƯA BẮT ĐẦU',
  doing: 'ĐANG THỰC HIỆN',
  review: 'CHỜ XÁC NHẬN',
  done: 'ĐÃ CHỐT',
  blocked: 'ĐANG VƯỚNG',
};

export default function WorkflowScene3D(props: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<WorkflowSceneController | null>(null);
  const propsRef = useRef(props);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'fallback'>('loading');
  useEffect(() => { propsRef.current = props; });
  useEffect(() => { sceneRef.current?.select(props.activeKey); }, [props.activeKey]);
  useEffect(() => { sceneRef.current?.updateStages(props.stages); }, [props.stages]);
  useEffect(() => { sceneRef.current?.setTouring(props.touring); }, [props.touring]);
  useEffect(() => { sceneRef.current?.setPaused(props.paused); }, [props.paused]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let canceled = false;
    let controller: WorkflowSceneController | null = null;
    const fallback = () => {
      if (canceled) return;
      setPhase('fallback');
      propsRef.current.onUnavailable(true);
      propsRef.current.onReady(false);
      propsRef.current.onInteraction();
    };
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionChanged = () => { if (media.matches) propsRef.current.onPause(true); };
    motionChanged();
    media.addEventListener('change', motionChanged);
    import('./threeWorkflowScene').then(({ createWorkflowScene }) => {
      if (canceled) return;
      try {
        controller = createWorkflowScene(host, propsRef.current.stages, {
          onSelect: key => propsRef.current.onSelect(key),
          onInteraction: () => propsRef.current.onInteraction(),
          onContextLost: fallback,
        });
        sceneRef.current = controller;
        controller.select(propsRef.current.activeKey);
        controller.setPaused(media.matches || propsRef.current.paused);
        controller.setTouring(propsRef.current.touring);
        setPhase('ready');
        propsRef.current.onReady(true);
        propsRef.current.onUnavailable(false);
      } catch { fallback(); }
    }).catch(fallback);
    return () => {
      canceled = true;
      media.removeEventListener('change', motionChanged);
      controller?.dispose();
      sceneRef.current = null;
    };
  }, []);

  const interact = (action: () => void) => { props.onInteraction(); action(); };
  return <>
    <div ref={hostRef} className="close-world__canvas" data-scene-state={phase} aria-hidden="true" />
    {phase === 'loading' && <div className="close-world__loading" role="status"><LoaderCircle size={20} /><span>Đang dựng bản đồ vận hành…</span></div>}
    {phase !== 'fallback' && <>
      <div className="close-world__hotspots" aria-label="Các khu vực trên bản đồ">{props.stages.map(stage => {
        const meta = STAGE_META[stage.key];
        const statusLabel = STATUS_TEXT[stage.status] ?? 'CHƯA BẮT ĐẦU';
        return <button
          key={stage.key} type="button" data-stage-key={stage.key}
          className={`close-world__stage-card close-world__hotspot close-world__chapter ${props.activeKey === stage.key ? 'is-active' : ''}`}
          aria-pressed={props.activeKey === stage.key} aria-label={`Khám phá ${meta.name}`}
          style={{ '--stage-color': stage.color } as CSSProperties}
          onClick={() => interact(() => props.onSelect(stage.key))}
        >
          <span className="close-world__stage-card-status">{meta.number} · {statusLabel}</span>
          <span className="close-world__stage-card-title">{meta.name}</span>
        </button>;
      })}</div>
    </>}
    {phase === 'ready' && <>
      <div className="close-world__tools" aria-label="Điều khiển góc nhìn 3D">
        <button type="button" onClick={() => interact(() => sceneRef.current?.zoomIn())} aria-label="Phóng to" title="Phóng to"><ZoomIn size={16} /></button>
        <button type="button" onClick={() => interact(() => sceneRef.current?.zoomOut())} aria-label="Thu nhỏ" title="Thu nhỏ"><ZoomOut size={16} /></button>
        <button type="button" onClick={() => { props.onReset(); sceneRef.current?.reset(); }} aria-label="Đặt lại góc nhìn" title="Toàn cảnh"><RotateCcw size={15} /></button>
        <button type="button" className="close-world__pause-btn" onClick={() => props.onPause(!props.paused)} aria-label={props.paused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'} aria-pressed={props.paused} title={props.paused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'}>{props.paused ? <Play size={14} /> : <Pause size={14} />}</button>
      </div>
      <span className="close-world__hint">Rê chuột chọn chặng · Cuộn trên mô hình để phóng to</span>
    </>}
    {phase === 'fallback' && <div className="close-world__fallback"><p>Góc nhìn minh họa · Trình duyệt chưa hỗ trợ 3D</p><div>{props.stages.map(stage => <button key={stage.key} type="button" aria-label={`Khám phá ${STAGE_META[stage.key].name}`} aria-pressed={props.activeKey === stage.key} onClick={() => props.onSelect(stage.key)}><WorkflowIllustration stage={stage.key} accent={stage.color} /><span>{STAGE_META[stage.key].name}</span></button>)}</div></div>}
  </>;
}
