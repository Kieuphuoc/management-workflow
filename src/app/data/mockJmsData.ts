export interface JobItem {
  id: string;
  jobCode: string;
  contractCode?: string;
  isLocked: boolean; // Khóa nếu đã phát sinh số liệu tài chính trên Arito
  jobName: string;
  client: string;
  clientCode: string;
  contractClient: string;
  clientType?: string;
  contactPerson?: {
    name: string;
    phone?: string;
    email?: string;
  };
  brand: string;
  category: string;
  jobType: string;
  industry: string;
  potentialBudget: number;
  allocatedBilling: number;
  grossProfitPercent: number;
  startDate: string;
  endDate: string;
  kickoffDate: string;
  status: 'Running' | 'Done' | 'Bidding' | 'Pending' | 'Cancelled' | 'Liquidation';
  team: string;
  projectLeader: {
    name: string;
    avatar: string;
    role: string;
  };
  assistants: Array<{
    name: string;
    avatar: string;
  }>;
  accountLead: {
    name: string;
    avatar: string;
  };
  description?: string;
  briefedBilling: number;
  contractBilling: number;
  invoicedBilling: number;
  receivableBilling: number;
  actualReceived: number;
  remindersCount: number;
  membersCount: number;
  monthlyAllocations?: MonthlyRevenueAllocation[];
}

export interface MonthlyRevenueAllocation {
  monthIndex: number;
  monthLabel: string;
  period?: string;
  amount: number;
  percentage: number;
  status?: 'Completed' | 'Current' | 'Planned';
  note?: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  role: string;
  bonusPercent: number; // Tỷ lệ thưởng bắt buộc theo SQC (%)
  assignedBudget: number;
  kpiCompletion: number; // %
  csatScore: number; // out of 5
}

export interface PaymentTerm {
  id: string;
  termCode: string;
  termName: string;
  percentage: number;
  plannedAmount: number;
  plannedDate: string;
  dueDate: string;
  invoicedAmount: number;
  actualReceivedAmount: number;
  actualReceiptDate?: string;
  actualCostSpent: number;
  actualCostRemaining: number;
  reconciliationStatus: 'Synced' | 'Pending_PO' | 'Pending_Invoice' | 'Pending_Payment' | 'Diff_Amount' | 'Draft' | 'Pending';
  poNumber?: string;
  acceptanceDoc?: string;
  vatInvoiceNo?: string;
  notes?: string;
}

export interface ProgressLog {
  id: string;
  date: string;
  status: string;
  nextStep: string;
  byStaff: string;
  tagType: 'info' | 'success' | 'warning' | 'error';
}

export interface HierarchyNode {
  id: string;
  name: string;
  code: string;
  type: 'BrandCorp' | 'BU' | 'SubUnit';
  children?: HierarchyNode[];
}

export const HIERARCHY_DATA: HierarchyNode = {
  id: 'corp-1',
  name: 'Arito Group (Holding)',
  code: 'SQ-CORP',
  type: 'BrandCorp',
  children: [
    {
      id: 'bu-1',
      name: 'BU 1 - Activation & Events (SEC)',
      code: 'SEC-ACT',
      type: 'BU',
      children: [
        { id: 'sub-1', name: 'Team Nghi (Key Accounts)', code: 'SEC-T-NGHI', type: 'SubUnit' },
        { id: 'sub-2', name: 'Team Ngân (FMCG & Tech)', code: 'SEC-T-NGAN', type: 'SubUnit' },
        { id: 'sub-3', name: 'Team Thảo (Experiential)', code: 'SEC-T-THAO', type: 'SubUnit' },
      ],
    },
    {
      id: 'bu-2',
      name: 'BU 2 - Retail & POSM Production',
      code: 'SQ-POSM',
      type: 'BU',
      children: [
        { id: 'sub-4', name: 'Team Huy (Production Hub)', code: 'POSM-T-HUY', type: 'SubUnit' },
        { id: 'sub-5', name: 'Team Nam (Retail Merchandising)', code: 'POSM-T-NAM', type: 'SubUnit' },
      ],
    },
    {
      id: 'bu-3',
      name: 'BU 3 - Creative & Integrated Campaign',
      code: 'SQ-CRTV',
      type: 'BU',
      children: [
        { id: 'sub-6', name: 'Team Creative Studio Alpha', code: 'CRTV-T-ALPHA', type: 'SubUnit' },
      ],
    },
  ],
};

