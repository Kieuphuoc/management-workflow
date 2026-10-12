export type DepartmentKey = 'warehouse' | 'cost' | 'receivables' | 'finance';

// none/monthly: một việc mỗi kỳ chốt, hạn = dueDay của tháng sau kỳ (1–31 hoặc 'last').
// weekly: mỗi tuần trong tháng của kỳ một việc, hạn vào thứ `weekday` (0 = CN … 6 = T7).
// yearly: chỉ sinh ở kỳ có đúng `month`; hạn là ngày `day` (1–31 hoặc 'last') của tháng đó.
export type Recurrence = {
  freq: 'none' | 'weekly' | 'monthly' | 'yearly';
  weekday?: number;
  day?: number | 'last';
  month?: number;
};

export type WorkflowTask = {
  id: string;
  title: string;
  dependsOnTaskIds: string[];
  assigneeId?: string;
  department?: DepartmentKey;
  dueDay?: number | 'last';
  checklist?: string[];
  recurrence?: Recurrence;
};

export type WorkflowGroup = {
  id: string;
  name: string;
  dependsOnGroupIds: string[];
  tasks: WorkflowTask[];
  department?: 'warehouse' | 'cost' | 'receivables' | 'finance';
};

export type WorkflowBinding = {
  id: string;
  kind: 'voucher' | 'report';
  module: string;
  controller: string;
  screen: string;
  action: 'submit' | 'save-filter' | 'run';
  buttonLabel: string;
  taskId: string;
  enabled: boolean;
};

export type WorkflowAuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
};

export type WorkflowConfig = {
  version: 1;
  groups: WorkflowGroup[];
  bindings: WorkflowBinding[];
  audit: WorkflowAuditEntry[];
  published?: { revision: number; groups: WorkflowGroup[] };
};

const task = (id: string, title: string, previous?: string, extra: Partial<WorkflowTask> = {}): WorkflowTask => ({
  id,
  title,
  dependsOnTaskIds: previous ? [previous] : [],
  ...extra,
});

