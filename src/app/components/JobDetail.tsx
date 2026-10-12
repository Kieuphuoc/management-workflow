'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, ArrowDown, Lock, Unlock, Calendar, CheckCircle2, 
  Plus, FileText, Users, DollarSign, Building2, 
  RefreshCw, Download, Trash2, 
  Sparkles, Coins, ChevronDown, Loader2,
  TrendingUp, Package, GanttChart
} from 'lucide-react';
import { 
  JobItem, ProjectMember, PaymentTerm, ProgressLog, 
  ALL_STAFF_MEMBERS,
  getMonthlyRevenueAllocations, getJobMembers, getJobPaymentTerms, getJobProgressLogs
} from '../data/mockJmsData';
import CustomSelect, { CustomSelectOption } from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';
import { ClientLogo, BrandLogo } from './BrandLogos';
import JobDetailPnl from './JobDetailPnl';
import JobDetailStock from './JobDetailStock';
import JobDetailTasks from './JobDetailTasks';

const STAFF_OPTIONS: CustomSelectOption[] = ALL_STAFF_MEMBERS.map(s => ({
  value: s.name,
  label: s.name,
  sublabel: `${s.role} (${s.department})`,
}));

const DEPT_OPTIONS: CustomSelectOption[] = [
  { value: 'Account Department', label: 'Account Department' },
  { value: 'Events & Activation', label: 'Events & Activation' },
  { value: 'Production & Logistics', label: 'Production & Logistics' },
  { value: 'Creative Studio', label: 'Creative Studio' },
];

const ALL_TAB_KEYS = ['general', 'client', 'payments', 'pnl', 'members', 'tasks', 'stock'] as const;
type TabKey = typeof ALL_TAB_KEYS[number];

interface SingleJobDetailCardProps {
  job: JobItem;
  jobIndex: number;
  totalJobs: number;
  isFirst: boolean;
  onBack: () => void;
  onUpdateJob?: (updatedJob: JobItem) => void;
}

