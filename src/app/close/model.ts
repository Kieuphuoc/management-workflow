import { INITIAL_WORKFLOW_CONFIG, taskDepartment, type WorkflowGroup, type WorkflowTask } from '../workflow/config';

export type DepartmentId = 'warehouse' | 'cost' | 'receivables' | 'finance';
export type Role = 'chief' | 'manager' | 'staff';
export type TaskStatus = 'todo' | 'doing' | 'review' | 'done' | 'blocked';

export interface User {
  id: string;
  name: string;
  role: Role;
  department?: DepartmentId;
  initials: string;
}

export interface MetricDefinition {
  key: string;
  label: string;
  unit: string;
}

export interface CloseTask {
  id: string;
  period: string;
  groupId?: string;
  templateId?: string;
  ordinal?: string;
  department: DepartmentId;
  step: number;
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
  status: TaskStatus;
  checklist: { label: string; checked: boolean }[];
  dependsOn: string[];
  requiredReports: DepartmentId[];
  metrics: Record<string, number | null>;
  metricDefinitions: MetricDefinition[];
  note: string;
  updatedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  completedBy?: string;
  occurrence?: string;
  doneByLogId?: string;
}

export type ActionResult = 'completed' | 'blocked' | 'forbidden' | 'unmatched' | 'logged';

export interface ActionLog {
  id: string;
  at: string;
  actorId: string;
  controller: string;
  screen: string;
  action: string;
  period: string;
  docRef?: string;
  matchedTaskId?: string;
  result: ActionResult;
  message?: string;
}

export interface DepartmentReport {
  period: string;
  department: DepartmentId;
  status: 'open' | 'closed';
  note: string;
  submittedAt?: string;
  submittedBy?: string;
  snapshot?: { label: string; value: number; unit: string }[];
}

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  action: string;
  targetType: 'task' | 'report' | 'period';
  targetId: string;
  period: string;
  department?: DepartmentId;
  detail: string;
  before?: unknown;
  after?: unknown;
}

export interface CloseState {
  version: 1;
  periods: string[];
  tasks: CloseTask[];
  reports: DepartmentReport[];
  audit: AuditEntry[];
  workflows?: Record<string, { revision: number; groups: WorkflowGroup[] }>;
  archivedTasks?: CloseTask[];
  actionLogs?: ActionLog[];
}

export const DEPARTMENTS: { id: DepartmentId; name: string; short: string; tint: string; description: string }[] = [
  { id: 'warehouse', name: 'Kho & giao nhận', short: 'Kho', tint: 'teal', description: 'Số lượng tồn, nhập xuất và giao hàng' },
  { id: 'cost', name: 'Giá thành', short: 'Giá thành', tint: 'blue', description: 'Chi phí sản xuất và giá vốn' },
  { id: 'receivables', name: 'Công nợ & ngân hàng', short: 'Công nợ', tint: 'amber', description: 'Phải thu, phải trả và số dư tiền' },
  { id: 'finance', name: 'Kế toán tổng hợp', short: 'Tài chính', tint: 'violet', description: 'Kết chuyển và báo cáo tài chính' },
];

export const USERS: User[] = [
  { id: 'chief', name: 'Nguyễn Minh Anh', role: 'chief', initials: 'MA' },
  { id: 'manager-warehouse', name: 'Trần Quốc Huy', role: 'manager', department: 'warehouse', initials: 'QH' },
  { id: 'warehouse-1', name: 'Lê Thanh Vy', role: 'staff', department: 'warehouse', initials: 'TV' },
  { id: 'warehouse-2', name: 'Phạm Gia Bảo', role: 'staff', department: 'warehouse', initials: 'GB' },
  { id: 'manager-cost', name: 'Đỗ Thu Hà', role: 'manager', department: 'cost', initials: 'TH' },
  { id: 'cost-1', name: 'Vũ Ngọc Mai', role: 'staff', department: 'cost', initials: 'NM' },
  { id: 'manager-receivables', name: 'Hoàng Đức Long', role: 'manager', department: 'receivables', initials: 'DL' },
  { id: 'receivables-1', name: 'Nguyễn Hồng Ngân', role: 'staff', department: 'receivables', initials: 'HN' },
  { id: 'manager-finance', name: 'Bùi Hữu Phúc', role: 'manager', department: 'finance', initials: 'HP' },
  { id: 'finance-1', name: 'Đặng Thảo Linh', role: 'staff', department: 'finance', initials: 'TL' },
];