export const INITIAL_JOBS: JobItem[] = [
  {
    id: 'job-1',
    jobCode: 'ARITO-026-452',
    contractCode: 'HD-2026/08-UNI',
    isLocked: true,
    jobName: 'PC DT ENGAGEMENT POSM',
    client: 'Unilever Việt Nam',
    clientCode: 'CLI-UNIL-01',
    contractClient: 'Công ty TNHH Quốc Tế Unilever Việt Nam',
    brand: 'Close Up',
    category: 'POSM Production',
    jobType: 'Retail Merchandising & POSM',
    industry: 'FMCG - Personal Care',
    potentialBudget: 200000000,
    allocatedBilling: 200000000,
    grossProfitPercent: 30.0,
    startDate: '2026-08-27',
    endDate: '2026-09-15',
    kickoffDate: '2026-08-29',
    status: 'Running',
    team: 'Team Nghi',
    projectLeader: {
      name: 'Lê Thị Mỹ Duyên',
      avatar: 'D',
      role: 'Project Leader',
    },
    assistants: [
      { name: 'Lê Hải Minh', avatar: 'M' },
      { name: 'Nguyễn Ngọc Nghi', avatar: 'N' },
    ],
    accountLead: {
      name: 'Trần Minh Quang',
      avatar: 'Q',
    },
    description: '[THU CHI HỘ] Mua hàng theo order khách hàng Unilever POSM quý 3/2026.',
    briefedBilling: 200000000,
    contractBilling: 200000000,
    invoicedBilling: 120000000,
    receivableBilling: 80000000,
    actualReceived: 120000000,
    remindersCount: 0,
    membersCount: 4,
    monthlyAllocations: [
      { monthIndex: 1, monthLabel: 'Month 01', period: '08/2026', amount: 50000000, percentage: 25, status: 'Completed', note: 'Phase 1: Kickoff & POSM procurement' },
      { monthIndex: 2, monthLabel: 'Month 02', period: '09/2026', amount: 50000000, percentage: 25, status: 'Current', note: 'Phase 2: Supermarket rollout & installation' },
      { monthIndex: 3, monthLabel: 'Month 03', period: '10/2026', amount: 100000000, percentage: 50, status: 'Planned', note: 'Phase 3: Final acceptance & settlement' },
    ],
  },
  {
    id: 'job-2',
    jobCode: 'ARITO-025-018',
    contractCode: 'HD-2025/11-SAM',
    isLocked: true,
    jobName: 'Samsung Sự kiện khai trương và hoạt náo 2025',
    client: 'Samsung Electronics Vina',
    clientCode: 'CLI-SAM-02',
    contractClient: 'Công ty TNHH Điện Tử Samsung Vina',
    brand: 'Galaxy Experience',
    category: 'Events & Activations',
    jobType: 'Flagship Store Launch',
    industry: 'Consumer Technology',
    potentialBudget: 5000000000,
    allocatedBilling: 4950000000,
    grossProfitPercent: 32.0,
    startDate: '2025-11-01',
    endDate: '2026-01-20',
    kickoffDate: '2025-11-05',
    status: 'Done',
    team: 'Team Nghi',
    projectLeader: {
      name: 'Nguyễn Ngọc Nghi',
      avatar: 'N',
      role: 'Account Director',
    },
    assistants: [
      { name: 'Phạm Hồng Đức', avatar: 'Đ' },
      { name: 'Hoàng Anh Tuấn', avatar: 'T' },
    ],
    accountLead: {
      name: 'Hoàng Anh Tuấn',
      avatar: 'H',
    },
    description: 'Chiến dịch Activation chuỗi 15 cửa hàng trải nghiệm toàn quốc.',
    briefedBilling: 5000000000,
    contractBilling: 5000000000,
    invoicedBilling: 5000000000,
    receivableBilling: 0,
    actualReceived: 5000000000,
    remindersCount: 0,
    membersCount: 8,
  },
  {
    id: 'job-3',
    jobCode: 'ARITO-026-047',
    contractCode: 'HD-2026/02-SAM',
    isLocked: true,
    jobName: 'Samsung Miracle - Touch MKT 2026',
    client: 'Samsung Electronics Vina',
    clientCode: 'CLI-SAM-02',
    contractClient: 'Công ty TNHH Điện Tử Samsung Vina',
    brand: 'Samsung Display & AI',
    category: 'Events & Activations',
    jobType: 'Interactive Roadshow',
    industry: 'Consumer Technology',
    potentialBudget: 5300000000,
    allocatedBilling: 5100000000,
    grossProfitPercent: 30.0,
    startDate: '2026-02-10',
    endDate: '2026-06-30',
    kickoffDate: '2026-02-15',
    status: 'Done',
    team: 'Team Ngân',
    projectLeader: {
      name: 'Trần Kim Ngân',
      avatar: 'N',
      role: 'Project Director',
    },
    assistants: [
      { name: 'Vũ Đức Thịnh', avatar: 'T' },
    ],
    accountLead: {
      name: 'Trần Kim Ngân',
      avatar: 'N',
    },
    description: 'Roadshow trải nghiệm công nghệ AI Display tại 3 miền.',
    briefedBilling: 5300000000,
    contractBilling: 5300000000,
    invoicedBilling: 5300000000,
    receivableBilling: 0,
    actualReceived: 5300000000,
    remindersCount: 0,
    membersCount: 7,
  },
  {
    id: 'job-4',
    jobCode: 'ARITO-026-292',
    contractCode: 'HD-2026/06-ULV-CLU',
    isLocked: false,
    jobName: 'CLOSE UP HAILEE FLAGSHIP STORE',
    client: 'Unilever Việt Nam',
    clientCode: 'CLI-UNIL-01',
    contractClient: 'Công ty TNHH Quốc Tế Unilever Việt Nam',
    brand: 'Close Up',
    category: 'Retail Experience',
    jobType: 'Store Design & Build',
    industry: 'FMCG - Personal Care',
    potentialBudget: 800000000,
    allocatedBilling: 800000000,
    grossProfitPercent: 32.0,
    startDate: '2026-06-01',
    endDate: '2026-07-30',
    kickoffDate: '2026-06-05',
    status: 'Running',
    team: 'Team Nghi',
    projectLeader: {
      name: 'Nguyễn Ngọc Nghi',
      avatar: 'N',
      role: 'Account Lead',
    },
    assistants: [],
    accountLead: {
      name: 'Trần Văn Tùng',
      avatar: 'T',
    },
    description: 'Dự án flagship store trải nghiệm thương hiệu Close Up Hailee tại TP.HCM.',
    briefedBilling: 800000000,
    contractBilling: 0,
    invoicedBilling: 0,
    receivableBilling: 0,
    actualReceived: 0,
    remindersCount: 0,
    membersCount: 2,
  },
  {
    id: 'job-5',
    jobCode: 'ARITO-026-199',
    contractCode: '',
    isLocked: false,
    jobName: 'PC HOMEBASE DECORATION',
    client: 'Unilever Việt Nam',
    clientCode: 'CLI-UNIL-01',
    contractClient: 'Công ty TNHH Quốc Tế Unilever Việt Nam',
    brand: 'OMO Matic',
    category: 'POSM Production',
    jobType: 'Display Merchandising',
    industry: 'FMCG - Home Care',
    potentialBudget: 200000000,
    allocatedBilling: 0,
    grossProfitPercent: 32.0,
    startDate: '2026-05-10',
    endDate: '2026-06-15',
    kickoffDate: '2026-05-12',
    status: 'Cancelled',
    team: 'Team Nghi',
    projectLeader: {
      name: 'Nguyễn Ngọc Nghi',
      avatar: 'N',
      role: 'Account Lead',
    },
    assistants: [],
    accountLead: {
      name: 'Trần Văn Tùng',
      avatar: 'T',
    },
    description: 'Hủy theo yêu cầu cắt giảm POSM tại kênh siêu thị.',
    briefedBilling: 200000000,
    contractBilling: 0,
    invoicedBilling: 0,
    receivableBilling: 0,
    actualReceived: 0,
    remindersCount: 0,
    membersCount: 2,
  },
  {
    id: 'job-6',
    jobCode: 'ARITO-026-454',
    contractCode: 'HD-2026/08-F2F',
    isLocked: false,
    jobName: 'PC GA BULT F2F in HCM',
    client: 'Unilever Việt Nam',
    clientCode: 'CLI-UNIL-01',
    contractClient: 'Công ty TNHH Quốc Tế Unilever Việt Nam',
    brand: 'Lifebuoy',
    category: 'Events & Activations',
    jobType: 'School Tour & Sampling',
    industry: 'FMCG - Hygiene',
    potentialBudget: 100000000,
    allocatedBilling: 95000000,
    grossProfitPercent: 32.0,
    startDate: '2026-08-20',
    endDate: '2026-09-30',
    kickoffDate: '2026-08-22',
    status: 'Running',
    team: 'Team Nghi',
    projectLeader: {
      name: 'Lê Hải Minh',
      avatar: 'M',
      role: 'Senior Project Executive',
    },
    assistants: [
      { name: 'Nguyễn Văn Nam', avatar: 'N' },
    ],
    accountLead: {
      name: 'Trần Văn Tùng',
      avatar: 'T',
    },
    description: 'Hoạt động tương tác trực tiếp F2F tại các trường học TP.HCM.',
    briefedBilling: 100000000,
    contractBilling: 100000000,
    invoicedBilling: 50000000,
    receivableBilling: 50000000,
    actualReceived: 50000000,
    remindersCount: 1,
    membersCount: 3,
  },
  {
    id: 'job-7',
    jobCode: 'ARITO-026-512',
    contractCode: 'HD-2026/09-SHO',
    isLocked: false,
    jobName: 'Shopee 9.9 Super Mega Shopping Festival',
    client: 'Shopee Việt Nam',
    clientCode: 'CLI-SHO-03',
    contractClient: 'Công ty TNHH Shopee',
    brand: 'Shopee Live & Mall',
    category: 'Events & Activations',
    jobType: 'Mega Concert & Livestream Show',
    industry: 'E-commerce & Tech',
    potentialBudget: 2800000000,
    allocatedBilling: 2650000000,
    grossProfitPercent: 34.5,
    startDate: '2026-08-15',
    endDate: '2026-09-12',
    kickoffDate: '2026-08-18',
    status: 'Running',
    team: 'Team Thảo',
    projectLeader: {
      name: 'Nguyễn Thị Phương Thảo',
      avatar: 'T',
      role: 'Executive Producer',
    },
    assistants: [
      { name: 'Bùi Gia Huy', avatar: 'H' },
      { name: 'Lâm Mỹ Linh', avatar: 'L' },
    ],
    accountLead: {
      name: 'Nguyễn Thị Phương Thảo',
      avatar: 'T',
    },
    description: 'Sản xuất đại nhạc hội kết hợp chuỗi Livestreaming tương tác thực tế.',
    briefedBilling: 2800000000,
    contractBilling: 2800000000,
    invoicedBilling: 1400000000,
    receivableBilling: 1400000000,
    actualReceived: 1400000000,
    remindersCount: 2,
    membersCount: 9,
  },
  {
    id: 'job-8',
    jobCode: 'ARITO-026-601',
    contractCode: '',
    isLocked: false,
    jobName: 'Nestle Milo Sport Arena 2026 Pitching',
    client: 'Nestle Việt Nam',
    clientCode: 'CLI-NES-04',
    contractClient: 'Công ty TNHH Nestle Việt Nam',
    brand: 'Milo',
    category: 'Events & Activations',
    jobType: 'School Tournament & Festival',
    industry: 'FMCG - Nutrition',
    potentialBudget: 3500000000,
    allocatedBilling: 0,
    grossProfitPercent: 33.0,
    startDate: '2026-10-01',
    endDate: '2026-12-25',
    kickoffDate: '2026-10-05',
    status: 'Bidding',
    team: 'Team Ngân',
    projectLeader: {
      name: 'Trần Kim Ngân',
      avatar: 'N',
      role: 'Project Director',
    },
    assistants: [
      { name: 'Lê Hoài An', avatar: 'A' },
    ],
    accountLead: {
      name: 'Trần Kim Ngân',
      avatar: 'N',
    },
    description: 'Đang chuẩn bị hồ sơ thầu giai đoạn 2 - Đấu thầu chiến dịch ngày hội thể thao trường học.',
    briefedBilling: 3500000000,
    contractBilling: 0,
    invoicedBilling: 0,
    receivableBilling: 0,
    actualReceived: 0,
    remindersCount: 3,
    membersCount: 5,
  },
];

