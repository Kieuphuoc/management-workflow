import {
  blockers, canManageDepartment, canSeeTask, ActionLog, ActionResult, CloseState, CloseTask, DepartmentId, departmentName,
  initialState, makePeriod, generationAudit, reportMetrics, User, USERS,
} from './model';
import { completingBindings, publishedWorkflow, type WorkflowGroup } from '../workflow/config';
import { getWorkflowSnapshot } from '../workflow/store';
import { reconcileWorkflow, validateWorkflow } from '../workflow/runtime';

const STORAGE_KEY = 'arito-close-demo-v2';
const serverSnapshot = initialState();
let current: CloseState | null = null;
const listeners = new Set<() => void>();

export function getSnapshot(): CloseState {
  if (current) return current;
  if (typeof window === 'undefined') return serverSnapshot;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CloseState;
      if (parsed.version === 1 && Array.isArray(parsed.tasks) && Array.isArray(parsed.reports) && Array.isArray(parsed.audit) && Array.isArray(parsed.periods)) {
        // Repair generation entries saved by older builds with corrupted Vietnamese text.
        const tasksById = new Map(parsed.tasks.map(task => [task.id, task]));
        parsed.audit = parsed.audit.map(entry => {
          if (entry.targetType !== 'task' || !entry.id.startsWith('generated:') || !entry.action.includes('?')) return entry;
          const task = tasksById.get(entry.targetId);
          return task ? { ...entry, action: 'Sinh công việc', detail: `Sinh “${task.title}” từ quy trình đã chốt` } : entry;
        });
        if (!parsed.workflows) {
          const published = publishedWorkflow(getWorkflowSnapshot());
          const generated = parsed.periods.map(period => ({ period, ...makePeriod(period, published.groups, published.revision) }));
          const tasks = generated.flatMap(item => item.tasks);
          current = { ...parsed, archivedTasks: [...(parsed.archivedTasks ?? []), ...parsed.tasks], tasks,
            reports: generated.flatMap(item => item.reports), workflows: Object.fromEntries(generated.map(item => [item.period, item.workflow])),
            audit: [...generationAudit(tasks, 'chief'), ...parsed.audit] };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        } else current = parsed;
      }
    }
  } catch { /* Private browsing can disable storage; the demo stays usable in memory. */ }
  if (!current) {
    const published = publishedWorkflow(getWorkflowSnapshot());
    const generated = makePeriod(serverSnapshot.periods[0], published.groups, published.revision);
    current = { ...serverSnapshot, tasks: generated.tasks, reports: generated.reports, workflows: { [serverSnapshot.periods[0]]: generated.workflow }, audit: generationAudit(generated.tasks, 'chief') };
  }
  return current;
}

export function getServerSnapshot() { return serverSnapshot; }
export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function commit(next: CloseState) {
  current = next;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* See above. */ }
  listeners.forEach(listener => listener());
}

function update(state: CloseState, actor: User, target: 'task' | 'report' | 'period', targetId: string, period: string, department: DepartmentId | undefined, action: string, detail: string, before: unknown, after: unknown, patch: Partial<CloseState>) {
  const entry = {
    id: crypto.randomUUID(), at: new Date().toISOString(), actorId: actor.id, action,
    targetType: target, targetId, period, department, detail, before, after,
  } as const;
  commit({ ...state, ...patch, audit: [entry, ...(patch.audit ?? state.audit)] });
}

function userFor(id: string) {
  const user = USERS.find(item => item.id === id);
  if (!user) throw new Error('Người dùng không hợp lệ.');
  return user;
}

function activeTask(state: CloseState, actor: User, id: string) {
  const task = state.tasks.find(item => item.id === id);
  if (!task || !canSeeTask(actor, task)) throw new Error('Bạn không có quyền xem công việc này.');
  const report = state.reports.find(item => item.period === task.period && item.department === task.department);
  if (report?.status === 'closed') throw new Error('Báo cáo bộ phận đã chốt. Hãy mở lại báo cáo trước khi sửa công việc.');
  return task;
}