export const STEPS = [
  'Chứng từ nhập, xuất và giao hàng',
  'Chốt số lượng tồn kho',
  'Tính giá thành và giá vốn',
  'Đối chiếu công nợ và ngân hàng',
  'Kết chuyển sổ kế toán',
  'Chốt báo cáo tài chính',
];

export const statusLabel: Record<TaskStatus, string> = {
  todo: 'Chưa bắt đầu', doing: 'Đang thực hiện', review: 'Chờ duyệt', done: 'Hoàn thành', blocked: 'Đang vướng',
};

export const userName = (id: string) => USERS.find(user => user.id === id)?.name ?? id;
export const departmentName = (id: DepartmentId) => DEPARTMENTS.find(item => item.id === id)?.name ?? id;
export const monthLabel = (period: string) => {
  const [year, month] = period.split('-');
  return `Tháng ${Number(month).toString().padStart(2, '0')}/${year}`;
};

const pad = (value: number) => String(value).padStart(2, '0');
const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const dueFromDay = (year: number, month: number, day: number | 'last') => `${year}-${pad(month)}-${pad(day === 'last' ? daysInMonth(year, month) : Math.min(day, daysInMonth(year, month)))}`;
const nextMonthDate = (period: string, day: number | 'last') => {
  const [year, month] = period.split('-').map(Number);
  return month === 12 ? dueFromDay(year + 1, 1, day) : dueFromDay(year, month + 1, day);
};

export const WEEKDAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
export const RECURRENCE_LABEL = { none: 'Không lặp', weekly: 'Hàng tuần', monthly: 'Hàng tháng', yearly: 'Hàng năm' } as const;

export function recurrenceText(item: WorkflowTask) {
  const rule = item.recurrence;
  if (!rule || rule.freq === 'none') return '';
  if (rule.freq === 'weekly') return `Hàng tuần · ${WEEKDAYS[rule.weekday ?? 5]}`;
  if (rule.freq === 'yearly') return `Hàng năm · ${rule.day === 'last' ? 'ngày cuối' : `ngày ${rule.day ?? 1}`}/${rule.month ?? 1}`;
  return 'Hàng tháng';
}

/** Các lần phát sinh của một đầu việc trong kỳ chốt `period`. Rỗng nghĩa là kỳ này không có việc (vd. việc hàng năm của tháng khác). */
export function occurrences(period: string, item: WorkflowTask, fallbackDay: number): { suffix: string; label: string; dueDate: string }[] {
  const [year, month] = period.split('-').map(Number);
  const rule = item.recurrence ?? { freq: 'none' as const };
  if (rule.freq === 'weekly') {
    const weekday = rule.weekday ?? 5;
    const days = Array.from({ length: daysInMonth(year, month) }, (_, index) => index + 1).filter(day => new Date(Date.UTC(year, month - 1, day)).getUTCDay() === weekday);
    return days.map((day, index) => ({ suffix: `:w${index + 1}`, label: `T${index + 1}`, dueDate: `${year}-${pad(month)}-${pad(day)}` }));
  }
  if (rule.freq === 'yearly') {
    if ((rule.month ?? month) !== month) return [];
    return [{ suffix: '', label: '', dueDate: dueFromDay(year, month, rule.day ?? 'last') }];
  }
  return [{ suffix: '', label: '', dueDate: nextMonthDate(period, item.dueDay ?? fallbackDay) }];
}