export const INITIAL_JOB_DETAIL_MEMBERS: ProjectMember[] = [
  {
    id: 'mem-1',
    name: 'Lê Thị Mỹ Duyên',
    email: 'duyen.le@arito.vn',
    avatar: 'D',
    department: 'Account Department',
    role: 'Project Leader',
    bonusPercent: 35.0,
    assignedBudget: 70000000,
    kpiCompletion: 92,
    csatScore: 4.8,
  },
  {
    id: 'mem-2',
    name: 'Lê Hải Minh',
    email: 'minh.le@arito.vn',
    avatar: 'M',
    department: 'Account Department',
    role: 'Senior Account Executive',
    bonusPercent: 25.0,
    assignedBudget: 50000000,
    kpiCompletion: 88,
    csatScore: 4.6,
  },
  {
    id: 'mem-3',
    name: 'Nguyễn Ngọc Nghi',
    email: 'nghi.nguyen@arito.vn',
    avatar: 'N',
    department: 'Account Management',
    role: 'Account Director',
    bonusPercent: 20.0,
    assignedBudget: 40000000,
    kpiCompletion: 95,
    csatScore: 4.9,
  },
  {
    id: 'mem-4',
    name: 'Đặng Quốc Huy',
    email: 'huy.dang@arito.vn',
    avatar: 'H',
    department: 'Production & Logistics',
    role: 'Production Manager',
    bonusPercent: 20.0,
    assignedBudget: 40000000,
    kpiCompletion: 90,
    csatScore: 4.7,
  },
];