function saveTask(state: CloseState, actor: User, task: CloseTask, next: CloseTask, action: string, detail: string) {
  update(state, actor, 'task', task.id, task.period, task.department, action, detail, task, next, {
    tasks: state.tasks.map(item => item.id === task.id ? next : item),
  });
}

function requireEditable(task: CloseTask, actor: User) {
  if (task.assigneeId !== actor.id && !canManageDepartment(actor, task.department)) throw new Error('Chỉ người được giao hoặc trưởng bộ phận được cập nhật.');
  if (task.status === 'review' || task.status === 'done') throw new Error('Công việc đã trình duyệt. Hãy yêu cầu trả lại trước khi sửa.');
}

export type CloseAction =
  | { type: 'set-check'; taskId: string; index: number; checked: boolean }
  | { type: 'set-note'; taskId: string; note: string }
  | { type: 'set-metric'; taskId: string; key: string; value: number | null }
  | { type: 'task-status'; taskId: string; status: 'todo' | 'doing' | 'blocked' | 'review' | 'done'; note?: string }
  | { type: 'assign'; taskId: string; assigneeId: string; dueDate: string }
  | { type: 'add-task'; period: string; department: DepartmentId; step: number; title: string; description: string; assigneeId: string; dueDate: string; checklist: string[] }
  | { type: 'record-action'; controller: string; screen: string; action: 'submit' | 'save-filter' | 'run'; period: string; docRef?: string }
  | { type: 'close-report'; period: string; department: DepartmentId; note: string }
  | { type: 'reopen-report'; period: string; department: DepartmentId; reason: string }
  | { type: 'new-period'; period: string }
  | { type: 'publish-workflow'; period: string; groups: WorkflowGroup[]; revision: number };

