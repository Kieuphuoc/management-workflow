export type SubsystemType = 'GL' | 'AR' | 'AP' | 'CA' | 'HR' | 'WH';
export type SlaStatusType = 'ontime' | 'late' | 'overdue' | 'notyet';
export type TaskStatusType = 'active' | 'inactive';

export interface TaskDeclarationItem {
  id: string;
  stt: number;
  description: string;
  subsystem: SubsystemType;
  screenCode: string;
  screenName: string;
  actionName: string;
  cycle: 'Hàng ngày' | 'Hàng tuần' | 'Hàng tháng' | 'Hàng quý' | 'Hàng năm';
  cycleDetail: string;
  dayRule: string;
  assignedTo: string;
  assignedType: 'user' | 'group';
  status: TaskStatusType;
  department: string;
  entity: string;
  notificationEnabled: boolean;
  notificationChannels: ('email' | 'sms' | 'app')[];
  remindBeforeDays: number;
}

export interface SystemAuditLogItem {
  id: string;
  eventKey?: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  userId: string;
  userName: string;
  department: string;
  entity: string;
  subsystem: SubsystemType;
  screenCode: string;
  screenName: string;
  actionName: string;
  resultStatus: 'success' | 'warning' | 'failed';
  ipAddress: string;
  details: string;
}

export const INITIAL_DECLARATION_TASKS: TaskDeclarationItem[] = [
  {
    id: 'decl-1',
    stt: 1,
    description: 'Tính giá thành sản xuất',
    subsystem: 'GL',
    screenCode: 'xtgtcb',
    screenName: 'Tính giá thành',
    actionName: 'Tính giá',
    cycle: 'Hàng tháng',
    cycleDetail: 'định kỳ',
    dayRule: 'Ngày 05',
    assignedTo: 'Nhóm: Kế toán giá thành',
    assignedType: 'group',
    status: 'active',
    department: 'Phòng Kế toán',
    entity: 'CTY CP Công nghệ Arito Demo',
    notificationEnabled: true,
    notificationChannels: ['email', 'app'],
    remindBeforeDays: 1,
  },
  {
    id: 'decl-2',
    stt: 2,
    description: 'Kết chuyển cuối kỳ (lãi/lỗ, giá vốn, chi phí)',
    subsystem: 'GL',
    screenCode: 'btkc',
    screenName: 'Bút toán kết chuyển',
    actionName: 'Kết chuyển',
    cycle: 'Hàng tháng',
    cycleDetail: 'định kỳ',
    dayRule: 'Ngày cuối tháng',
    assignedTo: 'Nguyễn Đình Vương Hoàng',
    assignedType: 'user',
    status: 'active',
    department: 'Phòng Kế toán',
    entity: 'CTY CP Công nghệ Arito Demo',
    notificationEnabled: true,
    notificationChannels: ['email', 'sms', 'app'],
    remindBeforeDays: 2,
  },
  {
    id: 'decl-3',
    stt: 3,
    description: 'Nộp tờ khai thuế GTGT',
    subsystem: 'AR',
    screenCode: 'tktgtgt',
    screenName: 'Tờ khai thuế GTGT',
    actionName: 'Lập tờ khai',
    cycle: 'Hàng quý',
    cycleDetail: 'định kỳ',
    dayRule: 'Ngày 20',
    assignedTo: 'Nhóm: Kế toán thuế',
    assignedType: 'group',
    status: 'active',
    department: 'Phòng Thuế',
    entity: 'CTY CP Công nghệ Arito Demo',
    notificationEnabled: true,
    notificationChannels: ['email', 'app'],
    remindBeforeDays: 3,
  },
  {
    id: 'decl-4',
    stt: 4,
    description: 'Chốt sổ kế toán tháng',
    subsystem: 'GL',
    screenCode: 'csks',
    screenName: 'Chốt sổ kế toán',
    actionName: 'Chốt sổ',
    cycle: 'Hàng tháng',
    cycleDetail: 'định kỳ',
    dayRule: 'Ngày cuối tháng',
    assignedTo: 'Lê Văn Hùng, Trần Thị Mai',
    assignedType: 'user',
    status: 'active',
    department: 'Phòng Kế toán',
    entity: 'CTY CP Công nghệ Arito Demo',
    notificationEnabled: true,
    notificationChannels: ['email'],
    remindBeforeDays: 1,
  },
  {
    id: 'decl-5',
    stt: 5,
    description: 'Lên đề nghị thanh toán nhà cung cấp',
    subsystem: 'AP',
    screenCode: 'dnttncc',
    screenName: 'Đề nghị thanh toán',
    actionName: 'Submit',
    cycle: 'Hàng tuần',
    cycleDetail: 'định kỳ',
    dayRule: 'Thứ 2',
    assignedTo: 'Nhóm: Kế toán công nợ',
    assignedType: 'group',
    status: 'active',
    department: 'Phòng Tài chính',
    entity: 'CTY CP Công nghệ Arito Demo',
    notificationEnabled: true,
    notificationChannels: ['app'],
    remindBeforeDays: 1,
  },
  {
    id: 'decl-6',
    stt: 6,
    description: 'Đối chiếu quỹ tiền mặt cuối ngày',
    subsystem: 'CA',
    screenCode: 'dcqtm',
    screenName: 'Đối chiếu quỹ',
    actionName: 'Submit',
    cycle: 'Hàng ngày',
    cycleDetail: 'định kỳ',
    dayRule: 'Hằng ngày',
    assignedTo: 'Phạm Thu Hà',
    assignedType: 'user',
    status: 'active',
    department: 'Phòng Tài chính',
    entity: 'CTY CP Công nghệ Arito Demo',
    notificationEnabled: false,
    notificationChannels: [],
    remindBeforeDays: 0,
  },
  {
    id: 'decl-7',
    stt: 7,
    description: 'Quyết toán thuế TNDN năm',
    subsystem: 'AR',
    screenCode: 'tktndn',
    screenName: 'Tờ khai TNDN',
    actionName: 'Lập tờ khai',
    cycle: 'Hàng năm',
    cycleDetail: 'định kỳ',
    dayRule: '31/03',
    assignedTo: 'Nhóm: Kế toán thuế',
    assignedType: 'group',
    status: 'inactive',
    department: 'Phòng Thuế',
    entity: 'CTY CP Công nghệ Arito Demo',
    notificationEnabled: false,
    notificationChannels: [],
    remindBeforeDays: 7,
  },
  {
    id: 'decl-8',
    stt: 8,
    description: 'Kết chuyển doanh thu, chi phí vào KQKD',
    subsystem: 'GL',
    screenCode: 'btkc',
    screenName: 'Bút toán kết chuyển',
    actionName: 'Kết chuyển',
    cycle: 'Hàng tháng',
    cycleDetail: 'định kỳ',
    dayRule: 'Ngày cuối tháng',
    assignedTo: 'Nguyễn Đình Vương Hoàng',
    assignedType: 'user',
    status: 'inactive',
    department: 'Phòng Kế toán',
    entity: 'CTY CP Công nghệ Arito Demo',
    notificationEnabled: false,
    notificationChannels: [],
    remindBeforeDays: 1,
  },
  {
    id: 'decl-9',
    stt: 9,
    description: 'Đối chiếu công nợ khách hàng',
    subsystem: 'AP',
    screenCode: 'dccnkh',
    screenName: 'Đối chiếu công nợ',
    actionName: 'Submit',
    cycle: 'Hàng quý',
    cycleDetail: 'định kỳ',
    dayRule: 'Ngày 10',
    assignedTo: 'Nhóm: Kế toán công nợ',
    assignedType: 'group',
    status: 'active',
    department: 'Phòng Tài chính',
    entity: 'CTY CP Công nghệ Arito Demo',
    notificationEnabled: true,
    notificationChannels: ['email', 'app'],
    remindBeforeDays: 2,
  },
];