export const INITIAL_PAYMENT_TERMS: PaymentTerm[] = [
  {
    id: 'term-1',
    termCode: 'TERM-01',
    termName: 'Đợt 1: Tạm ứng 40% ngay sau khi ký hợp đồng & phát hành PO',
    percentage: 40.0,
    plannedAmount: 80000000,
    plannedDate: '2026-08-30',
    dueDate: '2026-09-05',
    invoicedAmount: 80000000,
    actualReceivedAmount: 80000000,
    actualReceiptDate: '2026-09-04 14:20',
    actualCostSpent: 52000000,
    actualCostRemaining: 28000000,
    reconciliationStatus: 'Synced',
    poNumber: 'PO-UNI-2026-452A',
    acceptanceDoc: 'BBTN-HD-01/2026',
    vatInvoiceNo: 'HDGTGT-0019284',
    notes: 'Tiền đã vào tài khoản VCB Arito lúc 14:20 ngày 04/09. Khớp 100% với phiếu thu Arito.',
  },
  {
    id: 'term-2',
    termCode: 'TERM-02',
    termName: 'Đợt 2: Thanh toán 30% sau khi hoàn thành sản xuất POSM đợt 1',
    percentage: 30.0,
    plannedAmount: 60000000,
    plannedDate: '2026-09-08',
    dueDate: '2026-09-15',
    invoicedAmount: 60000000,
    actualReceivedAmount: 40000000,
    actualReceiptDate: '2026-09-12 09:45',
    actualCostSpent: 42000000,
    actualCostRemaining: 18000000,
    reconciliationStatus: 'Synced',
    poNumber: 'PO-UNI-2026-452B',
    acceptanceDoc: 'BB-NT-POSM-Phase1',
    vatInvoiceNo: 'HDGTGT-0019310',
    notes: 'Khách hàng chuyển đợt 1 của đợt 2 là 40tr; còn 20tr đang đối soát chứng từ bổ sung.',
  },
  {
    id: 'term-3',
    termCode: 'TERM-03',
    termName: 'Đợt 3: Quyết toán 30% còn lại sau biên bản nghiệm thu tổng kết',
    percentage: 30.0,
    plannedAmount: 60000000,
    plannedDate: '2026-09-20',
    dueDate: '2026-09-30',
    invoicedAmount: 0,
    actualReceivedAmount: 0,
    actualCostSpent: 10000000,
    actualCostRemaining: 50000000,
    reconciliationStatus: 'Pending_Invoice',
    poNumber: 'PO-UNI-2026-452C',
    acceptanceDoc: 'Đang tổng hợp hình ảnh & biên bản ký giao nhận',
    vatInvoiceNo: '',
    notes: 'Dự kiến xuất hóa đơn sau khi hoàn tất kiểm đếm POSM tại hệ thống siêu thị.',
  },
];