export const INITIAL_WORKFLOW_CONFIG: WorkflowConfig = {
  version: 1,
  groups: [
    {
      id: 'purchase', name: 'Mua hàng', dependsOnGroupIds: [],
      tasks: [
        task('purchase-1', 'Chốt hóa đơn đầu vào'),
        task('purchase-2', 'Kiểm tra công nợ theo hóa đơn', 'purchase-1'),
        task('purchase-3', 'Kiểm tra bảng kê hóa đơn hàng hóa dịch vụ mua vào', 'purchase-2'),
      ],
    },
    {
      id: 'sales', name: 'Bán hàng', dependsOnGroupIds: [],
      tasks: [
        task('sales-1', 'Chốt hóa đơn đầu ra'),
        task('sales-2', 'Kiểm tra công nợ theo hóa đơn', 'sales-1'),
        task('sales-3', 'Kiểm tra bảng kê hóa đơn hàng hóa dịch vụ bán ra', 'sales-2'),
        task('sales-4', 'Đối chiếu công nợ khách hàng', undefined, { recurrence: { freq: 'weekly', weekday: 5 } }),
      ],
    },
    {
      id: 'warehouse', name: 'Kho', dependsOnGroupIds: ['purchase', 'sales'],
      tasks: [
        task('warehouse-1', 'Kiểm tra tổng hợp nhập xuất tồn'),
        task('warehouse-2', 'Kiểm kê kho', 'warehouse-1'),
        task('warehouse-3', 'Tính giá hàng tồn kho', 'warehouse-2'),
      ],
    },
    {
      id: 'production', name: 'Giá thành / sản xuất', dependsOnGroupIds: ['warehouse'],
      tasks: [
        task('production-1', 'Tính giá thành'),
        task('production-2', 'Kiểm tra báo cáo kế hoạch / thực tế', 'production-1'),
      ],
    },
    {
      id: 'costchain', name: 'Chốt kỳ giá thành', dependsOnGroupIds: [],
      tasks: [
        task('costchain-1', 'Kho chốt số liệu nhập xuất tồn', undefined, { department: 'warehouse' }),
        task('costchain-2', 'Tổng hợp tính giá vốn', 'costchain-1', { department: 'finance' }),
        task('costchain-3', 'Sản xuất tính giá thành', 'costchain-2', { department: 'cost' }),
        task('costchain-4', 'Tổng hợp lên báo cáo', 'costchain-3', { department: 'finance' }),
      ],
    },
    {
      id: 'tax', name: 'Thuế', dependsOnGroupIds: ['purchase', 'sales'],
      tasks: [
        task('tax-1', 'Kiểm tra báo cáo thuế đầu vào'),
        task('tax-2', 'Kiểm tra báo cáo thuế đầu ra', 'tax-1'),
        task('tax-3', 'Nộp tờ khai thuế', 'tax-2'),
      ],
    },
    {
      id: 'closing', name: 'Tổng hợp', dependsOnGroupIds: ['warehouse', 'production', 'costchain', 'tax'],
      tasks: [
        task('closing-1', 'Kiểm tra lại phát sinh sổ cái'),
        task('closing-2', 'Tính phân bổ CCDC', 'closing-1'),
        task('closing-3', 'Tính khấu hao TSCĐ', 'closing-2'),
        task('closing-4', 'Phân bổ cuối kỳ', 'closing-3'),
        task('closing-5', 'Kết chuyển cuối kỳ', 'closing-4'),
        task('closing-6', 'Kiểm tra báo cáo tài chính', 'closing-5'),
      ],
    },
  ],
  bindings: [
    { id: 'bind-voucher-purchase', kind: 'voucher', module: 'Mua hàng', controller: 'PurchaseInvoiceController', screen: 'Hóa đơn mua hàng', action: 'submit', buttonLabel: 'Gửi duyệt', taskId: 'purchase-1', enabled: true },
    { id: 'bind-voucher-sales', kind: 'voucher', module: 'Bán hàng', controller: 'SalesInvoiceController', screen: 'Hóa đơn bán hàng', action: 'submit', buttonLabel: 'Gửi duyệt', taskId: 'sales-1', enabled: true },
    { id: 'bind-voucher-stock', kind: 'voucher', module: 'Kho', controller: 'InventoryController', screen: 'Phiếu nhập / xuất kho', action: 'submit', buttonLabel: 'Gửi duyệt', taskId: 'warehouse-1', enabled: true },
    { id: 'bind-report-purchase-submit', kind: 'report', module: 'Mua hàng', controller: 'PurchaseReportController', screen: 'Bảng kê hóa đơn mua vào', action: 'submit', buttonLabel: 'Gửi thao tác', taskId: 'purchase-3', enabled: true },
    { id: 'bind-report-purchase-filter', kind: 'report', module: 'Mua hàng', controller: 'PurchaseReportController', screen: 'Bảng kê hóa đơn mua vào', action: 'save-filter', buttonLabel: 'Lưu bộ lọc', taskId: 'purchase-3', enabled: true },
    { id: 'bind-report-sales-submit', kind: 'report', module: 'Bán hàng', controller: 'SalesReportController', screen: 'Bảng kê hóa đơn bán ra', action: 'submit', buttonLabel: 'Gửi thao tác', taskId: 'sales-3', enabled: true },
    { id: 'bind-report-sales-filter', kind: 'report', module: 'Bán hàng', controller: 'SalesReportController', screen: 'Bảng kê hóa đơn bán ra', action: 'save-filter', buttonLabel: 'Lưu bộ lọc', taskId: 'sales-3', enabled: true },
    { id: 'bind-report-stock-submit', kind: 'report', module: 'Kho', controller: 'InventoryReportController', screen: 'Tổng hợp nhập xuất tồn', action: 'submit', buttonLabel: 'Gửi thao tác', taskId: 'warehouse-1', enabled: true },
    { id: 'bind-report-stock-filter', kind: 'report', module: 'Kho', controller: 'InventoryReportController', screen: 'Tổng hợp nhập xuất tồn', action: 'save-filter', buttonLabel: 'Lưu bộ lọc', taskId: 'warehouse-1', enabled: true },
    { id: 'bind-report-cost-submit', kind: 'report', module: 'Giá thành', controller: 'CostReportController', screen: 'Báo cáo kế hoạch / thực tế', action: 'submit', buttonLabel: 'Gửi thao tác', taskId: 'production-2', enabled: true },
    { id: 'bind-report-cost-filter', kind: 'report', module: 'Giá thành', controller: 'CostReportController', screen: 'Báo cáo kế hoạch / thực tế', action: 'save-filter', buttonLabel: 'Lưu bộ lọc', taskId: 'production-2', enabled: true },
    { id: 'bind-report-tax-submit', kind: 'report', module: 'Thuế', controller: 'TaxReportController', screen: 'Báo cáo thuế', action: 'submit', buttonLabel: 'Gửi thao tác', taskId: 'tax-1', enabled: true },
    { id: 'bind-report-tax-filter', kind: 'report', module: 'Thuế', controller: 'TaxReportController', screen: 'Báo cáo thuế', action: 'save-filter', buttonLabel: 'Lưu bộ lọc', taskId: 'tax-1', enabled: true },
    { id: 'bind-report-closing-submit', kind: 'report', module: 'Tổng hợp', controller: 'FinancialReportController', screen: 'Báo cáo tài chính', action: 'submit', buttonLabel: 'Gửi thao tác', taskId: 'closing-6', enabled: true },
    { id: 'bind-report-closing-filter', kind: 'report', module: 'Tổng hợp', controller: 'FinancialReportController', screen: 'Báo cáo tài chính', action: 'save-filter', buttonLabel: 'Lưu bộ lọc', taskId: 'closing-6', enabled: true },
    { id: 'bind-run-costchain-1', kind: 'report', module: 'Kho', controller: 'InventoryController', screen: 'Chốt số liệu kho', action: 'run', buttonLabel: 'Chốt số liệu', taskId: 'costchain-1', enabled: true },
    { id: 'bind-run-costchain-2', kind: 'report', module: 'Tổng hợp', controller: 'CostingController', screen: 'Tính giá vốn', action: 'run', buttonLabel: 'Tính giá vốn', taskId: 'costchain-2', enabled: true },
    { id: 'bind-run-costchain-3', kind: 'report', module: 'Giá thành', controller: 'ProductionCostController', screen: 'Tính giá thành sản xuất', action: 'run', buttonLabel: 'Tính giá thành', taskId: 'costchain-3', enabled: true },
    { id: 'bind-submit-costchain-4', kind: 'report', module: 'Tổng hợp', controller: 'CostSummaryReportController', screen: 'Báo cáo tổng hợp giá thành', action: 'submit', buttonLabel: 'Gửi thao tác', taskId: 'costchain-4', enabled: true },
    { id: 'bind-run-sales-4', kind: 'report', module: 'Công nợ', controller: 'ReceivableController', screen: 'Đối chiếu công nợ khách hàng', action: 'run', buttonLabel: 'Đối chiếu', taskId: 'sales-4', enabled: true },
    { id: 'bind-run-tax-3', kind: 'report', module: 'Thuế', controller: 'TaxDeclarationController', screen: 'Tờ khai thuế GTGT', action: 'run', buttonLabel: 'Lập tờ khai', taskId: 'tax-3', enabled: true },
    { id: 'bind-run-closing-3', kind: 'report', module: 'Tổng hợp', controller: 'DepreciationController', screen: 'Khấu hao TSCĐ', action: 'run', buttonLabel: 'Tính khấu hao', taskId: 'closing-3', enabled: true },
    { id: 'bind-run-closing-5', kind: 'report', module: 'Tổng hợp', controller: 'CarryForwardController', screen: 'Kết chuyển cuối kỳ', action: 'run', buttonLabel: 'Kết chuyển', taskId: 'closing-5', enabled: true },
  ],
  audit: [],
};

export const allWorkflowTasks = (groups: WorkflowGroup[]) => groups.flatMap(group => group.tasks.map(item => ({ ...item, groupId: group.id, groupName: group.name })));

export const groupDepartment = (group: WorkflowGroup): 'warehouse' | 'cost' | 'receivables' | 'finance' => group.department ?? ({ purchase: 'receivables', sales: 'receivables', warehouse: 'warehouse', production: 'cost', tax: 'finance', closing: 'finance' } as Record<string, 'warehouse' | 'cost' | 'receivables' | 'finance'>)[group.id] ?? 'finance';

export const publishedWorkflow = (config: WorkflowConfig) => config.published ?? { revision: 1, groups: INITIAL_WORKFLOW_CONFIG.groups };

export const taskDepartment = (group: WorkflowGroup, item: WorkflowTask): DepartmentKey => item.department ?? groupDepartment(group);

/** Các liên kết đang bật có khả năng tự hoàn thành đầu việc (Submit / chạy nghiệp vụ). Lưu bộ lọc chỉ ghi log. */
export const completingBindings = (config: WorkflowConfig, templateId?: string) => templateId ? config.bindings.filter(item => item.enabled && item.action !== 'save-filter' && item.taskId === templateId) : [];
