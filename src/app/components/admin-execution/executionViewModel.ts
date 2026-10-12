import { SlaStatusType, SystemAuditLogItem, TaskDeclarationItem } from '../../data/mockAdminExecutionData';

export interface TaskOccurrenceView {
  id: string;
  task: TaskDeclarationItem;
  dueDate: Date;
  status: SlaStatusType;
  completedLog?: SystemAuditLogItem;
  logs: SystemAuditLogItem[];
  periodStart: Date;
  periodEnd: Date;
}

const pad = (value: number) => String(value).padStart(2, '0');

export function parseTaskDate(value?: string | null): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return parsed.getFullYear() === Number(year) && parsed.getMonth() === Number(month) - 1 && parsed.getDate() === Number(day)
    ? parsed
    : null;
}

export function formatTaskDate(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function getRuleDay(task: TaskDeclarationItem, year: number, month: number) {
  const rule = task.dayRule.toLocaleLowerCase();
  if (rule.includes('cuối tháng')) return new Date(year, month + 1, 0).getDate();
  const dayMatch = rule.match(/ngày\s*(\d{1,2})/i);
  if (dayMatch) return Math.min(Number(dayMatch[1]), new Date(year, month + 1, 0).getDate());
  const dateMatch = rule.match(/(\d{1,2})\/(\d{1,2})/);
  if (dateMatch && Number(dateMatch[2]) - 1 === month) return Math.min(Number(dateMatch[1]), new Date(year, month + 1, 0).getDate());
  return null;
}

function matchesCycleMonth(task: TaskDeclarationItem, month: number) {
  const cycle = task.cycle.toLocaleLowerCase();
  if (cycle.includes('quý')) return [2, 5, 8, 11].includes(month);
  if (cycle.includes('năm')) {
    const dateMatch = task.dayRule.match(/\d{1,2}\/(\d{1,2})/);
    return dateMatch ? Number(dateMatch[1]) - 1 === month : month === 11;
  }
  return true;
}

function getPeriodBounds(task: TaskDeclarationItem, dueDate: Date) {
  const cycle = task.cycle.toLocaleLowerCase();
  if (cycle.includes('ngày')) {
    const start = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59) };
  }
  if (cycle.includes('tuần')) {
    const start = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59);
    return { start, end };
  }
  if (cycle.includes('quý')) {
    const firstMonth = Math.floor(dueDate.getMonth() / 3) * 3;
    return {
      start: new Date(dueDate.getFullYear(), firstMonth, 1),
      end: new Date(dueDate.getFullYear(), firstMonth + 3, 0, 23, 59, 59),
    };
  }
  if (cycle.includes('năm')) {
    return {
      start: new Date(dueDate.getFullYear(), 0, 1),
      end: new Date(dueDate.getFullYear(), 11, 31, 23, 59, 59),
    };
  }
  return {
    start: new Date(dueDate.getFullYear(), dueDate.getMonth(), 1),
    end: new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0, 23, 59, 59),
  };
}

function toLocalDateTime(timestamp: string) {
  const match = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return new Date(timestamp);
  const [, year, month, day, hour, minute, second = '0'] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
}

export function buildTaskOccurrences(
  tasks: TaskDeclarationItem[],
  logs: SystemAuditLogItem[],
  year: number,
  month: number,
  referenceDate = new Date(),
): TaskOccurrenceView[] {
  const occurrences: TaskOccurrenceView[] = [];

  tasks.filter(task => task.status === 'active').forEach(task => {
    if (!matchesCycleMonth(task, month)) return;
    const cycle = task.cycle.toLocaleLowerCase();
    const days: number[] = [];
    const maxDay = new Date(year, month + 1, 0).getDate();

    if (cycle.includes('ngày')) {
      for (let day = 1; day <= maxDay; day += 1) days.push(day);
    } else if (cycle.includes('tuần')) {
      const weekdayMatch = task.dayRule.match(/thứ\s*(\d)/i);
      const targetWeekday = weekdayMatch ? Number(weekdayMatch[1]) - 1 : 1;
      for (let day = 1; day <= maxDay; day += 1) {
        if (new Date(year, month, day).getDay() === targetWeekday) days.push(day);
      }
    } else {
      const ruleDay = getRuleDay(task, year, month);
      if (ruleDay) days.push(ruleDay);
    }

    days.forEach(day => {
      const dueDate = new Date(year, month, day, 23, 59, 59);
      const { start: periodStart, end: periodEnd } = getPeriodBounds(task, dueDate);
      const taskEventKey = `${task.subsystem}:${task.screenCode}:${task.actionName}`;
      const matchingLogs = logs
        .filter(log => (log.eventKey ?? `${log.subsystem}:${log.screenCode}:${log.actionName}`) === taskEventKey)
        .map(log => ({ log, date: toLocalDateTime(log.timestamp) }))
        .filter(({ date }) => date >= periodStart && date <= periodEnd)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      const completed = matchingLogs.find(({ log }) => log.resultStatus === 'success');
      const completedLog = completed?.log;
      const status: SlaStatusType = completedLog
        ? completed!.date <= dueDate ? 'ontime' : 'late'
        : dueDate < referenceDate ? 'overdue' : 'notyet';

      occurrences.push({
        id: `${task.id}-${year}-${pad(month + 1)}-${pad(day)}`,
        task,
        dueDate,
        status,
        completedLog,
        logs: matchingLogs.map(item => item.log),
        periodStart,
        periodEnd,
      });
    });
  });

  return occurrences.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export function getWeekRanges(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const ranges: { start: number; end: number; label: string }[] = [];
  let start = 1;
  while (start <= lastDay) {
    const date = new Date(year, month, start);
    const mondayOffset = (date.getDay() + 6) % 7;
    const end = Math.min(lastDay, start + (6 - mondayOffset));
    ranges.push({ start, end, label: `${pad(start)}–${pad(end)}` });
    start = end + 1;
  }
  return ranges;
}