export const INITIAL_PROGRESS_LOGS: ProgressLog[] = [
  {
    id: 'prog-1',
    date: '2026-09-05',
    status: 'Đã hoàn tất sản xuất POSM đợt 1 và phân bổ về 120 điểm bán',
    nextStep: 'Kiểm tra chất lượng trưng bày và chụp hình nghiệm thu',
    byStaff: 'Lê Hải Minh',
    tagType: 'success',
  },
  {
    id: 'prog-2',
    date: '2026-08-30',
    status: 'Khách hàng đã ký duyệt mẫu proofing và phê duyệt PO',
    nextStep: 'Kích hoạt lệnh in ấn và gia công tại nhà xưởng',
    byStaff: 'Lê Thị Mỹ Duyên',
    tagType: 'info',
  },
  {
    id: 'prog-3',
    date: '2026-08-27',
    status: 'Khởi tạo Job trên JMS và đối soát kế hoạch ngân sách ban đầu',
    nextStep: 'Họp Kick-off nội bộ với đội ngũ sản xuất và Account',
    byStaff: 'Nguyễn Ngọc Nghi',
    tagType: 'info',
  },
];

export const CLIENT_LIST = [
  { code: 'CLI-UNIL-01', name: 'Unilever Việt Nam', brands: ['Close Up', 'OMO Matic', 'Lifebuoy', 'Sunsilk', 'Clear', 'Knorr'] },
  { code: 'CLI-SAM-02', name: 'Samsung Electronics Vina', brands: ['Galaxy Experience', 'Samsung Display & AI', 'Bespoke Home'] },
  { code: 'CLI-SHO-03', name: 'Shopee Việt Nam', brands: ['Shopee Live & Mall', 'ShopeePay', 'Shopee Food'] },
  { code: 'CLI-NES-04', name: 'Nestle Việt Nam', brands: ['Milo', 'Nescafe', 'Maggi', 'Nan Optipro'] },
  { code: 'CLI-ABB-05', name: 'Abbott Laboratories', brands: ['Similac', 'Ensure Gold', 'Glucerna', 'Pediasure'] },
  { code: 'CLI-MON-06', name: 'Mondelez Kinh Đô', brands: ['Kinh Đô Bakery', 'Oreo', 'Cosy', 'Solite'] },
];

export const CATEGORIES_LIST = [
  'Events & Activations',
  'POSM Production',
  'Retail Experience',
  'Digital Marketing & Social',
  'Creative & Brand Strategy',
  'Media Planning & Booking',
  'Sponsorship & KOLs Booking',
];

export const INDUSTRIES_LIST = [
  'FMCG - Personal Care',
  'FMCG - Home Care',
  'FMCG - Food & Beverage',
  'Consumer Technology',
  'E-commerce & Tech',
  'Banking & Financial Services',
  'Healthcare & Pharma',
];