export function makePeriod(period: string, groups: WorkflowGroup[] = INITIAL_WORKFLOW_CONFIG.groups, revision = 1): { tasks: CloseTask[]; reports: DepartmentReport[]; workflow: { revision: number; groups: WorkflowGroup[] } } {
  const drafts = groups.flatMap((group, groupIndex) => group.tasks.flatMap((item, taskIndex) =>
    occurrences(period, item, groupIndex + taskIndex + 1).map(occurrence => ({ group, groupIndex, item, taskIndex, occurrence, id: `${period}:${item.id}${occurrence.suffix}` }))));
  // Việc lặp hàng tuần chạy độc lập: không chặn và không bị chặn bởi việc khác trong chuỗi chốt kỳ.
  const standalone = (item: WorkflowTask) => item.recurrence?.freq === 'weekly';
  const instances = new Map<string, string[]>();
  for (const draft of drafts) if (!standalone(draft.item)) instances.set(draft.item.id, [...(instances.get(draft.item.id) ?? []), draft.id]);
  const tasks: CloseTask[] = drafts.map(({ group, groupIndex, item, taskIndex, occurrence, id }) => {
    const department = taskDepartment(group, item);
    const inherited = standalone(item) ? [] : group.dependsOnGroupIds.flatMap(groupId => groups.find(candidate => candidate.id === groupId)?.tasks.flatMap(candidate => instances.get(candidate.id) ?? []) ?? []);
    const own = standalone(item) ? [] : item.dependsOnTaskIds.flatMap(dependency => instances.get(dependency) ?? []);
    return {
      id, templateId: item.id, groupId: group.id, occurrence: occurrence.label || undefined,
      ordinal: `${groupIndex + 1}.${taskIndex + 1}${occurrence.label ? `·${occurrence.label}` : ''}`, period, department, step: groupIndex + 1,
      title: occurrence.label ? `${item.title} (${occurrence.label})` : item.title, description: '',
      assigneeId: item.assigneeId ?? USERS.find(user => user.role === 'staff' && user.department === department)!.id,
      dueDate: occurrence.dueDate, status: 'todo' as const,
      checklist: (item.checklist?.length ? item.checklist : [item.title]).map(label => ({ label, checked: false })),
      dependsOn: [...new Set([...inherited, ...own])],
      requiredReports: [], metrics: {}, metricDefinitions: [], note: '',
    };
  });
  const usedDepartments = new Set(tasks.map(task => task.department));
  return {
    tasks,
    reports: DEPARTMENTS.filter(item => usedDepartments.has(item.id)).map(item => ({ period, department: item.id, status: 'open', note: '' })),
    workflow: { revision, groups: structuredClone(groups) },
  };
}

export function generationAudit(tasks: CloseTask[], actorId: string, action = 'Sinh công việc'): AuditEntry[] {
  return tasks.map(task => ({
    id: `generated:${task.id}:${Date.now()}`, at: new Date().toISOString(), actorId,
    action, targetType: 'task', targetId: task.id, period: task.period, department: task.department,
    detail: `Sinh “${task.title}” từ quy trình đã chốt`, before: null, after: task,
  }));
}

export function initialState(): CloseState {
  const period = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit' }).format(new Date());
  const data = makePeriod(period);
  // Hydration uses this snapshot in both runtimes. Create timestamped audit
  // entries only when the browser initializes its live store (see getSnapshot).
  return { version: 1, periods: [period], tasks: data.tasks, reports: data.reports, audit: [], workflows: { [period]: data.workflow } };
}

export function canSeeTask(user: User, task: CloseTask) {
  return user.role === 'chief' || user.role === 'manager' || task.assigneeId === user.id;
}

export function canManageDepartment(user: User, department: DepartmentId) {
  return user.role === 'chief' || (user.role === 'manager' && user.department === department);
}

export function blockers(state: CloseState, task: CloseTask): string[] {
  const missingTasks = task.dependsOn
    .map(id => state.tasks.find(item => item.id === id))
    .filter((item): item is CloseTask => Boolean(item && item.status !== 'done'))
    .map(item => item.title);
  const missingReports = task.requiredReports
    .filter(department => state.reports.find(item => item.period === task.period && item.department === department)?.status !== 'closed')
    .map(department => `Báo cáo ${departmentName(department)} chưa chốt`);
  return [...missingTasks, ...missingReports];
}