export function dispatch(actorId: string, action: CloseAction): string {
  try {
    const state = getSnapshot();
    const actor = userFor(actorId);
    if (action.type === 'publish-workflow') {
      if (actor.role !== 'chief') throw new Error('Chỉ kế toán trưởng được chốt quy trình.');
      if (!state.periods.includes(action.period)) throw new Error('Kỳ chốt không tồn tại.');
      const result = reconcileWorkflow(state, action.period, action.groups, action.revision, actor.id);
      const entry = { id: crypto.randomUUID(), at: new Date().toISOString(), actorId, action: 'Chốt quy trình', targetType: 'period' as const, targetId: action.period, period: action.period, detail: `Bản ${action.revision}: ${action.groups.length} nhóm, ${result.tasks.length} công việc`, before: state.workflows?.[action.period], after: result.workflow };
      commit({ ...state, tasks: [...state.tasks.filter(task => task.period !== action.period), ...result.tasks],
        reports: [...state.reports.filter(report => report.period !== action.period), ...result.reports],
        workflows: { ...state.workflows, [action.period]: result.workflow }, audit: [entry, ...result.audit, ...state.audit] });
      return '';
    }
    if (action.type === 'new-period') {
      if (actor.role !== 'chief') throw new Error('Chỉ kế toán trưởng được tạo kỳ chốt.');
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(action.period)) throw new Error('Kỳ chốt không hợp lệ.');
      if (state.periods.includes(action.period)) throw new Error('Kỳ chốt đã tồn tại.');
      const published = publishedWorkflow(getWorkflowSnapshot());
      validateWorkflow(published.groups);
      const generated = makePeriod(action.period, published.groups, published.revision);
      update(state, actor, 'period', action.period, action.period, undefined, 'Tạo kỳ chốt', `Tạo checklist cho ${action.period}`, null, { period: action.period }, {
        periods: [action.period, ...state.periods].sort().reverse(), tasks: [...state.tasks, ...generated.tasks], reports: [...state.reports, ...generated.reports],
        workflows: { ...state.workflows, [action.period]: generated.workflow },
        audit: [...generationAudit(generated.tasks, actor.id), ...state.audit],
      });
      return '';
    }
    if (action.type === 'add-task') {
      if (!canManageDepartment(actor, action.department)) throw new Error('Bạn chỉ được giao việc trong bộ phận mình quản lý.');
      if (!state.periods.includes(action.period)) throw new Error('Kỳ chốt không tồn tại.');
      if (state.reports.find(report => report.period === action.period && report.department === action.department)?.status === 'closed') throw new Error('Mở lại báo cáo trước khi thêm việc.');
      const assignee = userFor(action.assigneeId);
      if (assignee.department !== action.department) throw new Error('Chỉ giao việc cho nhân viên cùng bộ phận.');
      if (!action.title.trim() || !action.dueDate || !action.checklist.some(item => item.trim())) throw new Error('Cần tên việc, hạn và ít nhất một mục kiểm tra.');
      const task: CloseTask = {
        id: crypto.randomUUID(), period: action.period, department: action.department, step: action.step,
        title: action.title.trim(), description: action.description.trim(), assigneeId: assignee.id,
        dueDate: action.dueDate, status: 'todo', checklist: action.checklist.filter(item => item.trim()).map(label => ({ label: label.trim(), checked: false })),
        dependsOn: [], requiredReports: [], metrics: {}, metricDefinitions: [], note: '',
      };
      update(state, actor, 'task', task.id, task.period, task.department, 'Giao việc', `Giao “${task.title}” cho ${assignee.name}`, null, task, { tasks: [...state.tasks, task] });
      return '';
    }
    if (action.type === 'close-report' || action.type === 'reopen-report') {
      const report = state.reports.find(item => item.period === action.period && item.department === action.department);
      if (!report) throw new Error('Báo cáo không tồn tại.');
      if (!canManageDepartment(actor, action.department)) throw new Error('Bạn không có quyền chốt báo cáo này.');
      if (action.department === 'finance' && actor.role !== 'chief') throw new Error('Báo cáo tài chính cần kế toán trưởng xác nhận.');
      if (action.type === 'close-report') {
        if (report.status === 'closed') throw new Error('Báo cáo đã chốt.');
        const tasks = state.tasks.filter(task => task.period === action.period && task.department === action.department);
        if (tasks.some(task => task.status !== 'done')) throw new Error('Cần duyệt xong toàn bộ công việc của bộ phận trước khi chốt.');
        const differences = tasks.flatMap(task => Object.entries(task.metrics).filter(([key, value]) => key.endsWith('Mismatch') && value !== null && value !== undefined && value > 0).map(([key, value]) => `${key}: ${value}`));
        if (differences.length && !action.note.trim()) throw new Error('Còn chênh lệch số liệu. Cần ghi chú giải trình trước khi chốt.');
        const prerequisite: Partial<Record<DepartmentId, DepartmentId[]>> = { cost: ['warehouse'], finance: ['warehouse', 'cost', 'receivables'] };
        if (!state.workflows?.[action.period] && (prerequisite[action.department] ?? []).some(department => state.reports.find(item => item.period === action.period && item.department === department)?.status !== 'closed')) throw new Error('Báo cáo bộ phận trước chưa chốt.');
        const now = new Date().toISOString();
        const next = { ...report, status: 'closed' as const, note: action.note.trim(), submittedAt: now, submittedBy: actor.id, snapshot: reportMetrics(state, action.period, action.department) };
        update(state, actor, 'report', `${action.period}:${action.department}`, action.period, action.department, 'Chốt báo cáo', `Chốt báo cáo ${action.department}; ${tasks.length} công việc đã duyệt`, report, next, { reports: state.reports.map(item => item === report ? next : item) });
        return '';
      }
      if (report.status !== 'closed') throw new Error('Báo cáo đang mở.');
      if (!action.reason.trim()) throw new Error('Cần lý do mở lại để lưu nhật ký.');
      const downstream = state.tasks.some(task => task.period === action.period && task.requiredReports.includes(action.department) && task.status !== 'todo');
      if (downstream) throw new Error('Công việc phụ thuộc đã bắt đầu. Hãy trả lại các việc đó trước.');
      const closedDownstream = state.reports.some(item => item.period === action.period && item.department !== action.department && item.status === 'closed' && (item.department === 'finance' || (action.department === 'warehouse' && item.department === 'cost')));
      if (closedDownstream) throw new Error('Báo cáo phụ thuộc đã chốt. Hãy mở lại báo cáo sau trước.');
      const next = { ...report, status: 'open' as const, note: '', submittedAt: undefined, submittedBy: undefined, snapshot: undefined };
      update(state, actor, 'report', `${action.period}:${action.department}`, action.period, action.department, 'Mở lại báo cáo', action.reason.trim(), report, next, { reports: state.reports.map(item => item === report ? next : item) });
      return '';
    }
    if (action.type === 'record-action') {
      if (!state.periods.includes(action.period)) throw new Error('Kỳ chốt không tồn tại.');
      const matches = getWorkflowSnapshot().bindings.filter(item => item.enabled && item.controller === action.controller && item.screen === action.screen && item.action === action.action);
      const now = new Date().toISOString();
      let result: ActionResult = matches.length ? 'logged' : 'unmatched';
      let message = '';
      let matched: CloseTask | undefined;
      if (action.action !== 'save-filter') {
        matched = matches.flatMap(binding => state.tasks.filter(item => item.period === action.period && item.templateId === binding.taskId && item.status !== 'done')).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
        if (matched) {
          const waiting = blockers(state, matched);
          if (!(matched.assigneeId === actor.id || canManageDepartment(actor, matched.department))) { result = 'forbidden'; message = `Đã ghi log nhưng chưa tích: thao tác này thuộc ${departmentName(matched.department)}.`; }
          else if (state.reports.find(item => item.period === matched!.period && item.department === matched!.department)?.status === 'closed') { result = 'blocked'; message = 'Đã ghi log nhưng chưa tích: báo cáo bộ phận đã chốt, cần mở lại.'; }
          else if (waiting.length) { result = 'blocked'; message = `Đã ghi log nhưng chưa tích. Đang chờ: ${waiting.join(', ')}.`; }
          else result = 'completed';
        }
      }
      const log: ActionLog = { id: crypto.randomUUID(), at: now, actorId: actor.id, controller: action.controller, screen: action.screen, action: action.action, period: action.period, docRef: action.docRef, matchedTaskId: matched?.id, result, message: message || undefined };
      const actionLogs = [log, ...(state.actionLogs ?? [])].slice(0, 500);
      if (result === 'completed' && matched) {
        const next: CloseTask = { ...matched, checklist: matched.checklist.map(item => ({ ...item, checked: true })), status: 'done', submittedAt: now, completedAt: now, completedBy: actor.id, doneByLogId: log.id, updatedAt: now };
        update(state, actor, 'task', matched.id, matched.period, matched.department, 'Hoàn thành tự động', `${matched.title} · ${action.screen}${action.docRef ? ` · ${action.docRef}` : ''}`, matched, next, { tasks: state.tasks.map(item => item.id === matched!.id ? next : item), actionLogs });
        return '';
      }
      commit({ ...state, actionLogs });
      return message;
    }
    const task = activeTask(state, actor, action.taskId);
    const now = new Date().toISOString();
    if (completingBindings(getWorkflowSnapshot(), task.templateId).length && (action.type === 'set-check' || (action.type === 'task-status' && (action.status === 'review' || action.status === 'done')))) throw new Error('Việc này tự hoàn thành khi thực hiện thao tác trên màn hình ERP, không tích hoặc duyệt tay.');
    if (action.type === 'assign') {
      if (!canManageDepartment(actor, task.department)) throw new Error('Chỉ trưởng bộ phận được giao việc.');
      if (task.status === 'review' || task.status === 'done') throw new Error('Trả lại công việc trước khi thay người phụ trách.');
      if (userFor(action.assigneeId).department !== task.department) throw new Error('Người nhận phải thuộc cùng bộ phận.');
      if (!action.dueDate) throw new Error('Cần chọn hạn hoàn thành.');
      const next = { ...task, assigneeId: action.assigneeId, dueDate: action.dueDate, updatedAt: now };
      saveTask(state, actor, task, next, 'Điều chỉnh phân công', `${task.title}: giao cho ${userFor(action.assigneeId).name}, hạn ${action.dueDate}`);
      return '';
    }
    if (action.type === 'set-check') {
      requireEditable(task, actor);
      if (action.index < 0 || action.index >= task.checklist.length) throw new Error('Mục kiểm tra không hợp lệ.');
      if (action.checked && blockers(state, task).length) throw new Error('Cần hoàn thành các bước phụ thuộc trước.');
      const checklist = task.checklist.map((item, index) => index === action.index ? { ...item, checked: action.checked } : item);
      const next = { ...task, checklist, status: action.checked && task.status === 'todo' ? 'doing' as const : task.status, updatedAt: now };
      saveTask(state, actor, task, next, 'Cập nhật checklist', `${action.checked ? 'Đánh dấu' : 'Bỏ đánh dấu'}: ${task.checklist[action.index].label}`);
      return '';
    }
    if (action.type === 'set-note') {
      requireEditable(task, actor);
      const next = { ...task, note: action.note.slice(0, 2000), updatedAt: now };
      saveTask(state, actor, task, next, 'Ghi chú công việc', task.title);
      return '';
    }
    if (action.type === 'set-metric') {
      requireEditable(task, actor);
      if (!task.metricDefinitions.some(definition => definition.key === action.key)) throw new Error('Chỉ số không hợp lệ.');
      if (action.value !== null && (!Number.isFinite(action.value) || action.value < 0)) throw new Error('Chỉ số phải là số không âm.');
      const next = { ...task, metrics: { ...task.metrics, [action.key]: action.value }, updatedAt: now };
      saveTask(state, actor, task, next, 'Cập nhật số liệu', `${task.title}: ${action.key} = ${action.value ?? 'trống'}`);
      return '';
    }
    if (action.type === 'task-status') {
      const { status } = action;
      if (status === 'done' || (status === 'doing' && (task.status === 'review' || task.status === 'done'))) {
        if (!canManageDepartment(actor, task.department)) throw new Error('Chỉ người quản lý được duyệt hoặc trả lại công việc.');
        if (task.assigneeId === actor.id) throw new Error('Người thực hiện không tự duyệt việc của mình.');
        if (status === 'done' && task.status !== 'review') throw new Error('Công việc cần được trình duyệt trước.');
        if (status === 'doing' && !action.note?.trim()) throw new Error('Cần lý do trả lại công việc.');
        if (status === 'doing' && task.status === 'done' && state.tasks.some(item => item.dependsOn.includes(task.id) && item.status !== 'todo')) throw new Error('Việc phụ thuộc đã bắt đầu. Hãy trả lại việc sau trước.');
        const next = { ...task, status, note: status === 'doing' ? `${task.note}\nTrả lại: ${action.note!.trim()}`.trim() : task.note, completedAt: status === 'done' ? now : undefined, completedBy: status === 'done' ? actor.id : undefined, updatedAt: now };
        saveTask(state, actor, task, next, status === 'done' ? 'Duyệt công việc' : 'Trả lại công việc', status === 'done' ? task.title : action.note!.trim());
        return '';
      }
      requireEditable(task, actor);
      if (status !== 'todo' && blockers(state, task).length) throw new Error(`Đang chờ: ${blockers(state, task).join(', ')}.`);
      if (status === 'blocked' && !action.note?.trim()) throw new Error('Cần mô tả vướng mắc.');
      if (status === 'review') {
        if (!task.checklist.every(item => item.checked)) throw new Error('Cần hoàn thành toàn bộ checklist.');
        if (task.metricDefinitions.some(definition => task.metrics[definition.key] === null || task.metrics[definition.key] === undefined)) throw new Error('Cần điền đầy đủ số liệu.');
      }
      const next = { ...task, status, note: action.note?.trim() ? `${task.note}\n${action.note.trim()}`.trim() : task.note, submittedAt: status === 'review' ? now : task.submittedAt, updatedAt: now };
      saveTask(state, actor, task, next, status === 'review' ? 'Trình duyệt công việc' : status === 'blocked' ? 'Báo vướng mắc' : 'Đổi trạng thái', `${task.title}: ${status}${action.note ? ` — ${action.note}` : ''}`);
      return '';
    }
    return 'Thao tác không được hỗ trợ.';
  } catch (error) { return error instanceof Error ? error.message : 'Không thể lưu thay đổi.'; }
}