export const ALL_STAFF_MEMBERS = [
  { name: 'Lê Thị Mỹ Duyên', email: 'duyen.le@arito.vn', role: 'Project Leader', department: 'Account', avatar: 'D' },
  { name: 'Lê Hải Minh', email: 'minh.le@arito.vn', role: 'Senior Account Executive', department: 'Account', avatar: 'M' },
  { name: 'Nguyễn Ngọc Nghi', email: 'nghi.nguyen@arito.vn', role: 'Account Director', department: 'Account', avatar: 'N' },
  { name: 'Trần Kim Ngân', email: 'ngan.tran@arito.vn', role: 'Project Director', department: 'Account', avatar: 'N' },
  { name: 'Nguyễn Thị Phương Thảo', email: 'thao.nguyen@arito.vn', role: 'Executive Producer', department: 'Events', avatar: 'T' },
  { name: 'Bùi Gia Huy', email: 'huy.bui@arito.vn', role: 'Production Lead', department: 'Production', avatar: 'H' },
  { name: 'Đặng Quốc Huy', email: 'huy.dang@arito.vn', role: 'Production Manager', department: 'Production', avatar: 'H' },
  { name: 'Trần Văn Tùng', email: 'tung.tran@arito.vn', role: 'Account Manager', department: 'Account', avatar: 'T' },
  { name: 'Võ Thị Bích Thủy', email: 'thuy.vo@arito.vn', role: 'Finance Specialist', department: 'Finance - Arito', avatar: 'T' },
];

// Dữ liệu Forecast 24 tháng và Phân bổ chi phí tự động (Allocate Auto)
export const SALES_FORECAST_DATA = [
  { month: 'T01/25', actual: 9.8, forecast: 9.5, allocateAuto: 7.2, target: 8.5 },
  { month: 'T02/25', actual: 7.5, forecast: 7.8, allocateAuto: 6.0, target: 7.0 },
  { month: 'T03/25', actual: 11.2, forecast: 10.5, allocateAuto: 8.1, target: 9.5 },
  { month: 'T04/25', actual: 12.4, forecast: 11.8, allocateAuto: 8.9, target: 10.0 },
  { month: 'T05/25', actual: 13.1, forecast: 12.5, allocateAuto: 9.2, target: 11.0 },
  { month: 'T06/25', actual: 14.5, forecast: 13.9, allocateAuto: 10.1, target: 12.0 },
  { month: 'T07/25', actual: 12.8, forecast: 13.0, allocateAuto: 9.3, target: 11.5 },
  { month: 'T08/25', actual: 15.2, forecast: 14.8, allocateAuto: 10.6, target: 13.0 },
  { month: 'T09/25', actual: 16.8, forecast: 15.9, allocateAuto: 11.5, target: 14.0 },
  { month: 'T10/25', actual: 17.5, forecast: 16.5, allocateAuto: 12.1, target: 15.0 },
  { month: 'T11/25', actual: 19.4, forecast: 18.2, allocateAuto: 13.4, target: 16.5 },
  { month: 'T12/25', actual: 22.1, forecast: 20.5, allocateAuto: 15.2, target: 18.0 },
  // 2026
  { month: 'T01/26', actual: 10.5, forecast: 11.2, allocateAuto: 8.0, target: 10.0 },
  { month: 'T02/26', actual: 8.9, forecast: 9.5, allocateAuto: 6.8, target: 8.5 },
  { month: 'T03/26', actual: 13.6, forecast: 13.0, allocateAuto: 9.5, target: 11.5 },
  { month: 'T04/26', actual: 14.8, forecast: 14.2, allocateAuto: 10.4, target: 12.5 },
  { month: 'T05/26', actual: 15.5, forecast: 15.0, allocateAuto: 10.9, target: 13.0 },
  { month: 'T06/26', actual: 17.2, forecast: 16.8, allocateAuto: 12.0, target: 14.5 },
  { month: 'T07/26', actual: 16.4, forecast: 16.0, allocateAuto: 11.5, target: 14.0 },
  { month: 'T08/26', actual: 18.9, forecast: 18.2, allocateAuto: 13.1, target: 15.5 },
  { month: 'T09/26', actual: 0, forecast: 19.8, allocateAuto: 13.9, target: 17.0 },
  { month: 'T10/26', actual: 0, forecast: 21.5, allocateAuto: 15.0, target: 18.5 },
  { month: 'T11/26', actual: 0, forecast: 24.2, allocateAuto: 16.8, target: 20.0 },
  { month: 'T12/26', actual: 0, forecast: 27.0, allocateAuto: 18.5, target: 22.0 },
];

export const TEAM_PERFORMANCE_DATA = [
  { team: 'Team Nghi', wonJobs: 28, runningJobs: 14, biddingJobs: 6, failedJobs: 4, revenue: 42.5, gpAvg: 31.8, winRate: 75.6 },
  { team: 'Team Ngân', wonJobs: 24, runningJobs: 11, biddingJobs: 8, failedJobs: 5, revenue: 38.2, gpAvg: 32.4, winRate: 72.7 },
  { team: 'Team Thảo', wonJobs: 19, runningJobs: 9, biddingJobs: 5, failedJobs: 3, revenue: 35.6, gpAvg: 34.1, winRate: 79.1 },
  { team: 'Team Huy', wonJobs: 15, runningJobs: 8, biddingJobs: 4, failedJobs: 2, revenue: 26.8, gpAvg: 29.5, winRate: 78.9 },
];