export const INITIAL_SYSTEM_AUDIT_LOGS: SystemAuditLogItem[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-30 16:42:15',
    userId: 'USR-HOANG-01',
    userName: 'Nguyễn Đình Vương Hoàng',
    department: 'Phòng Kế toán',
    entity: 'CTY CP Công nghệ Arito Demo',
    subsystem: 'GL',
    screenCode: 'btkc',
    screenName: 'Bút toán kết chuyển',
    actionName: 'Kết chuyển',
    resultStatus: 'success',
    ipAddress: '192.168.1.104',
    details: 'Đã thực hiện kết chuyển doanh thu, chi phí kỳ 09/2026. Số chứng từ: KC-092026-001',
  },
  {
    id: 'log-2',
    timestamp: '2026-09-11 08:30:20',
    userId: 'USR-HA-02',
    userName: 'Phạm Thu Hà',
    department: 'Phòng Tài chính',
    entity: 'CTY CP Công nghệ Arito Demo',
    subsystem: 'CA',
    screenCode: 'dcqtm',
    screenName: 'Đối chiếu quỹ',
    actionName: 'Submit',
    resultStatus: 'success',
    ipAddress: '192.168.1.112',
    details: 'Đối chiếu quỹ tiền mặt cuối ngày 10/09 (thực hiện sáng 11/09). Số dư quỹ khớp: 45.320.000 đ',
  },
  {
    id: 'log-3',
    timestamp: '2026-09-10 14:20:05',
    userId: 'USR-HUNG-03',
    userName: 'Lê Văn Hùng',
    department: 'Phòng Tài chính',
    entity: 'CTY CP Công nghệ Arito Demo',
    subsystem: 'AP',
    screenCode: 'dccnkh',
    screenName: 'Đối chiếu công nợ',
    actionName: 'Submit',
    resultStatus: 'success',
    ipAddress: '192.168.1.118',
    details: 'Đối chiếu công nợ khách hàng quý 3/2026. Đã gửi email xác nhận cho 18 khách hàng',
  },
  {
    id: 'log-4',
    timestamp: '2026-09-07 10:02:40',
    userId: 'USR-HA-02',
    userName: 'Phạm Thu Hà',
    department: 'Phòng Tài chính',
    entity: 'CTY CP Công nghệ Arito Demo',
    subsystem: 'AP',
    screenCode: 'dnttncc',
    screenName: 'Đề nghị thanh toán',
    actionName: 'Submit',
    resultStatus: 'success',
    ipAddress: '192.168.1.112',
    details: 'Lên đợt đề nghị thanh toán NCC tuần 37/2026. Tổng số tiền: 340.000.000 đ',
  },
  {
    id: 'log-5',
    timestamp: '2026-09-07 09:15:10',
    userId: 'USR-MAI-04',
    userName: 'Trần Thị Mai',
    department: 'Phòng Kế toán',
    entity: 'CTY CP Công nghệ Arito Demo',
    subsystem: 'GL',
    screenCode: 'xtgtcb',
    screenName: 'Tính giá thành',
    actionName: 'Tính giá',
    resultStatus: 'success',
    ipAddress: '192.168.1.109',
    details: 'Tính giá thành sản xuất tháng 08/2026 (hoàn thành ngày 07/09 trễ hạn SLA ngày 05)',
  },
];