export function reportMetrics(state: CloseState, period: string, department: DepartmentId) {
  const tasks = state.tasks.filter(task => task.period === period && task.department === department);
  const entered = tasks
    .flatMap(task => task.metricDefinitions.map(definition => ({ label: definition.label, value: task.metrics[definition.key], unit: definition.unit })))
    .filter((metric): metric is { label: string; value: number; unit: string } => metric.value !== null && metric.value !== undefined);
  const derived: { label: string; value: number; unit: string }[] = [];
  if (department === 'cost') {
    const task = tasks.find(item => item.id.endsWith(':cost-price'));
    const total = task?.metrics.totalCost;
    const units = task?.metrics.finishedUnits;
    if (total !== null && total !== undefined && units !== null && units !== undefined && units > 0) derived.push({ label: 'Giá thành bình quân', value: Math.round(total / units), unit: 'VND/đơn vị' });
  }
  if (department === 'finance') {
    const journal = tasks.find(item => item.id.endsWith(':gl-journal'));
    const revenue = journal?.metrics.revenue;
    const expense = journal?.metrics.expense;
    if (revenue !== null && revenue !== undefined && expense !== null && expense !== undefined) derived.push({ label: 'Kết quả trước thuế (ước tính)', value: revenue - expense, unit: 'VND' });
  }
  return [...entered, ...derived];
}

export function taskProgress(tasks: CloseTask[]) {
  return tasks.length ? Math.round(tasks.filter(task => task.status === 'done').length / tasks.length * 100) : 0;
}

export function closePeriodLabel(period: string) {
  return `Kỳ chốt ${monthLabel(period)}`;
}

// ---- Báo cáo tình hình thực hiện: trạng thái đúng hạn / trễ hạn và thứ tự chuỗi ----
export type Timing = 'ontime' | 'late' | 'overdue' | 'upcoming';
export const timingLabel: Record<Timing, string> = { ontime: 'Đúng hạn', late: 'Trễ hạn', overdue: 'Quá hạn', upcoming: 'Chưa đến hạn' };

/** Ngày theo giờ Việt Nam (YYYY-MM-DD) của một mốc ISO. */
export const vnDate = (value: string) => value.length === 10 ? value : new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok' }).format(new Date(value));
export const todayVn = () => vnDate(new Date().toISOString());

export function timing(dueDate: string, doneAt: string | null | undefined, today: string): Timing {
  if (doneAt) return vnDate(doneAt) <= dueDate ? 'ontime' : 'late';
  return today > dueDate ? 'overdue' : 'upcoming';
}

/** Người và thời điểm thao tác: ưu tiên log hệ thống, nếu không có thì dùng thông tin duyệt thủ công. */
export function doneInfo(state: CloseState, task: CloseTask): { at: string; by: string } | null {
  if (task.status !== 'done') return null;
  const log = task.doneByLogId ? state.actionLogs?.find(item => item.id === task.doneByLogId) : undefined;
  const at = log?.at ?? task.completedAt ?? task.updatedAt;
  const by = log?.actorId ?? task.completedBy;
  return at && by ? { at, by } : null;
}

/** Sắp theo thứ tự nhóm, rồi theo phụ thuộc trong nhóm (việc trước đứng trước), không theo bộ phận. */
export function chainOrder(tasks: CloseTask[], groupOrder: string[]): CloseTask[] {
  const rank = (task: CloseTask) => { const index = groupOrder.indexOf(task.groupId ?? ''); return index < 0 ? 9999 : index; };
  const sorted = [...tasks].sort((a, b) => rank(a) - rank(b) || (a.ordinal ?? '').localeCompare(b.ordinal ?? '', 'vi', { numeric: true }) || a.dueDate.localeCompare(b.dueDate));
  const byId = new Map(sorted.map(task => [task.id, task]));
  const seen = new Set<string>();
  const out: CloseTask[] = [];
  const visit = (task: CloseTask) => {
    if (seen.has(task.id)) return;
    seen.add(task.id);
    for (const id of task.dependsOn) { const before = byId.get(id); if (before && before.groupId === task.groupId) visit(before); }
    out.push(task);
  };
  sorted.forEach(visit);
  return out;
}