export function getMonthlyRevenueAllocations(job: JobItem): MonthlyRevenueAllocation[] {
  if (job.monthlyAllocations && job.monthlyAllocations.length > 0) {
    return job.monthlyAllocations;
  }

  const total = job.allocatedBilling > 0 ? job.allocatedBilling : job.potentialBudget;
  if (!total || total <= 0) {
    return [
      {
        monthIndex: 1,
        monthLabel: 'Month 01',
        period: job.startDate ? job.startDate.substring(0, 7) : '01/2026',
        amount: 0,
        percentage: 100,
        status: 'Planned',
        note: 'Revenue allocation not established yet'
      }
    ];
  }

  const start = new Date(job.startDate || '2026-08-01');
  const end = new Date(job.endDate || '2026-10-31');
  let diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  if (isNaN(diffMonths) || diffMonths < 1) diffMonths = 3;
  if (diffMonths > 12) diffMonths = 12;

  // If 3 months: typical agency model 25% - 25% - 50%
  if (diffMonths === 3) {
    const p1 = Math.round(total * 0.25);
    const p2 = Math.round(total * 0.25);
    const p3 = total - p1 - p2;
    const m1 = new Date(start.getFullYear(), start.getMonth(), 1);
    const m2 = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const m3 = new Date(start.getFullYear(), start.getMonth() + 2, 1);
    return [
      {
        monthIndex: 1,
        monthLabel: 'Month 01',
        period: `${String(m1.getMonth() + 1).padStart(2, '0')}/${m1.getFullYear()}`,
        amount: p1,
        percentage: 25,
        status: 'Completed',
        note: 'Phase 1: Kickoff & POSM procurement'
      },
      {
        monthIndex: 2,
        monthLabel: 'Month 02',
        period: `${String(m2.getMonth() + 1).padStart(2, '0')}/${m2.getFullYear()}`,
        amount: p2,
        percentage: 25,
        status: 'Current',
        note: 'Phase 2: Supermarket rollout & installation'
      },
      {
        monthIndex: 3,
        monthLabel: 'Month 03',
        period: `${String(m3.getMonth() + 1).padStart(2, '0')}/${m3.getFullYear()}`,
        amount: p3,
        percentage: 50,
        status: 'Planned',
        note: 'Phase 3: Final acceptance & settlement'
      }
    ];
  }

  const baseAmount = Math.floor(total / diffMonths);
  const result: MonthlyRevenueAllocation[] = [];
  let accumulated = 0;

  for (let i = 0; i < diffMonths; i++) {
    const isLast = i === diffMonths - 1;
    const amount = isLast ? (total - accumulated) : baseAmount;
    accumulated += amount;
    const mDate = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const period = `${String(mDate.getMonth() + 1).padStart(2, '0')}/${mDate.getFullYear()}`;
    const pct = Math.round((amount / total) * 100);

    result.push({
      monthIndex: i + 1,
      monthLabel: `Month ${String(i + 1).padStart(2, '0')}`,
      period,
      amount,
      percentage: pct,
      status: i === 0 ? 'Completed' : (i === 1 ? 'Current' : 'Planned'),
      note: `Phase ${i + 1}: Periodic allocation period ${i + 1}`
    });
  }

  return result;
}

export function getJobMembers(job: JobItem): ProjectMember[] {
  if (job.id === 'job-1') {
    return INITIAL_JOB_DETAIL_MEMBERS;
  }
  const result: ProjectMember[] = [];
  if (job.projectLeader) {
    result.push({
      id: `mem-lead-${job.id}`,
      name: job.projectLeader.name,
      email: `${job.projectLeader.name.toLowerCase().replace(/[\s\u00C0-\u024F\u1E00-\u1EFF]+/g, '.')}@arito.vn`,
      avatar: job.projectLeader.avatar || 'L',
      department: 'Account Department',
      role: job.projectLeader.role || 'Project Leader',
      bonusPercent: 35.0,
      assignedBudget: Math.round(job.potentialBudget * 0.35),
      kpiCompletion: 92,
      csatScore: 4.8
    });
  }
  if (job.accountLead && job.accountLead.name !== job.projectLeader?.name) {
    result.push({
      id: `mem-acc-${job.id}`,
      name: job.accountLead.name,
      email: `${job.accountLead.name.toLowerCase().replace(/[\s\u00C0-\u024F\u1E00-\u1EFF]+/g, '.')}@arito.vn`,
      avatar: job.accountLead.avatar || 'A',
      department: 'Account Management',
      role: 'Account Director',
      bonusPercent: 25.0,
      assignedBudget: Math.round(job.potentialBudget * 0.25),
      kpiCompletion: 95,
      csatScore: 4.9
    });
  }
  job.assistants?.forEach((ast, idx) => {
    result.push({
      id: `mem-ast-${job.id}-${idx}`,
      name: ast.name,
      email: `${ast.name.toLowerCase().replace(/[\s\u00C0-\u024F\u1E00-\u1EFF]+/g, '.')}@arito.vn`,
      avatar: ast.avatar || 'M',
      department: 'Operations',
      role: 'Project Executive',
      bonusPercent: 20.0,
      assignedBudget: Math.round(job.potentialBudget * 0.20),
      kpiCompletion: 88,
      csatScore: 4.7
    });
  });

  if (result.length === 0) {
    return INITIAL_JOB_DETAIL_MEMBERS;
  }
  return result;
}