export const AVAILABLE_ENTITIES = [
  'CTY CP Công nghệ Arito Demo',
  'ARITO-VN',
  'DELTA',
  'BIZ-EYES',
];

export const AVAILABLE_DEPARTMENTS = [
  'Tất cả bộ phận',
  'Phòng Kế toán',
  'Phòng Tài chính',
  'Phòng Thuế',
  'Phòng Vận hành',
];

export const AVAILABLE_SUBSYSTEMS: { code: SubsystemType; name: string }[] = [
  { code: 'GL', name: 'GL - Sổ cái & Giá thành' },
  { code: 'AR', name: 'AR - Phải thu & Thuế' },
  { code: 'AP', name: 'AP - Phải trả & NCC' },
  { code: 'CA', name: 'CA - Tiền mặt & Ngân hàng' },
  { code: 'WH', name: 'WH - Kho vận & Vật phẩm' },
  { code: 'HR', name: 'HR - Nhân sự & Tiền lương' },
];

export const AVAILABLE_SCREENS_BY_SUBSYSTEM: Record<SubsystemType, { code: string; name: string; defaultAction: string }[]> = {
  GL: [
    { code: 'xtgtcb', name: 'Tính giá thành', defaultAction: 'Tính giá' },
    { code: 'btkc', name: 'Bút toán kết chuyển', defaultAction: 'Kết chuyển' },
    { code: 'csks', name: 'Chốt sổ kế toán', defaultAction: 'Chốt sổ' },
  ],
  AR: [
    { code: 'tktgtgt', name: 'Tờ khai thuế GTGT', defaultAction: 'Lập tờ khai' },
    { code: 'tktndn', name: 'Tờ khai TNDN', defaultAction: 'Lập tờ khai' },
    { code: 'hdvat', name: 'Hóa đơn GTGT đầu ra', defaultAction: 'Phát hành' },
  ],
  AP: [
    { code: 'dnttncc', name: 'Đề nghị thanh toán', defaultAction: 'Submit' },
    { code: 'dccnkh', name: 'Đối chiếu công nợ', defaultAction: 'Submit' },
    { code: 'hdmua', name: 'Hóa đơn mua hàng', defaultAction: 'Duyệt' },
  ],
  CA: [
    { code: 'dcqtm', name: 'Đối chiếu quỹ', defaultAction: 'Submit' },
    { code: 'ptm', name: 'Phiếu thu tiền mặt', defaultAction: 'Lưu & In' },
    { code: 'pcm', name: 'Phiếu chi tiền mặt', defaultAction: 'Duyệt chi' },
  ],
  WH: [
    { code: 'pnk', name: 'Phiếu nhập kho POSM', defaultAction: 'Nhập kho' },
    { code: 'pxk', name: 'Phiếu xuất kho Event', defaultAction: 'Xuất kho' },
  ],
  HR: [
    { code: 'tluong', name: 'Bảng tính lương tháng', defaultAction: 'Chốt lương' },
  ],
};
