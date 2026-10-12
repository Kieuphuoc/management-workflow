import { DEPARTMENTS, USERS, generationAudit, makePeriod, type CloseState, type CloseTask } from '../close/model';
import { groupDepartment, taskDepartment, type WorkflowGroup } from './config';

export function validateWorkflow(groups: WorkflowGroup[]) {
  if (!groups.length) throw new Error('Cần ít nhất một nhóm công việc trước khi chốt.');
  const groupIds = new Set(groups.map(group => group.id));
  const tasks = groups.flatMap(group => group.tasks);
  if (groupIds.size !== groups.length || new Set(tasks.map(task => task.id)).size !== tasks.length) throw new Error('Mã nhóm hoặc công việc bị trùng.');
  const graph: Record<string, string[]> = {};
  for (const group of groups) {
    if (!group.name.trim() || !group.tasks.length) throw new Error(`Nhóm “${group.name}” cần tên và ít nhất một công việc.`);
    const department = groupDepartment(group);
    if (!DEPARTMENTS.some(item => item.id === department)) throw new Error('Bộ phận phụ trách không hợp lệ.');
    if (group.dependsOnGroupIds.some(id => !groupIds.has(id) || id === group.id)) throw new Error(`Phụ thuộc của nhóm “${group.name}” không hợp lệ.`);
    graph[`group:${group.id}`] = group.dependsOnGroupIds.map(id => `group:${id}`);
    for (const task of group.tasks) {
      if (!task.title.trim()) throw new Error('Tên công việc không được để trống.');
      if (task.dependsOnTaskIds.some(id => !group.tasks.some(item => item.id === id) || id === task.id)) throw new Error(`Phụ thuộc của “${task.title}” không hợp lệ.`);
      const taskDept = taskDepartment(group, task);
      if (!DEPARTMENTS.some(item => item.id === taskDept)) throw new Error(`Bộ phận của “${task.title}” không hợp lệ.`);
      if (task.assigneeId && !USERS.some(user => user.id === task.assigneeId && user.role === 'staff' && user.department === taskDept)) throw new Error(`Người thực hiện “${task.title}” phải thuộc bộ phận phụ trách.`);
      const validDay = (day: unknown) => day === 'last' || (Number.isInteger(day) && (day as number) >= 1 && (day as number) <= 31);
      if (task.dueDay !== undefined && !validDay(task.dueDay)) throw new Error('Ngày hạn phải là 1–31 hoặc ngày cuối tháng.');
      const rule = task.recurrence;
      if (rule) {
        if (!['none', 'weekly', 'monthly', 'yearly'].includes(rule.freq)) throw new Error(`Kiểu lặp của “${task.title}” không hợp lệ.`);
        if (rule.freq === 'weekly' && !(Number.isInteger(rule.weekday) && rule.weekday! >= 0 && rule.weekday! <= 6)) throw new Error(`Cần chọn thứ trong tuần cho “${task.title}”.`);
        if (rule.freq === 'yearly' && (!(Number.isInteger(rule.month) && rule.month! >= 1 && rule.month! <= 12) || !validDay(rule.day))) throw new Error(`Cần chọn ngày và tháng cho việc hàng năm “${task.title}”.`);
      }
      if (task.checklist && (!task.checklist.length || task.checklist.some(label => !label.trim()) || new Set(task.checklist).size !== task.checklist.length)) throw new Error(`Checklist của “${task.title}” cần các mục khác nhau, không để trống.`);
      graph[`task:${task.id}`] = task.dependsOnTaskIds.map(id => `task:${id}`);
    }
  }
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) throw new Error('Quy trình có vòng lặp phụ thuộc.');
    if (visited.has(id)) return;
    visiting.add(id);
    graph[id].forEach(visit);
    visiting.delete(id);
    visited.add(id);
  };
  Object.keys(graph).forEach(visit);
}

export function reconcileWorkflow(state: CloseState, period: string, groups: WorkflowGroup[], revision: number, actorId: string) {
  validateWorkflow(groups);
  const generated = makePeriod(period, groups, revision);
  const previous = state.tasks.filter(task => task.period === period);
  if (state.reports.some(report => report.period === period && report.status === 'closed')) throw new Error('Mở lại báo cáo của kỳ trước khi thay đổi quy trình.');
  const nextIds = new Set(generated.tasks.map(task => task.id));
  const removed = previous.filter(task => task.templateId && !nextIds.has(task.id));
  if (removed.some(task => task.status !== 'todo' || task.checklist.some(item => item.checked))) throw new Error('Có công việc bị xóa đã có tiến độ. Hãy giữ lại công việc đó hoặc áp dụng quy trình cho kỳ mới.');
  const oldDefinitions = state.workflows?.[period]?.groups.flatMap(group => group.tasks) ?? [];
  const tasks: CloseTask[] = generated.tasks.map(task => {
    const old = previous.find(item => item.id === task.id);
    if (!old) return task;
    const progressed = old.status !== 'todo' || old.checklist.some(item => item.checked);
    if (progressed && old.department !== task.department) throw new Error(`Không thể đổi bộ phận của “${old.title}” khi đã có tiến độ.`);
    if (progressed && task.dependsOn.some(id => previous.find(item => item.id === id)?.status !== 'done')) {
      if (JSON.stringify(old.dependsOn) !== JSON.stringify(task.dependsOn)) throw new Error(`“${old.title}” đã bắt đầu; phụ thuộc mới chưa hoàn tất.`);
    }
    if ((old.status === 'review' || old.status === 'done') && JSON.stringify(old.checklist.map(item => item.label)) !== JSON.stringify(task.checklist.map(item => item.label))) throw new Error(`Trả lại “${old.title}” trước khi đổi checklist.`);
    const definition = groups.flatMap(group => group.tasks).find(item => item.id === task.templateId)!;
    const oldDefinition = oldDefinitions.find(item => item.id === task.templateId);
    const assigneeId = old.department === task.department && definition.assigneeId === oldDefinition?.assigneeId ? old.assigneeId : task.assigneeId;
    const sameSchedule = definition.dueDay === oldDefinition?.dueDay && JSON.stringify(definition.recurrence) === JSON.stringify(oldDefinition?.recurrence);
    const dueDate = sameSchedule ? old.dueDate : task.dueDate;
    return { ...old, ...task, assigneeId, dueDate, status: old.status, note: old.note, metrics: old.metrics, metricDefinitions: old.metricDefinitions,
      checklist: task.checklist.map(item => ({ ...item, checked: old.checklist.find(candidate => candidate.label === item.label)?.checked ?? false })),
    };
  });
  tasks.push(...previous.filter(task => !task.templateId));
  const audit = tasks.flatMap(task => {
    const before = previous.find(item => item.id === task.id);
    if (!before) return generationAudit([task], actorId);
    if (JSON.stringify(before) === JSON.stringify(task)) return [];
    return [{ id: crypto.randomUUID(), at: new Date().toISOString(), actorId, action: 'Cập nhật từ quy trình', targetType: 'task' as const, targetId: task.id, period, department: task.department, detail: `Áp dụng bản quy trình ${revision} cho “${task.title}”`, before, after: task }];
  });
  return { tasks, audit, workflow: generated.workflow, reports: generated.reports.map(report => state.reports.find(item => item.period === period && item.department === report.department) ?? report) };
}