export function getJobPaymentTerms(job: JobItem): PaymentTerm[] {
  if (job.id === 'job-1') {
    return INITIAL_PAYMENT_TERMS;
  }
  const budget = job.potentialBudget;
  return [
    {
      id: `term-1-${job.id}`,
      termCode: 'TERM-01',
      termName: 'Đợt 1: Tạm ứng 40% ngay sau khi ký hợp đồng & phát hành PO',
      percentage: 40.0,
      plannedAmount: Math.round(budget * 0.4),
      plannedDate: job.startDate,
      dueDate: job.startDate,
      invoicedAmount: job.invoicedBilling >= Math.round(budget * 0.4) ? Math.round(budget * 0.4) : job.invoicedBilling,
      actualReceivedAmount: job.actualReceived >= Math.round(budget * 0.4) ? Math.round(budget * 0.4) : job.actualReceived,
      actualCostSpent: Math.round(budget * 0.25),
      actualCostRemaining: Math.round(budget * 0.15),
      reconciliationStatus: job.status === 'Done' ? 'Synced' : (job.actualReceived > 0 ? 'Synced' : 'Draft'),
      poNumber: `PO-${job.clientCode}-${job.jobCode.slice(-3)}A`,
      acceptanceDoc: `BBTN-${job.jobCode}-01`,
      vatInvoiceNo: `HDGTGT-${job.jobCode.slice(-4)}`,
      notes: 'Đã đối soát ghi nhận theo hợp đồng và khớp với tài khoản Arito.',
    },
    {
      id: `term-2-${job.id}`,
      termCode: 'TERM-02',
      termName: 'Đợt 2: Thanh toán 40% sau khi hoàn tất giai đoạn triển khai chính',
      percentage: 40.0,
      plannedAmount: Math.round(budget * 0.4),
      plannedDate: job.kickoffDate || job.startDate,
      dueDate: job.endDate,
      invoicedAmount: Math.max(0, Math.min(Math.round(budget * 0.4), job.invoicedBilling - Math.round(budget * 0.4))),
      actualReceivedAmount: Math.max(0, Math.min(Math.round(budget * 0.4), job.actualReceived - Math.round(budget * 0.4))),
      actualCostSpent: Math.round(budget * 0.25),
      actualCostRemaining: Math.round(budget * 0.15),
      reconciliationStatus: job.status === 'Done' ? 'Synced' : 'Pending',
      poNumber: `PO-${job.clientCode}-${job.jobCode.slice(-3)}B`,
      notes: 'Kế hoạch giải ngân theo tiến độ xác nhận từ ban dự án.',
    },
    {
      id: `term-3-${job.id}`,
      termCode: 'TERM-03',
      termName: 'Đợt 3: Thanh toán 20% còn lại sau khi ký biên bản nghiệm thu & thanh lý',
      percentage: 20.0,
      plannedAmount: Math.round(budget * 0.2),
      plannedDate: job.endDate,
      dueDate: job.endDate,
      invoicedAmount: job.status === 'Done' ? Math.round(budget * 0.2) : 0,
      actualReceivedAmount: job.status === 'Done' ? Math.round(budget * 0.2) : 0,
      actualCostSpent: Math.round(budget * 0.15),
      actualCostRemaining: Math.round(budget * 0.05),
      reconciliationStatus: job.status === 'Done' ? 'Synced' : 'Draft',
      notes: 'Đợt quyết toán cuối kỳ.',
    }
  ];
}

export function getJobProgressLogs(job: JobItem): ProgressLog[] {
  if (job.id === 'job-1') {
    return INITIAL_PROGRESS_LOGS;
  }
  return [
    {
      id: `prog-1-${job.id}`,
      date: job.kickoffDate || job.startDate,
      status: `Khởi động dự án ${job.jobName} cùng khách hàng ${job.client}. Xác lập mục tiêu ban đầu.`,
      nextStep: 'Kiểm tra tiến độ mua hàng và vật tư hiện trường.',
      byStaff: job.projectLeader?.name || 'Lê Thị Mỹ Duyên',
      tagType: 'success'
    },
    {
      id: `prog-2-${job.id}`,
      date: job.startDate,
      status: `Ký kết phụ lục triển khai và cập nhật danh mục hạng mục dịch vụ cho ${job.brand}.`,
      nextStep: 'Theo dõi nghiệm thu và giải ngân các đợt thanh toán.',
      byStaff: job.accountLead?.name || 'Trần Minh Quang',
      tagType: 'info'
    }
  ];
}
