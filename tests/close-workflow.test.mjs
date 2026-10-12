import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const load = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app');

// Biên dịch phần miền nghiệp vụ (không React) vào thư mục tạm, giữ nguyên cấu trúc close/ và workflow/.
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'arito-close-test-'));
for (const file of ['close/model.ts', 'close/store.ts', 'workflow/config.ts', 'workflow/store.ts', 'workflow/runtime.ts']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  fs.mkdirSync(path.dirname(path.join(temp, file)), { recursive: true });
  fs.writeFileSync(path.join(temp, file.replace('.ts', '.js')), output);
}
global.window = {};
const saved = new Map();
global.localStorage = { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
const model = load(path.join(temp, 'close/model.js'));
const store = load(path.join(temp, 'close/store.js'));
const config = load(path.join(temp, 'workflow/config.js'));
const runtime = load(path.join(temp, 'workflow/runtime.js'));

const period = () => store.getSnapshot().periods[0];
const task = (templateId, occurrence) => store.getSnapshot().tasks.find(item => item.templateId === templateId && item.period === period() && (!occurrence || item.occurrence === occurrence));
const press = (actor, controller, screen, action = 'run', docRef) => store.dispatch(actor, { type: 'record-action', controller, screen, action, period: period(), docRef });

test('nhân viên chỉ xem việc của mình', () => {
  const own = task('costchain-1');
  const other = task('costchain-3');
  const staff = model.USERS.find(user => user.id === 'warehouse-1');
  assert.equal(model.canSeeTask(staff, own), true);
  assert.equal(model.canSeeTask(staff, other), false);
  assert.match(store.dispatch(staff.id, { type: 'task-status', taskId: other.id, status: 'doing' }), /không có quyền/);
});

test('bấm nút khi còn việc trước: ghi log, không tích', () => {
  const message = press('cost-1', 'ProductionCostController', 'Tính giá thành sản xuất');
  assert.match(message, /Đang chờ/);
  assert.equal(task('costchain-3').status, 'todo');
  const log = store.getSnapshot().actionLogs[0];
  assert.equal(log.result, 'blocked');
  assert.equal(log.matchedTaskId, task('costchain-3').id);
});

test('bấm nút sai bộ phận: chỉ ghi log', () => {
  assert.match(press('warehouse-1', 'CostingController', 'Tính giá vốn'), /thuộc Kế toán tổng hợp/);
  assert.equal(task('costchain-2').status, 'todo');
  assert.equal(store.getSnapshot().actionLogs[0].result, 'forbidden');
});

test('chuỗi liên bộ phận tự tích đúng người, đúng thời điểm, đúng thứ tự', () => {
  assert.equal(press('warehouse-1', 'InventoryController', 'Chốt số liệu kho', 'run', 'KHO-001'), '');
  const first = task('costchain-1');
  const log = store.getSnapshot().actionLogs[0];
  assert.equal(first.status, 'done');
  assert.ok(first.checklist.every(item => item.checked));
  assert.equal(first.completedBy, 'warehouse-1');
  assert.equal(first.doneByLogId, log.id);
  assert.equal(log.docRef, 'KHO-001');
  assert.equal(log.result, 'completed');
  assert.ok(store.getSnapshot().audit.some(entry => entry.action === 'Hoàn thành tự động' && entry.targetId === first.id));
  assert.equal(press('finance-1', 'CostingController', 'Tính giá vốn'), '');
  assert.equal(press('cost-1', 'ProductionCostController', 'Tính giá thành sản xuất'), '');
  assert.equal(press('finance-1', 'CostSummaryReportController', 'Báo cáo tổng hợp giá thành', 'submit'), '');
  assert.deepEqual(['costchain-1', 'costchain-2', 'costchain-3', 'costchain-4'].map(id => task(id).status), ['done', 'done', 'done', 'done']);
  assert.deepEqual(['costchain-1', 'costchain-2', 'costchain-3', 'costchain-4'].map(id => task(id).completedBy), ['warehouse-1', 'finance-1', 'cost-1', 'finance-1']);
});

test('bấm lại việc đã xong chỉ ghi log; việc có nút không tích hoặc trình duyệt tay', () => {
  assert.equal(press('warehouse-1', 'InventoryController', 'Chốt số liệu kho'), '');
  assert.equal(store.getSnapshot().actionLogs[0].result, 'logged');
  const bound = task('closing-5');
  assert.match(store.dispatch('finance-1', { type: 'set-check', taskId: bound.id, index: 0, checked: true }), /tự hoàn thành/);
  assert.match(store.dispatch('finance-1', { type: 'task-status', taskId: bound.id, status: 'review' }), /tự hoàn thành/);
});

test('Lưu bộ lọc chỉ ghi log, không hoàn thành việc', () => {
  assert.equal(press('receivables-1', 'PurchaseReportController', 'Bảng kê hóa đơn mua vào', 'save-filter'), '');
  assert.equal(task('purchase-3').status, 'todo');
  assert.equal(store.getSnapshot().actionLogs[0].result, 'logged');
  assert.equal(press('receivables-1', 'KhongTonTai', 'Màn lạ', 'submit'), '');
  assert.equal(store.getSnapshot().actionLogs[0].result, 'unmatched');
});

test('việc không gắn nút vẫn đi luồng cũ: tích tay, trình, duyệt', () => {
  assert.equal(press('receivables-1', 'PurchaseInvoiceController', 'Hóa đơn mua hàng', 'submit'), '');
  const manual = task('purchase-2');
  assert.equal(config.completingBindings(config.INITIAL_WORKFLOW_CONFIG, 'purchase-2').length, 0);
  assert.equal(store.dispatch('receivables-1', { type: 'set-check', taskId: manual.id, index: 0, checked: true }), '');
  assert.equal(store.dispatch('receivables-1', { type: 'task-status', taskId: manual.id, status: 'review' }), '');
  assert.match(store.dispatch('receivables-1', { type: 'task-status', taskId: manual.id, status: 'done' }), /người quản lý/);
  assert.equal(store.dispatch('manager-receivables', { type: 'task-status', taskId: manual.id, status: 'done' }), '');
  assert.equal(task('purchase-2').status, 'done');
});

test('trạng thái đúng hạn / trễ hạn / quá hạn / chưa đến hạn', () => {
  assert.equal(model.timing('2026-10-10', '2026-10-10T03:00:00Z', '2026-10-20'), 'ontime');
  assert.equal(model.timing('2026-10-10', '2026-10-11T03:00:00Z', '2026-10-20'), 'late');
  assert.equal(model.timing('2026-10-10', null, '2026-10-11'), 'overdue');
  assert.equal(model.timing('2026-10-10', undefined, '2026-10-10'), 'upcoming');
  // So ngày theo giờ Việt Nam (UTC+7): 16:30Z = 23:30 ngày 10 (đúng hạn), 17:30Z = 00:30 ngày 11 (trễ)
  assert.equal(model.timing('2026-10-10', '2026-10-10T16:30:00Z', '2026-10-20'), 'ontime');
  assert.equal(model.timing('2026-10-10', '2026-10-10T17:30:00Z', '2026-10-20'), 'late');
});

test('báo cáo theo nhóm trả đủ chuỗi nhiều bộ phận theo thứ tự phụ thuộc', () => {
  const state = store.getSnapshot();
  const chain = state.tasks.filter(item => item.period === period() && item.groupId === 'costchain');
  const shuffled = [chain[3], chain[1], chain[0], chain[2]];
  const ordered = model.chainOrder(shuffled, state.workflows[period()].groups.map(group => group.id));
  assert.deepEqual(ordered.map(item => item.templateId), ['costchain-1', 'costchain-2', 'costchain-3', 'costchain-4']);
  assert.deepEqual(ordered.map(item => item.department), ['warehouse', 'finance', 'cost', 'finance']);
  assert.deepEqual(ordered.map(item => item.ordinal.split('.')[0]), Array(4).fill(ordered[0].ordinal.split('.')[0]));
  const info = model.doneInfo(state, ordered[0]);
  assert.equal(info.by, 'warehouse-1');
  assert.equal(model.doneInfo(state, state.tasks.find(item => item.templateId === 'closing-1')), null);
});

test('lặp hàng tuần sinh đúng số instance, độc lập với chuỗi chốt kỳ', () => {
  const [year, month] = period().split('-').map(Number);
  const fridays = Array.from({ length: new Date(Date.UTC(year, month, 0)).getUTCDate() }, (_, index) => index + 1).filter(day => new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 5);
  const weekly = store.getSnapshot().tasks.filter(item => item.templateId === 'sales-4');
  assert.equal(weekly.length, fridays.length);
  assert.deepEqual(weekly.map(item => item.dueDate.slice(8)), fridays.map(day => String(day).padStart(2, '0')));
  assert.ok(weekly.every(item => item.dependsOn.length === 0 && item.id.includes(':w')));
  const weeklyIds = new Set(weekly.map(item => item.id));
  assert.ok(store.getSnapshot().tasks.filter(item => !weeklyIds.has(item.id)).every(item => item.dependsOn.every(id => !weeklyIds.has(id))));
  // bấm nút tích lần phát sinh sớm nhất chưa xong
  assert.equal(press('receivables-1', 'ReceivableController', 'Đối chiếu công nợ khách hàng'), '');
  assert.equal(task('sales-4', 'T1').status, 'done');
  assert.equal(task('sales-4', 'T2')?.status ?? 'todo', 'todo');
});

test('lặp hàng năm chỉ sinh đúng tháng; ngày cuối tháng và qua năm', () => {
  const groups = [{ id: 'g', name: 'G', dependsOnGroupIds: [], department: 'finance', tasks: [
    { id: 'y', title: 'Quyết toán năm', dependsOnTaskIds: [], recurrence: { freq: 'yearly', month: 3, day: 'last' } },
    { id: 'm', title: 'Hạn cuối tháng', dependsOnTaskIds: [], dueDay: 'last' },
    { id: 'd', title: 'Hạn ngày 31', dependsOnTaskIds: [], dueDay: 31 },
  ] }];
  const march = model.makePeriod('2026-03', groups).tasks;
  assert.equal(march.find(item => item.templateId === 'y').dueDate, '2026-03-31');
  assert.equal(march.find(item => item.templateId === 'm').dueDate, '2026-04-30');
  assert.equal(model.makePeriod('2026-04', groups).tasks.some(item => item.templateId === 'y'), false);
  const jan = model.makePeriod('2026-01', groups).tasks;
  assert.equal(jan.find(item => item.templateId === 'm').dueDate, '2026-02-28');
  assert.equal(jan.find(item => item.templateId === 'd').dueDate, '2026-02-28');
  assert.equal(model.makePeriod('2026-12', groups).tasks.find(item => item.templateId === 'm').dueDate, '2027-01-31');
});

test('khai báo hợp lệ: nhiều bộ phận trong một nhóm; từ chối lặp sai', () => {
  assert.doesNotThrow(() => runtime.validateWorkflow(config.INITIAL_WORKFLOW_CONFIG.groups));
  const base = () => structuredClone(config.INITIAL_WORKFLOW_CONFIG.groups);
  const wrongStaff = base();
  wrongStaff.find(group => group.id === 'costchain').tasks[0].assigneeId = 'finance-1';
  assert.throws(() => runtime.validateWorkflow(wrongStaff), /phải thuộc bộ phận/);
  const noWeekday = base();
  noWeekday.find(group => group.id === 'sales').tasks[3].recurrence = { freq: 'weekly' };
  assert.throws(() => runtime.validateWorkflow(noWeekday), /thứ trong tuần/);
  const noMonth = base();
  noMonth.find(group => group.id === 'sales').tasks[3].recurrence = { freq: 'yearly', day: 5 };
  assert.throws(() => runtime.validateWorkflow(noMonth), /ngày và tháng/);
  const badDay = base();
  badDay.find(group => group.id === 'sales').tasks[0].dueDay = 32;
  assert.throws(() => runtime.validateWorkflow(badDay), /Ngày hạn/);
});