function SingleJobDetailCard({
  job,
  jobIndex,
  totalJobs,
  isFirst,
  onBack,
  onUpdateJob,
}: SingleJobDetailCardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [tabDirection, setTabDirection] = useState<'left' | 'right'>('right');
  const [members, setMembers] = useState<ProjectMember[]>(() => getJobMembers(job));
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>(() => getJobPaymentTerms(job));
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>(() => getJobProgressLogs(job));

  const handleTabChange = (newTab: TabKey) => {
    if (newTab === activeTab) return;
    const currentIdx = ALL_TAB_KEYS.indexOf(activeTab);
    const newIdx = ALL_TAB_KEYS.indexOf(newTab);
    setTabDirection(newIdx > currentIdx ? 'right' : 'left');
    setActiveTab(newTab);
  };

  // Sync state
  const [isSyncingArito, setIsSyncingArito] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false);

  // New Member Form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Senior Account Executive');
  const [newMemberDept, setNewMemberDept] = useState('Account Department');
  const [newMemberBonus, setNewMemberBonus] = useState(15);

  // New Payment Form state
  const [newTermName, setNewTermName] = useState('');
  const [newTermPercent, setNewTermPercent] = useState(20);
  const [newTermPlannedDate, setNewTermPlannedDate] = useState('');
  const [newTermDueDate, setNewTermDueDate] = useState('');
  const [newTermPo, setNewTermPo] = useState('');
  const [newTermAcceptance, setNewTermAcceptance] = useState('');
  const [newTermCostSpent, setNewTermCostSpent] = useState(0);

  // New Progress Log Form state
  const [newProgressStatus, setNewProgressStatus] = useState('');
  const [newProgressNextStep, setNewProgressNextStep] = useState('');
  const [isRevenueBreakdownOpen, setIsRevenueBreakdownOpen] = useState(false);

  const monthlyRevenueList = getMonthlyRevenueAllocations(job);

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' ₫';
  };

  // Calculations
  const totalPlannedPayment = paymentTerms.reduce((sum, item) => sum + item.plannedAmount, 0);
  const totalPaymentPercent = paymentTerms.reduce((sum, item) => sum + item.percentage, 0);
  const totalInvoiced = paymentTerms.reduce((sum, item) => sum + item.invoicedAmount, 0);
  const totalActualReceived = paymentTerms.reduce((sum, item) => sum + item.actualReceivedAmount, 0);
  const totalCostSpent = paymentTerms.reduce((sum, item) => sum + item.actualCostSpent, 0);
  const totalCostRemaining = paymentTerms.reduce((sum, item) => sum + item.actualCostRemaining, 0);

  // Handlers
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName) return;
    const staff = ALL_STAFF_MEMBERS.find(s => s.name === newMemberName) || {
      name: newMemberName,
      email: `${newMemberName.toLowerCase().replace(/[\s\u00C0-\u024F\u1E00-\u1EFF]+/g, '.')}@arito.vn`,
      role: newMemberRole,
      department: newMemberDept,
      avatar: newMemberName[0]?.toUpperCase() || 'U'
    };
    const newMem: ProjectMember = {
      id: `mem-${Date.now()}`,
      name: staff.name,
      email: staff.email,
      avatar: staff.avatar,
      department: newMemberDept,
      role: newMemberRole,
      bonusPercent: newMemberBonus,
      assignedBudget: Math.round((job.potentialBudget * newMemberBonus) / 100),
      kpiCompletion: 90,
      csatScore: 4.8
    };
    setMembers([...members, newMem]);
    setIsAddMemberOpen(false);
    setNewMemberName('');
    setNewMemberBonus(15);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermName || newTermPercent <= 0) return;
    const plannedAmt = Math.round((job.potentialBudget * newTermPercent) / 100);
    const spentAmt = Number(newTermCostSpent) || 0;
    const newTerm: PaymentTerm = {
      id: `term-${Date.now()}`,
      termCode: `TERM-0${paymentTerms.length + 1}`,
      termName: newTermName,
      percentage: newTermPercent,
      plannedAmount: plannedAmt,
      plannedDate: newTermPlannedDate || job.startDate,
      dueDate: newTermDueDate || job.endDate,
      invoicedAmount: 0,
      actualReceivedAmount: 0,
      actualCostSpent: spentAmt,
      actualCostRemaining: Math.max(0, plannedAmt - spentAmt),
      reconciliationStatus: 'Draft',
      poNumber: newTermPo || `PO-${job.clientCode}-${paymentTerms.length + 1}`,
      acceptanceDoc: newTermAcceptance || `BBTN-${job.jobCode}-${paymentTerms.length + 1}`,
      notes: 'Tạo mới từ bảng điều khiển tiến độ thanh toán'
    };

    setPaymentTerms([...paymentTerms, newTerm]);
    setIsAddPaymentOpen(false);
    setNewTermName('');
    setNewTermPercent(20);
    setNewTermPlannedDate('');
    setNewTermDueDate('');
    setNewTermPo('');
    setNewTermAcceptance('');
    setNewTermCostSpent(0);
  };

  const handleAddProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgressStatus) return;
    const newLog: ProgressLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: newProgressStatus,
      nextStep: newProgressNextStep || 'Follow up on delivery',
      byStaff: job.projectLeader?.name || 'Lê Hải Minh',
      tagType: 'info'
    };
    setProgressLogs([newLog, ...progressLogs]);
    setIsAddProgressOpen(false);
    setNewProgressStatus('');
    setNewProgressNextStep('');
  };

  const handleSyncArito = () => {
    setIsSyncingArito(true);
    setTimeout(() => {
      setIsSyncingArito(false);
      setSyncSuccessMessage(`Đã đồng bộ 2 chiều thành công với Arito ERP cho dự án ${job.jobCode}!`);
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* ==================== TRANSITION DIVIDER FOR SUBSEQUENT JOBS ==================== */}
      {!isFirst && (
        <div className="pt-6 pb-2 flex items-center justify-center">
          <div className="w-full flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-blue-300"></div>
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-sm">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Dự án ({jobIndex + 1}/{totalJobs})</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-blue-200 to-blue-300"></div>
          </div>
        </div>
      )}

      {/* ==================== HEADER (7 CORE FIELDS) ==================== */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm transition-all overflow-hidden">
        {/* Sync alert banner if synced */}
        {syncSuccessMessage && (
          <div className="px-6 py-2.5 bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2 border-b border-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncSuccessMessage}</span>
          </div>
        )}

        {/* The 7 Core Fields Header */}
        <div className="px-6 py-4 space-y-4">
          {/* Row 1: 1. Mã dự án (Job Code), 2. Tên dự án (Job Name), Status, and Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[200px]">
              {/* 1. Mã dự án */}
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1 rounded-lg border border-blue-200 shrink-0">
                {job.isLocked ? (
                  <span title="Dữ liệu đã ghi sổ và khóa trong Kế toán Arito">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                  </span>
                ) : (
                  <span title="Mã dự án chưa khóa sổ - Có thể chỉnh sửa">
                    <Unlock className="w-3.5 h-3.5 text-blue-400" />
                  </span>
                )}
                <span className="font-extrabold text-sm font-mono tracking-wide">{job.jobCode}</span>
              </div>

              {/* 2. Tên dự án */}
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {job.jobName}
              </h1>

              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                job.status === 'Running' ? 'bg-blue-100 text-blue-800' :
                job.status === 'Done' ? 'bg-emerald-100 text-emerald-800' :
                job.status === 'Bidding' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {job.status === 'Running' ? 'Đang thực hiện' : job.status === 'Done' ? 'Đã hoàn thành' : job.status === 'Bidding' ? 'Đấu thầu' : job.status}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSyncArito}
                disabled={isSyncingArito}
                title="Đồng bộ 2 chiều với ERP Arito"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-full transition-all active:scale-95 shadow-2xs cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingArito ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
                <span>{isSyncingArito ? 'Đang đồng bộ...' : 'Đồng bộ Arito'}</span>
              </button>

              <button
                type="button"
                onClick={() => alert(`Xuất báo cáo dự án ${job.jobCode} ra file Excel / PDF`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-full transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Xuất báo cáo</span>
              </button>
            </div>
          </div>

          {/* Row 2: 5 Core Fields Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
            {/* 3. Client */}
            <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Khách Hàng
              </span>
              <div className="flex items-center gap-2">
                <ClientLogo client={job.client} className="w-8 h-8" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block truncate" title={job.client}>
                    {job.client}
                  </span>
                  <span className="text-[11px] font-mono text-blue-600 font-semibold block truncate">
                    {job.clientCode || 'CLI-UNIL-01'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Contract Client */}
            <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Pháp Nhân Hợp Đồng
              </span>
              <span className="text-xs font-bold text-slate-900 block truncate" title={job.contractClient || job.client}>
                {job.contractClient || job.client}
              </span>
              <span className="text-[11px] text-slate-500 block truncate font-mono">
                {job.contractCode || 'Hợp đồng nguyên tắc'}
              </span>
            </div>

            {/* 5. Category / Job Type */}
            <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Hạng Mục / Loại Hình
              </span>
              <span className="text-xs font-bold text-slate-900 block truncate" title={job.category}>
                {job.category}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                {job.jobType || 'Sản xuất'}
              </span>
            </div>

            {/* 6. Brand */}
            <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Nhãn Hàng (Brand)
              </span>
              <div className="flex items-center gap-2">
                <BrandLogo brand={job.brand} className="w-8 h-8" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block truncate" title={job.brand}>
                    {job.brand}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Đội ngũ: {job.team}
                  </span>
                </div>
              </div>
            </div>

            {/* 7. Potential Budget */}
            <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block mb-0.5">
                Ngân Sách Tiềm Năng
              </span>
              <span className="text-sm font-extrabold text-blue-900 block truncate">
                {formatVND(job.potentialBudget)}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 block truncate">
                Mục tiêu GP: {job.grossProfitPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Tier 3: Tabs Navigation Bar - Gom nhóm tính năng theo nghiệp vụ ERP */}
        <div className="border-t border-slate-200/80 bg-slate-50/70 p-2.5 sm:p-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
            {/* NHÓM 1: HỒ SƠ & HỢP ĐỒNG */}
            <div
              className={`rounded-2xl p-2 transition-all duration-200 border ${
                activeTab === 'general' || activeTab === 'client'
                  ? 'bg-white border-blue-300 shadow-xs ring-2 ring-blue-500/10'
                  : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between px-1.5 pb-1.5 mb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeTab === 'general' || activeTab === 'client'
                        ? 'bg-blue-600 animate-pulse'
                        : 'bg-slate-300'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      activeTab === 'general' || activeTab === 'client'
                        ? 'text-blue-900'
                        : 'text-slate-500'
                    }`}
                  >
                    📁 Nhóm 1: Hồ sơ & Hợp đồng
                  </span>
                </div>
                <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                  2 tính năng
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Tab: Thông tin chung */}
                <button
                  type="button"
                  onClick={() => handleTabChange('general')}
                  className={`flex-1 min-w-0 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'general'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/60'
                  }`}
                  title="Thông tin chung dự án"
                >
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'general' ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">Thông tin chung</span>
                </button>

                {/* Tab: Khách hàng & HĐ */}
                <button
                  type="button"
                  onClick={() => handleTabChange('client')}
                  className={`flex-1 min-w-0 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'client'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/60'
                  }`}
                  title="Thông tin khách hàng & Hợp đồng"
                >
                  <Building2 className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'client' ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">Khách hàng & HĐ</span>
                </button>
              </div>
            </div>

            {/* NHÓM 2: TÀI CHÍNH & ARITO ERP */}
            <div
              className={`rounded-2xl p-2 transition-all duration-200 border ${
                activeTab === 'payments' || activeTab === 'pnl'
                  ? 'bg-white border-emerald-300 shadow-xs ring-2 ring-emerald-500/10'
                  : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between px-1.5 pb-1.5 mb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeTab === 'payments' || activeTab === 'pnl'
                        ? 'bg-emerald-600 animate-pulse'
                        : 'bg-slate-300'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      activeTab === 'payments' || activeTab === 'pnl'
                        ? 'text-emerald-900'
                        : 'text-slate-500'
                    }`}
                  >
                    💰 Nhóm 2: Tài chính & Arito ERP
                  </span>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  2 tính năng
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Tab: Kỳ thanh toán */}
                <button
                  type="button"
                  onClick={() => handleTabChange('payments')}
                  className={`flex-1 min-w-0 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'payments'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                  }`}
                  title="Kỳ thanh toán & Tài chính"
                >
                  <DollarSign className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'payments' ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">Kỳ thanh toán</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-black shrink-0 ${
                      activeTab === 'payments' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {paymentTerms.length}
                  </span>
                </button>

                {/* Tab: Báo cáo Lãi/Lỗ */}
                <button
                  type="button"
                  onClick={() => handleTabChange('pnl')}
                  className={`flex-1 min-w-0 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'pnl'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                  }`}
                  title="Báo cáo Lãi/Lỗ (P&L)"
                >
                  <TrendingUp className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'pnl' ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">Báo cáo P&L</span>
                </button>
              </div>
            </div>

            {/* NHÓM 3: THỰC THI & VẬN HÀNH */}
            <div
              className={`rounded-2xl p-2 transition-all duration-200 border ${
                activeTab === 'members' || activeTab === 'tasks' || activeTab === 'stock'
                  ? 'bg-white border-indigo-300 shadow-xs ring-2 ring-indigo-500/10'
                  : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between px-1.5 pb-1.5 mb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeTab === 'members' || activeTab === 'tasks' || activeTab === 'stock'
                        ? 'bg-indigo-600 animate-pulse'
                        : 'bg-slate-300'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      activeTab === 'members' || activeTab === 'tasks' || activeTab === 'stock'
                        ? 'text-indigo-900'
                        : 'text-slate-500'
                    }`}
                  >
                    🛠️ Nhóm 3: Vận hành & Thực thi
                  </span>
                </div>
                <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                  3 tính năng
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Tab: Nhân sự */}
                <button
                  type="button"
                  onClick={() => handleTabChange('members')}
                  className={`flex-1 min-w-0 py-2 px-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'members'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/60'
                  }`}
                  title="Nhân sự dự án & Thưởng"
                >
                  <Users className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'members' ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">Nhân sự</span>
                  <span
                    className={`px-1 py-0.2 rounded-full text-[9px] font-black shrink-0 ${
                      activeTab === 'members' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {members.length}
                  </span>
                </button>

                {/* Tab: Tiến độ & Gantt */}
                <button
                  type="button"
                  onClick={() => handleTabChange('tasks')}
                  className={`flex-1 min-w-0 py-2 px-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'tasks'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/60'
                  }`}
                  title="Quản lý tiến độ & Gantt"
                >
                  <GanttChart className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'tasks' ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">Tiến độ</span>
                  <span
                    className={`px-1 py-0.2 rounded-full text-[9px] font-black shrink-0 ${
                      activeTab === 'tasks' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    5
                  </span>
                </button>

                {/* Tab: Tồn kho POSM */}
                <button
                  type="button"
                  onClick={() => handleTabChange('stock')}
                  className={`flex-1 min-w-0 py-2 px-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'stock'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/60'
                  }`}
                  title="Quản lý tồn kho POSM"
                >
                  <Package className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'stock' ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">Tồn kho</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== TAB 1: GENERAL INFORMATION ==================== */}
      {activeTab === 'general' && (
        <div key="tab-general" className={`space-y-6 ${tabDirection === 'right' ? 'animate-tab-glide-right' : 'animate-tab-glide-left'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. Project Milestones Timeline */}
            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Tiến độ thực hiện</span>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Mốc thời gian dự án</span>
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-blue-50/40 rounded-xl border border-blue-100/60">
                  <span className="text-slate-500 font-medium">Ngày bắt đầu:</span>
                  <span className="font-bold text-slate-800">{job.startDate}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-blue-700 font-medium">Khởi động (Kick-off):</span>
                  <span className="font-bold text-blue-900">{job.kickoffDate}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50/40 rounded-xl border border-blue-100/60">
                  <span className="text-slate-500 font-medium">Ngày kết thúc:</span>
                  <span className="font-bold text-slate-800">{job.endDate}</span>
                </div>
              </div>
            </div>

            {/* 2. Venue & Scope */}
            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Phạm vi công việc</span>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Địa điểm & Phạm vi thực hiện</span>
              </h2>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Địa điểm triển khai:</span>
                  <p className="font-semibold text-slate-800 mt-1">
                    Chuỗi 120 siêu thị Co.opmart, BigC/GO, WinMart tại TP.HCM, Hà Nội và Đà Nẵng.
                  </p>
                </div>

                <div className="pt-2 border-t border-blue-50">
                  <span className="text-slate-400 font-medium block">Phạm vi kế toán/hợp đồng:</span>
                  <p className="text-slate-600 leading-relaxed mt-1">
                    {job.description || 'Mua hàng và gia công bộ nhận diện POSM theo order khách hàng Unilever Việt Nam.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Allocated Revenue & Monthly Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Doanh thu</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {monthlyRevenueList.length} Tháng
                </span>
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Doanh thu phân bổ</span>
              </h2>

              <div className="space-y-3 text-xs">
                {/* Total Allocated Revenue Card */}
                <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Tổng doanh thu phân bổ:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatVND(job.allocatedBilling > 0 ? job.allocatedBilling : job.potentialBudget)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-emerald-100/60">
                    <span>Giai đoạn thực thi:</span>
                    <span className="text-emerald-700 font-semibold">{job.startDate} → {job.endDate}</span>
                  </div>
                </div>

                {/* Interactive Accordion for Monthly Revenue Breakdown */}
                <div className="rounded-xl border border-blue-100/80 overflow-hidden bg-slate-50/40">
                  <button
                    type="button"
                    onClick={() => setIsRevenueBreakdownOpen(!isRevenueBreakdownOpen)}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-blue-50/80 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-800 text-xs">
                        Chi tiết phân bổ theo tháng
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                      <span>{isRevenueBreakdownOpen ? 'Thu gọn' : 'Xem chi tiết'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isRevenueBreakdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className="grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      gridTemplateRows: isRevenueBreakdownOpen ? '1fr' : '0fr',
                      opacity: isRevenueBreakdownOpen ? 1 : 0,
                    }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="px-3 pb-3 pt-1 border-t border-blue-100/60 space-y-2 bg-white">
                        <div className="divide-y divide-slate-100">
                          {monthlyRevenueList.map((m) => (
                            <div key={m.monthIndex} className="py-2 first:pt-1 last:pb-0 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 text-xs">{m.monthLabel}</span>
                                  {m.period && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                      {m.period}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="font-extrabold text-blue-700 text-xs">
                                    {formatVND(m.amount)}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium ml-1">
                                    ({m.percentage}%)
                                  </span>
                                </div>
                              </div>

                              {/* Mini Progress Bar */}
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(m.percentage, 100)}%` }}
                                />
                              </div>

                              {m.note && (
                                <p className="text-[10px] text-slate-400 truncate mt-0.5" title={m.note}>
                                  {m.note}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Summary total */}
                        <div className="pt-2 border-t border-dashed border-slate-200 flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Tổng cộng phân bổ</span>
                          <span className="text-emerald-700 text-xs">
                            {formatVND(monthlyRevenueList.reduce((sum, m) => sum + m.amount, 0))} (100%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Logs Section */}
          <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Tình trạng thực thi</span>
                <h2 className="text-base font-extrabold text-slate-900">Nhật ký tiến độ dự án</h2>
              </div>

              <button
                type="button"
                onClick={() => setIsAddProgressOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cập nhật tiến độ</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-blue-100 rounded-2xl custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-blue-50/70 text-blue-900/80 uppercase font-semibold border-b border-blue-100">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-28">Ngày</th>
                    <th className="py-3 px-4">Hoạt động / Tình trạng</th>
                    <th className="py-3 px-4">Bước tiếp theo</th>
                    <th className="py-3 px-4 w-36">Người cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {progressLogs.map((log, index) => (
                    <tr key={log.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-medium">{index + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{log.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{log.status}</td>
                      <td className="py-3.5 px-4 text-blue-700 font-semibold">{log.nextStep}</td>
                      <td className="py-3.5 px-4 text-slate-600">{log.byStaff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: CLIENT INFORMATION ==================== */}
      {activeTab === 'client' && (
        <div key="tab-client" className={`space-y-6 ${tabDirection === 'right' ? 'animate-tab-glide-right' : 'animate-tab-glide-left'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-5">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Khách hàng & Thương hiệu</span>
              <h2 className="text-base font-extrabold text-slate-900">Hồ sơ tổng quan khách hàng</h2>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-slate-400 text-xs font-medium">Tên khách hàng:</span>
                  <div className="col-span-2 flex items-center gap-2">
                    <ClientLogo client={job.client} className="w-6 h-6" />
                    <span className="font-bold text-slate-900">{job.client}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 text-xs font-medium">Pháp nhân ký kết:</span>
                  <span className="col-span-2 text-slate-700">{job.contractClient}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-slate-400 text-xs font-medium">Thương hiệu:</span>
                  <div className="col-span-2 flex items-center gap-2">
                    <BrandLogo brand={job.brand} className="w-6 h-6" />
                    <span className="font-extrabold text-blue-600">{job.brand}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 text-xs font-medium">Người liên hệ:</span>
                  <div className="col-span-2 space-y-0.5">
                    <p className="font-bold text-slate-800">{job.contactPerson?.name || 'Mr. Nhân Mai (Procurement Manager)'}</p>
                    <p className="text-xs text-slate-500">ĐT: {job.contactPerson?.phone || '0903 123 456'}</p>
                    <p className="text-xs text-slate-500">Email: {job.contactPerson?.email || 'nhan.mai@unilever.com'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-5">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Thông tin pháp lý hợp đồng</span>
              <h2 className="text-base font-extrabold text-slate-900">Mã số thuế & Định danh pháp lý</h2>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 text-xs font-medium">Mã khách hàng:</span>
                  <span className="col-span-2 font-mono font-bold text-blue-800">{job.clientCode}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 text-xs font-medium">Mã số thuế:</span>
                  <span className="col-span-2 font-mono font-semibold text-slate-800">0303123849-001</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 text-xs font-medium">Địa chỉ trụ sở:</span>
                  <span className="col-span-2 text-slate-700">Tòa nhà Unilever, 156 Nguyễn Lương Bằng, P. Tân Phú, Quận 7, TP.HCM</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 text-xs font-medium">Hợp đồng nguyên tắc:</span>
                  <span className="col-span-2 text-blue-700 font-mono font-semibold">{job.contractCode || 'MSA-2025/ULV-SQC-MASTER'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: MEMBERS & BONUS ==================== */}
      {activeTab === 'members' && (
        <div key="tab-members" className={`space-y-6 ${tabDirection === 'right' ? 'animate-tab-glide-right' : 'animate-tab-glide-left'}`}>
          <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Nhân sự thực thi dự án</span>
                <h2 className="text-base font-extrabold text-slate-900">Thành viên dự án & Cơ chế thưởng KPI</h2>
              </div>

              <button
                type="button"
                onClick={() => setIsAddMemberOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm nhân sự</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/70">
                <span className="text-xs text-slate-500 font-medium block">Tổng tỷ lệ thưởng</span>
                <span className="text-lg font-black text-blue-900 mt-1 block">
                  {members.reduce((sum, m) => sum + m.bonusPercent, 0)}%
                </span>
                <span className="text-[11px] text-blue-600 mt-0.5 block font-semibold">
                  Tương đương {formatVND(members.reduce((sum, m) => sum + m.assignedBudget, 0))}
                </span>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/70">
                <span className="text-xs text-slate-500 font-medium block">Mục tiêu KPI trung bình</span>
                <span className="text-lg font-black text-emerald-900 mt-1 block">
                  {Math.round(members.reduce((sum, m) => sum + m.kpiCompletion, 0) / (members.length || 1))}%
                </span>
                <span className="text-[11px] text-emerald-600 mt-0.5 block font-semibold">Đánh giá theo tiến độ hàng tháng</span>
              </div>
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/70">
                <span className="text-xs text-slate-500 font-medium block">Chỉ số CSAT mục tiêu</span>
                <span className="text-lg font-black text-indigo-900 mt-1 block">
                  {(members.reduce((sum, m) => sum + m.csatScore, 0) / (members.length || 1)).toFixed(1)} / 5.0
                </span>
                <span className="text-[11px] text-indigo-600 mt-0.5 block font-semibold">Tiêu chuẩn chất lượng Arito Group</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-blue-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fbfe] text-slate-500 font-bold uppercase text-[11px] border-b border-blue-100">
                  <tr>
                    <th className="py-3 px-4">Tên nhân sự</th>
                    <th className="py-3 px-4">Phòng ban & Vai trò</th>
                    <th className="py-3 px-4 text-center">Tỷ lệ thưởng (%)</th>
                    <th className="py-3 px-4 text-right">Ngân sách phân bổ</th>
                    <th className="py-3 px-4 text-center">Điểm KPI</th>
                    <th className="py-3 px-4 text-center">Đánh giá CSAT</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {members.map((mem) => (
                    <tr key={mem.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {mem.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{mem.name}</p>
                            <p className="text-[10px] text-slate-400">{mem.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{mem.role}</p>
                        <p className="text-[10px] text-slate-500">{mem.department}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[11px]">
                          {mem.bonusPercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatVND(mem.assignedBudget)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          {mem.kpiCompletion}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-700">
                        ⭐ {mem.csatScore}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setMembers(members.filter(m => m.id !== mem.id))}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa nhân sự"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: PAYMENT TERMS & COSTS ==================== */}
      {activeTab === 'payments' && (
        <div key="tab-payments" className={`space-y-6 ${tabDirection === 'right' ? 'animate-tab-glide-right' : 'animate-tab-glide-left'}`}>
          <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Dòng tiền & Đối soát Arito ERP</span>
                <h2 className="text-base font-extrabold text-slate-900">Các đợt nghiệm thu & Chi phí trực tiếp</h2>
              </div>

              <button
                type="button"
                onClick={() => setIsAddPaymentOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm đợt thanh toán</span>
              </button>
            </div>

            {/* Top 5 Financial Summary Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kế hoạch thu</span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{formatVND(totalPlannedPayment)}</span>
                <span className="text-[10px] text-slate-500 font-semibold block">{totalPaymentPercent}% hợp đồng</span>
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/70">
                <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block">Đã xuất HĐ</span>
                <span className="text-base font-extrabold text-indigo-900 mt-0.5 block">{formatVND(totalInvoiced)}</span>
                <span className="text-[10px] text-indigo-600 font-semibold block">Hóa đơn GTGT đã phát hành</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70">
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Thực thu</span>
                <span className="text-base font-extrabold text-emerald-800 mt-0.5 block">{formatVND(totalActualReceived)}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Đã vào tài khoản ngân hàng</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Chi phí đã chi</span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{formatVND(totalCostSpent)}</span>
                <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Còn lại: {formatVND(totalCostRemaining)}</span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Phải thu còn lại</span>
                <span className="text-base font-extrabold text-amber-900 mt-0.5 block">{formatVND(job.potentialBudget - totalActualReceived)}</span>
                <span className="text-[10px] text-amber-700 font-semibold block">Chờ khách hàng thanh toán</span>
              </div>
            </div>

            {/* Milestones Table */}
            <div className="overflow-x-auto rounded-xl border border-blue-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fbfe] text-slate-500 font-bold uppercase text-[11px] border-b border-blue-100">
                  <tr>
                    <th className="py-3 px-4">Đợt thanh toán</th>
                    <th className="py-3 px-4 text-center">Tỷ lệ (%)</th>
                    <th className="py-3 px-4 text-right">Số tiền kế hoạch</th>
                    <th className="py-3 px-4 text-center">Ngày dự kiến</th>
                    <th className="py-3 px-4 text-center">Hạn thanh toán</th>
                    <th className="py-3 px-4 text-right">Đã xuất HĐ / Đã thu</th>
                    <th className="py-3 px-4 text-right">Chi phí đã chi / Còn lại</th>
                    <th className="py-3 px-4 text-center">Trạng thái Arito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {paymentTerms.map((term) => (
                    <tr key={term.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-900">{term.termName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            {term.poNumber && <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">PO: {term.poNumber}</span>}
                            {term.acceptanceDoc && <span>BB: {term.acceptanceDoc}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[11px]">
                          {term.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatVND(term.plannedAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 font-mono text-[11px]">
                        {term.plannedDate}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 font-mono text-[11px]">
                        {term.dueDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <p className="font-extrabold text-indigo-700">{formatVND(term.invoicedAmount)}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">Thu: {formatVND(term.actualReceivedAmount)}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right text-[11px]">
                        <span className="font-bold text-slate-900">{formatVND(term.actualCostSpent)}</span>
                        <span className="text-slate-500 font-semibold block">{formatVND(term.actualCostRemaining)}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          term.reconciliationStatus === 'Synced'
                            ? 'bg-emerald-100 text-emerald-800'
                            : term.reconciliationStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {term.reconciliationStatus === 'Synced' ? 'Đã đồng bộ' : term.reconciliationStatus === 'Pending' ? 'Chờ đối soát' : term.reconciliationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: P&L (PROFIT & LOSS) ==================== */}
      {activeTab === 'pnl' && (
        <div key="tab-pnl" className={`${tabDirection === 'right' ? 'animate-tab-glide-right' : 'animate-tab-glide-left'}`}>
          <JobDetailPnl 
            job={job} 
            formatVND={formatVND} 
            onSyncArito={handleSyncArito} 
            isSyncing={isSyncingArito} 
          />
        </div>
      )}

      {/* ==================== TAB 6: STOCK SUMMARY ==================== */}
      {activeTab === 'stock' && (
        <div key="tab-stock" className={`${tabDirection === 'right' ? 'animate-tab-glide-right' : 'animate-tab-glide-left'}`}>
          <JobDetailStock 
            job={job} 
            formatVND={formatVND} 
          />
        </div>
      )}

      {/* ==================== TAB 7: TASK MANAGEMENT & GANTT ==================== */}
      {activeTab === 'tasks' && (
        <div key="tab-tasks" className={`${tabDirection === 'right' ? 'animate-tab-glide-right' : 'animate-tab-glide-left'}`}>
          <JobDetailTasks 
            job={job} 
          />
        </div>
      )}

      {/* ==================== MODALS ==================== */}
      {/* Modal Add Member */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-blue-100 space-y-4 animate-scaleUp">
            <h3 className="text-base font-extrabold text-slate-900">Thêm nhân sự dự án</h3>
            
            <form onSubmit={handleAddMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn nhân sự</label>
                <CustomSelect
                  options={STAFF_OPTIONS}
                  value={newMemberName}
                  onChange={(val) => setNewMemberName(val)}
                  placeholder="Chọn nhân sự từ Arito Group"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vai trò trong dự án</label>
                <input 
                  type="text" 
                  value={newMemberRole} 
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="Ví dụ: Giám sát dự án cấp cao"
                  className="w-full p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phòng ban</label>
                <CustomSelect
                  options={DEPT_OPTIONS}
                  value={newMemberDept}
                  onChange={(val) => setNewMemberDept(val)}
                  placeholder="Chọn phòng ban"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Tỷ lệ thưởng (%)</label>
                  <span className="font-extrabold text-blue-600">{newMemberBonus}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={newMemberBonus} 
                  onChange={(e) => setNewMemberBonus(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Tương đương: {formatVND(Math.round((job.potentialBudget * newMemberBonus) / 100))}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-blue-50">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-blue-50 rounded-full font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow-sm active:scale-95"
                >
                  Gán vào dự án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Payment Milestone */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-blue-100 space-y-4 animate-scaleUp">
            <h3 className="text-base font-extrabold text-slate-900">Thêm đợt thanh toán</h3>
            
            <form onSubmit={handleAddPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên đợt thanh toán / Nghiệm thu</label>
                <input 
                  type="text" 
                  value={newTermName} 
                  onChange={(e) => setNewTermName(e.target.value)}
                  placeholder="Ví dụ: Đợt 3: Nghiệm thu hoàn thành lắp đặt POSM"
                  required
                  className="w-full p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tỷ lệ (%)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={newTermPercent} 
                    onChange={(e) => setNewTermPercent(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {formatVND(Math.round((job.potentialBudget * newTermPercent) / 100))}
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày dự kiến</label>
                  <CustomDatePicker 
                    value={newTermPlannedDate} 
                    onChange={setNewTermPlannedDate}
                    title="Ngày dự kiến"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hạn thanh toán</label>
                  <CustomDatePicker 
                    value={newTermDueDate} 
                    onChange={setNewTermDueDate}
                    title="Hạn thanh toán"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã PO của khách hàng</label>
                  <input 
                    type="text" 
                    value={newTermPo} 
                    onChange={(e) => setNewTermPo(e.target.value)}
                    placeholder="PO-2026-xxx"
                    className="w-full p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chi phí phát sinh ban đầu</label>
                <input 
                  type="number" 
                  value={newTermCostSpent} 
                  onChange={(e) => setNewTermCostSpent(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số biên bản nghiệm thu</label>
                <input 
                  type="text" 
                  value={newTermAcceptance} 
                  onChange={(e) => setNewTermAcceptance(e.target.value)}
                  placeholder="Ví dụ: BB-NT-Final-Handover"
                  className="w-full p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-blue-50">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-blue-50 rounded-full font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow-sm active:scale-95"
                >
                  Tạo đợt thanh toán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Progress */}
      {isAddProgressOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-blue-100 space-y-4 animate-scaleUp">
            <h3 className="text-base font-extrabold text-slate-900">Cập nhật nhật ký tiến độ</h3>
            
            <form onSubmit={handleAddProgress} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chi tiết hoạt động / Tình trạng <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea 
                  rows={3}
                  value={newProgressStatus} 
                  onChange={(e) => setNewProgressStatus(e.target.value)}
                  placeholder="Chi tiết triển khai, khảo sát địa điểm, sản xuất POSM..."
                  required
                  className="w-full p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bước hành động tiếp theo</label>
                <input 
                  type="text" 
                  value={newProgressNextStep} 
                  onChange={(e) => setNewProgressNextStep(e.target.value)}
                  placeholder="Ví dụ: Nghiệm thu lắp đặt và ký biên bản bàn giao"
                  className="w-full p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-blue-50">
                <button
                  type="button"
                  onClick={() => setIsAddProgressOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-blue-50 rounded-full font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 shadow-sm active:scale-95"
                >
                  Lưu nhật ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export interface JobDetailProps {
  job: JobItem;
  allJobs?: JobItem[];
  onBack: () => void;
  onUpdateJob?: (updatedJob: JobItem) => void;
}

export default function JobDetail({ 
  job, 
  allJobs = [], 
  onBack, 
  onUpdateJob 
}: JobDetailProps) {
  const list = allJobs.length > 0 ? allJobs : [job];
  const startIdx = list.findIndex(j => j.id === job.id);
  const safeIdx = startIdx >= 0 ? startIdx : 0;

  // Order of jobs: starts with the selected job, then following jobs in list, then previous jobs
  const orderedJobs = [
    list[safeIdx],
    ...list.slice(safeIdx + 1),
    ...list.slice(0, safeIdx)
  ];

  // Lazy loading state: initially show 1 job
  const [visibleCount, setVisibleCount] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // When selected job prop changes, reset visible count and ensure scroll is at the very top
  useEffect(() => {
    setVisibleCount(1);
    setIsLoadingMore(false);
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    const resetScroll = () => {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    };

    resetScroll();
    const rafId = requestAnimationFrame(resetScroll);
    return () => cancelAnimationFrame(rafId);
  }, [job.id]);

  const hasMore = visibleCount < orderedJobs.length;

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    loadingTimerRef.current = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 1, orderedJobs.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, orderedJobs.length]);

  // IntersectionObserver to auto-load when sentinel is approaching viewport
  useEffect(() => {
    if (!hasMore) return;
    const currentSentinel = sentinelRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0.05,
      }
    );

    observer.observe(currentSentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, handleLoadMore]);

  // Scroll listener on main container and window as smooth fallback
  useEffect(() => {
    if (!hasMore) return;

    const onScroll = () => {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        const { scrollTop, scrollHeight, clientHeight } = mainEl;
        if (scrollHeight - scrollTop - clientHeight < 350) {
          handleLoadMore();
        }
      }
    };

    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.addEventListener('scroll', onScroll, { passive: true });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (mainEl) {
        mainEl.removeEventListener('scroll', onScroll);
      }
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasMore, handleLoadMore]);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-12 pb-24 relative">
      {orderedJobs.slice(0, visibleCount).map((j, idx) => {
        const isFirst = idx === 0;

        return (
          <div 
            key={j.id} 
            id={`job-card-${j.id}`} 
            className={`scroll-mt-4 ${isFirst ? 'animate-fadeIn' : 'animate-job-card-entrance'}`}
          >
            <SingleJobDetailCard
              job={j}
              jobIndex={idx}
              totalJobs={orderedJobs.length}
              isFirst={isFirst}
              onBack={onBack}
              onUpdateJob={onUpdateJob}
            />
          </div>
        );
      })}

      {/* Elegant Loading Skeleton Preview while loading next project */}
      {isLoadingMore && (
        <div className="rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-xs p-6 shadow-sm space-y-5 animate-pulse">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-7 w-28 bg-blue-100/70 rounded-lg" />
              <div className="h-6 w-48 sm:w-64 bg-slate-200 rounded-lg" />
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 bg-blue-50 rounded-full" />
              <div className="h-8 w-28 bg-slate-100 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            {[1, 2, 3, 4, 5].map((k) => (
              <div key={k} className="h-14 bg-slate-50 border border-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Lazy Loading Sentinel & Indicator */}
      {hasMore && (
        <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center">
          {isLoadingMore ? (
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white border border-blue-200 shadow-sm text-blue-600 text-xs font-bold animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Đang tải dự án tiếp theo ({orderedJobs[visibleCount]?.jobCode})...</span>
            </div>
          ) : (
            <div className="h-6 w-full flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-200 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      )}

      {/* End of list confirmation */}
      {!hasMore && orderedJobs.length > 1 && (
        <div className="py-8 flex flex-col items-center justify-center text-center gap-1.5 animate-fadeIn">
          <div className="w-12 h-0.5 bg-slate-200 rounded-full mb-1" />
          <span className="text-xs font-semibold text-slate-400">
            ✓ Đã tải toàn bộ {orderedJobs.length} dự án
          </span>
        </div>
      )}
    </div>
  );
}
