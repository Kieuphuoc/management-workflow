'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, Check, Plus, Trash2, 
  Calendar, DollarSign, Users, FileText, Info, User, Building2
} from 'lucide-react';
import { 
  JobItem, CLIENT_LIST, CATEGORIES_LIST, INDUSTRIES_LIST, ALL_STAFF_MEMBERS 
} from '../data/mockJmsData';
import CustomSelect, { CustomSelectOption } from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

const CLIENT_OPTIONS: CustomSelectOption[] = CLIENT_LIST.map(c => ({
  value: c.name,
  label: c.name,
  sublabel: c.code,
}));

const CLIENT_TYPE_OPTIONS: CustomSelectOption[] = [
  { value: 'New', label: 'Khách hàng mới' },
  { value: 'Existing', label: 'Khách hàng hiện hữu' },
  { value: 'Key Account', label: 'Khách hàng trọng điểm' },
];

const CATEGORY_OPTIONS: CustomSelectOption[] = CATEGORIES_LIST.map(cat => ({
  value: cat,
  label: cat,
}));

const INDUSTRY_OPTIONS: CustomSelectOption[] = INDUSTRIES_LIST.map(ind => ({
  value: ind,
  label: ind,
}));

const TEAM_OPTIONS: CustomSelectOption[] = [
  { value: 'Team Nghi', label: 'Team Nghi', sublabel: 'Khách hàng trọng điểm' },
  { value: 'Team Ngân', label: 'Team Ngân', sublabel: 'FMCG & Công nghệ' },
  { value: 'Team Thảo', label: 'Team Thảo', sublabel: 'Sự kiện trải nghiệm' },
  { value: 'Team Huy', label: 'Team Huy', sublabel: 'Sản xuất & POSM' },
];

const STAFF_OPTIONS: CustomSelectOption[] = ALL_STAFF_MEMBERS.map(s => ({
  value: s.name,
  label: s.name,
  sublabel: `${s.role} (${s.department})`,
}));

interface CreateJobProps {
  onCancel: () => void;
  onSubmit: (newJob: JobItem) => void;
}

interface TempMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bonusPercent: number;
}

interface TempPaymentTerm {
  id: string;
  name: string;
  percent: number;
  date: string;
  condition: string;
}

export default function CreateJob({ onCancel, onSubmit }: CreateJobProps) {
  // Card 1: Core Info state
  const [autoGenCode, setAutoGenCode] = useState(true);
  const [customJobCode, setCustomJobCode] = useState('ARITO-026-455');
  const [jobName, setJobName] = useState('');
  const [selectedClient, setSelectedClient] = useState(CLIENT_LIST[0]?.name || '');
  const [selectedBrand, setSelectedBrand] = useState(CLIENT_LIST[0]?.brands[0] || '');
  const [contractClient, setContractClient] = useState('Công ty TNHH Quốc Tế Unilever Việt Nam');
  const [clientType, setClientType] = useState('New');
  const [contactName, setContactName] = useState('Mr. Nhân Mai (Trưởng phòng Mua hàng)');
  const [contactPhone, setContactPhone] = useState('0903 123 456');
  const [contactEmail, setContactEmail] = useState('nhan.mai@unilever.com');
  const [category, setCategory] = useState(CATEGORIES_LIST[0]);
  const [industry, setIndustry] = useState(INDUSTRIES_LIST[0]);
  const [startDate, setStartDate] = useState('2026-09-15');
  const [endDate, setEndDate] = useState('2026-10-15');
  const [kickoffDate, setKickoffDate] = useState('2026-09-18');
  const [potentialBudget, setPotentialBudget] = useState<number>(350000000);
  const [targetGp, setTargetGp] = useState<number>(32);
  const [team, setTeam] = useState('Team Nghi');
  const [projectLeaderName, setProjectLeaderName] = useState('Lê Thị Mỹ Duyên');
  const [description, setDescription] = useState('');

  // Card 2: Members & Bonus % state
  const [members, setMembers] = useState<TempMember[]>([
    { id: '1', name: 'Lê Thị Mỹ Duyên', role: 'Chủ nhiệm dự án (Project Leader)', department: 'Account', bonusPercent: 50 },
    { id: '2', name: 'Lê Hải Minh', role: 'Chuyên viên Account', department: 'Account', bonusPercent: 30 },
    { id: '3', name: 'Bùi Gia Huy', role: 'Phụ trách Sản xuất', department: 'Production', bonusPercent: 20 },
  ]);

  // Card 3: Payment terms draft state
  const [paymentTerms, setPaymentTerms] = useState<TempPaymentTerm[]>([
    { id: 'p1', name: 'Đợt 1: Tạm ứng 50% sau khi ký hợp đồng', percent: 50, date: '2026-09-20', condition: 'Ký HĐ & Nhận PO' },
    { id: 'p2', name: 'Đợt 2: Thanh toán 30% khi hoàn thành 50% khối lượng', percent: 30, date: '2026-10-05', condition: 'Nghiệm thu giai đoạn 1' },
    { id: 'p3', name: 'Đợt 3: Quyết toán 20% còn lại', percent: 20, date: '2026-10-25', condition: 'Biên bản nghiệm thu tổng kết' },
  ]);

  const totalBonusPercent = members.reduce((sum, m) => sum + m.bonusPercent, 0);
  const totalPaymentPercent = paymentTerms.reduce((sum, p) => sum + p.percent, 0);

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' ₫';
  };

  const handleClientChange = (clientName: string) => {
    setSelectedClient(clientName);
    const found = CLIENT_LIST.find(c => c.name === clientName);
    if (found && found.brands.length > 0) {
      setSelectedBrand(found.brands[0]);
    }
    if (clientName === 'Unilever Việt Nam') {
      setContractClient('Công ty TNHH Quốc Tế Unilever Việt Nam');
      setContactName('Mr. Nhân Mai (Trưởng phòng Mua hàng)');
      setContactPhone('0903 123 456');
      setContactEmail('nhan.mai@unilever.com');
    } else if (clientName === 'Samsung Electronics Vina') {
      setContractClient('Công ty TNHH Điện Tử Samsung Vina');
      setContactName('Ms. Thu Trang (Giám đốc Thương hiệu)');
      setContactPhone('0912 888 999');
      setContactEmail('thu.trang@samsung.com');
    } else if (clientName === 'Shopee Việt Nam') {
      setContractClient('Công ty TNHH Shopee Việt Nam');
      setContactName('Mr. Tuấn Anh (Trưởng nhóm Marketing)');
      setContactPhone('0988 555 666');
      setContactEmail('tuan.anh@shopee.com');
    } else if (clientName === 'Nestle Việt Nam') {
      setContractClient('Công ty TNHH Nestlé Việt Nam');
      setContactName('Ms. Mai Lan (Trade Marketing)');
      setContactPhone('0908 777 888');
      setContactEmail('mai.lan@nestle.com');
    } else {
      setContractClient(`Công ty TNHH ${clientName}`);
    }
  };

  const handleAddMemberRow = () => {
    const defaultStaff = ALL_STAFF_MEMBERS[members.length % ALL_STAFF_MEMBERS.length];
    const newM: TempMember = {
      id: String(Date.now()),
      name: defaultStaff.name,
      role: defaultStaff.role,
      department: defaultStaff.department,
      bonusPercent: 10,
    };
    setMembers([...members, newM]);
  };

  const handleUpdateMember = (id: string, field: keyof TempMember, value: any) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleAddPaymentRow = () => {
    const newP: TempPaymentTerm = {
      id: String(Date.now()),
      name: `Đợt ${paymentTerms.length + 1}: Thanh toán tiếp theo`,
      percent: 10,
      date: '2026-10-30',
      condition: 'Nghiệm thu giai đoạn',
    };
    setPaymentTerms([...paymentTerms, newP]);
  };

  const handleUpdatePayment = (id: string, field: keyof TempPaymentTerm, value: any) => {
    setPaymentTerms(paymentTerms.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRemovePayment = (id: string) => {
    setPaymentTerms(paymentTerms.filter(p => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobName.trim()) {
      alert('Vui lòng nhập Tên Dự Án!');
      return;
    }
    if (!startDate || !endDate) {
      alert('Vui lòng chọn cả Ngày bắt đầu và Ngày kết thúc!');
      return;
    }
    if (totalBonusPercent !== 100) {
      const confirmSubmit = window.confirm(
        `Cảnh báo: Tổng tỷ lệ thưởng nội bộ hiện là ${totalBonusPercent}% (chưa đủ 100%). Bạn có chắc chắn muốn tiếp tục?`
      );
      if (!confirmSubmit) return;
    }

    const newJob: JobItem = {
      id: `job-${Date.now()}`,
      jobCode: autoGenCode ? customJobCode : customJobCode,
      contractCode: '',
      isLocked: false,
      jobName,
      client: selectedClient,
      clientCode: CLIENT_LIST.find(c => c.name === selectedClient)?.code || 'CLI-NEW',
      contractClient,
      clientType,
      contactPerson: {
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
      },
      brand: selectedBrand,
      category,
      jobType: category,
      industry,
      potentialBudget: Number(potentialBudget),
      allocatedBilling: 0,
      grossProfitPercent: Number(targetGp),
      startDate,
      endDate,
      kickoffDate: kickoffDate || startDate,
      status: 'Running',
      team,
      projectLeader: {
        name: projectLeaderName,
        avatar: projectLeaderName[0] || 'L',
        role: 'Project Leader',
      },
      assistants: [],
      accountLead: {
        name: 'Trần Minh Quang',
        avatar: 'Q',
      },
      description,
      briefedBilling: Number(potentialBudget),
      contractBilling: Number(potentialBudget),
      invoicedBilling: 0,
      receivableBilling: Number(potentialBudget),
      actualReceived: 0,
      remindersCount: 0,
      membersCount: members.length,
    };

    onSubmit(newJob);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <button 
              type="button" 
              onClick={onCancel}
              className="hover:text-blue-600 inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Danh sách dự án</span>
            </button>
            <span>/</span>
            <span>Khởi tạo</span>
          </div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
            Quy trình Dự án
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 mt-0.5">
            <span>Tạo Dự Án Mới</span>
            <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              JMS → Kế toán Arito
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Thiết lập thông tin dự án, cấu hình phân bổ tỷ lệ thưởng nhân sự và lập dự thảo các đợt thanh toán cho Kế toán Arito.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Tạo dự án ngay</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ==================== PHẦN 1: THÔNG TIN DỰ ÁN CỐT LÕI ==================== */}
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-blue-50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Phần 1</span>
                <h2 className="text-base font-extrabold text-slate-900">Thông Tin Cốt Lõi Dự Án</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Tự động tạo mã Job */}
            <div className="md:col-span-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <label className="flex items-center gap-2 font-bold text-slate-800 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoGenCode}
                    onChange={(e) => setAutoGenCode(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Tự động sinh mã Job Code</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Hệ thống Arito cho phép cấp mã tự động theo chuẩn nhận diện. Có thể điều chỉnh lại trước khi phát sinh chứng từ kế toán.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-sm bg-white px-3.5 py-1.5 rounded-full border border-blue-200 text-blue-700 shadow-2xs">
                  {autoGenCode ? 'ARITO-026-455' : customJobCode}
                </span>
                {!autoGenCode && (
                  <input 
                    type="text" 
                    value={customJobCode}
                    onChange={(e) => setCustomJobCode(e.target.value)}
                    placeholder="Nhập mã tùy chỉnh"
                    className="p-1.5 bg-white border border-blue-200 rounded-full font-mono text-xs w-36 px-3"
                  />
                )}
              </div>
            </div>

            {/* Tên dự án */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Tên Dự Án <span className="text-rose-500 font-black text-sm ml-1">*</span>
              </label>
              <input 
                type="text" 
                required
                placeholder="VD: Close Up White Attraction Flagship Store 2026..."
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-900 transition-all"
              />
            </div>

            {/* Mô tả dự án */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Mô Tả Chi Tiết Dự Án
              </label>
              <textarea 
                rows={3}
                placeholder="Mô tả phạm vi công việc, địa điểm thực hiện, sản phẩm bàn giao hoặc các lưu ý đặc biệt..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900 transition-all resize-y"
              />
            </div>

            {/* KHỐI THÔNG TIN KHÁCH HÀNG */}
            <div className="md:col-span-2 p-5 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-4">
              <div className="flex items-center gap-2 border-b border-blue-100 pb-3">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                  Thông Tin Khách Hàng & Pháp Nhân Hợp Đồng
                </h3>
              </div>

              {/* Hàng 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                    Khách Hàng <span className="text-rose-500 font-black text-sm ml-1">*</span>
                  </label>
                  <CustomSelect 
                    value={selectedClient}
                    onChange={handleClientChange}
                    options={CLIENT_OPTIONS}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                    Tên Pháp Nhân Hợp Đồng
                  </label>
                  <input 
                    type="text" 
                    value={contractClient}
                    onChange={(e) => setContractClient(e.target.value)}
                    placeholder="VD: Công ty TNHH Quốc Tế Unilever Việt Nam"
                    className="w-full px-3.5 py-2.5 bg-white border border-blue-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                    Phân Loại Khách Hàng
                  </label>
                  <CustomSelect 
                    value={clientType}
                    onChange={setClientType}
                    options={CLIENT_TYPE_OPTIONS}
                  />
                </div>
              </div>

              {/* Hàng 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                    Nhãn Hàng (Brand) <span className="text-rose-500 font-black text-sm ml-1">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    placeholder="VD: Close Up, OMO, Galaxy..."
                    className="w-full px-3.5 py-2.5 bg-white border border-blue-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                    Người Liên Hệ Phía Khách Hàng
                  </label>
                  <input 
                    type="text" 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="VD: Mr. Nhân Mai (Trưởng phòng Mua hàng)"
                    className="w-full px-3.5 py-2.5 bg-white border border-blue-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                    Số Điện Thoại
                  </label>
                  <input 
                    type="text" 
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="VD: 0903 123 456"
                    className="w-full px-3.5 py-2.5 bg-white border border-blue-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                    Hộp Thư Email
                  </label>
                  <input 
                    type="email" 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="VD: nhan.mai@unilever.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-blue-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Hạng mục & Ngành hàng */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Hạng Mục Dự Án <span className="text-rose-500 font-black text-sm ml-1">*</span>
              </label>
              <CustomSelect 
                value={category}
                onChange={setCategory}
                options={CATEGORY_OPTIONS}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Ngành Hàng
              </label>
              <CustomSelect 
                value={industry}
                onChange={setIndustry}
                options={INDUSTRY_OPTIONS}
              />
            </div>

            {/* Tiến độ thời gian */}
            <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100 md:col-span-2">
              <span className="block font-extrabold text-slate-800 text-xs mb-2">
                Kế Hoạch Tiến Độ Thời Gian (Bắt buộc Ngày bắt đầu & Ngày kết thúc)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1 font-semibold">
                    Ngày Bắt Đầu <span className="text-rose-500 font-black text-sm ml-1">*</span>
                  </label>
                  <CustomDatePicker 
                    value={startDate}
                    onChange={setStartDate}
                    title="Ngày Bắt Đầu"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1 font-semibold">Ngày Kick-off Dự Kiến</label>
                  <CustomDatePicker 
                    value={kickoffDate}
                    onChange={setKickoffDate}
                    title="Ngày Kick-off Dự Kiến"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1 font-semibold">
                    Ngày Kết Thúc <span className="text-rose-500 font-black text-sm ml-1">*</span>
                  </label>
                  <CustomDatePicker 
                    value={endDate}
                    onChange={setEndDate}
                    title="Ngày Kết Thúc"
                    align="right"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Ngân sách & Mục tiêu GP */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Ngân Sách Tiềm Năng (VNĐ) <span className="text-rose-500 font-black text-sm ml-1">*</span>
              </label>
              <div className="relative">
                <input 
                  type="number"
                  required
                  min="0"
                  step="1000000"
                  value={potentialBudget}
                  onChange={(e) => setPotentialBudget(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-blue-50/40 border border-blue-100 rounded-xl text-sm font-extrabold text-slate-900 focus:bg-white"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-blue-700">
                  {formatVND(potentialBudget)}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Mục Tiêu Lợi Nhuận Gộp (%)
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={targetGp}
                  onChange={(e) => setTargetGp(Number(e.target.value))}
                  className="w-28 px-4 py-2.5 bg-blue-50/40 border border-blue-100 rounded-xl text-sm font-extrabold text-emerald-700"
                />
                <span className="text-slate-500 font-bold">%</span>
                <span className="text-[11px] text-slate-400 ml-auto font-medium">Định mức chuẩn: 30% - 35%</span>
              </div>
            </div>

            {/* Đội ngũ & Leader */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Đội Ngũ Phụ Trách
              </label>
              <CustomSelect 
                value={team}
                onChange={setTeam}
                options={TEAM_OPTIONS}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Chủ Nhiệm Dự Án (Project Leader)
              </label>
              <CustomSelect 
                value={projectLeaderName}
                onChange={setProjectLeaderName}
                options={STAFF_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* ==================== PHẦN 2: NHÂN SỰ & TỶ LỆ HOA HỒNG ==================== */}
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Phần 2</span>
                <h2 className="text-base font-extrabold text-slate-900">
                  Nhân Sự Dự Án & Tỷ Lệ Thưởng Nội Bộ <span className="text-rose-500 font-black text-sm ml-1">*</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs bg-blue-50/60 px-3.5 py-1.5 rounded-full border border-blue-100">
                <span className="text-slate-600 font-medium">Tổng tỷ lệ đã phân bổ:</span>
                <span className={`font-extrabold text-sm ${totalBonusPercent === 100 ? 'text-emerald-600' : 'text-blue-700'}`}>
                  {totalBonusPercent}%
                </span>
                <span className="text-slate-400">/ 100%</span>
              </div>
              <button
                type="button"
                onClick={handleAddMemberRow}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full active:scale-95 transition-all cursor-pointer"
                title="Thêm nhân sự"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm nhân sự</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-blue-100 rounded-2xl custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-blue-50/70 text-blue-900/80 uppercase font-semibold border-b border-blue-100">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[200px]">Họ và Tên Nhân Sự</th>
                  <th className="py-3 px-4">Phòng Ban</th>
                  <th className="py-3 px-4">Vai Trò Trong Dự Án</th>
                  <th className="py-3 px-4 text-center min-w-[120px]">
                    Tỷ Lệ Thưởng (%) <span className="text-rose-500 font-black text-sm ml-1">*</span>
                  </th>
                  <th className="py-3 px-4 text-right min-w-[140px]">Số Tiền Dự Kiến</th>
                  <th className="py-3 px-4 text-center w-16">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {members.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <CustomSelect 
                        value={m.name}
                        onChange={(val) => {
                          const staff = ALL_STAFF_MEMBERS.find(s => s.name === val);
                          if (staff) {
                            setMembers(members.map(member => member.id === m.id ? {
                              ...member,
                              name: staff.name,
                              department: staff.department,
                              role: staff.role
                            } : member));
                          } else {
                            handleUpdateMember(m.id, 'name', val);
                          }
                        }}
                        options={STAFF_OPTIONS}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        type="text"
                        value={m.department}
                        onChange={(e) => handleUpdateMember(m.id, 'department', e.target.value)}
                        className="w-full p-2 bg-blue-50/40 border border-blue-100 rounded-xl text-xs font-medium"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        type="text"
                        value={m.role}
                        onChange={(e) => handleUpdateMember(m.id, 'role', e.target.value)}
                        className="w-full p-2 bg-blue-50/40 border border-blue-100 rounded-xl text-xs font-medium"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input 
                          type="number"
                          min="1"
                          max="100"
                          value={m.bonusPercent}
                          onChange={(e) => handleUpdateMember(m.id, 'bonusPercent', Number(e.target.value))}
                          className="w-16 p-1.5 text-center font-extrabold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl text-xs"
                        />
                        <span className="font-bold text-slate-500">%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {formatVND(Math.round((potentialBudget * m.bonusPercent) / 100))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        type="button"
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full cursor-pointer"
                        title="Xóa nhân sự này"
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

        {/* ==================== PHẦN 3: DỰ THẢO CÁC ĐỢT THANH TOÁN ==================== */}
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Phần 3</span>
                <h2 className="text-base font-extrabold text-slate-900">Dự Thảo Kỳ Thanh Toán (Milestones)</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs bg-blue-50/60 px-3.5 py-1.5 rounded-full border border-blue-100">
                <span className="text-slate-600 font-medium">Tổng tỷ lệ thanh toán:</span>
                <span className={`font-extrabold text-sm ${totalPaymentPercent === 100 ? 'text-emerald-600' : 'text-blue-700'}`}>
                  {totalPaymentPercent}%
                </span>
                <span className="text-slate-400">/ 100%</span>
              </div>
              <button
                type="button"
                onClick={handleAddPaymentRow}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm đợt thanh toán</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-blue-100 rounded-2xl custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-blue-50/70 text-blue-900/80 uppercase font-semibold border-b border-blue-100">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[240px]">Tên Đợt Thanh Toán</th>
                  <th className="py-3 px-4 text-center min-w-[100px]">Tỷ Lệ (%)</th>
                  <th className="py-3 px-4 text-right min-w-[150px]">Số Tiền Kế Hoạch (VNĐ)</th>
                  <th className="py-3 px-4 text-center min-w-[140px]">Ngày Đến Hạn Dự Kiến</th>
                  <th className="py-3 px-4 min-w-[200px]">Điều Kiện Kích Hoạt</th>
                  <th className="py-3 px-4 text-center w-16">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {paymentTerms.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <input 
                        type="text"
                        value={p.name}
                        onChange={(e) => handleUpdatePayment(p.id, 'name', e.target.value)}
                        className="w-full p-2 bg-blue-50/40 border border-blue-100 rounded-xl font-bold text-xs text-slate-900"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input 
                          type="number"
                          min="1"
                          max="100"
                          value={p.percent}
                          onChange={(e) => handleUpdatePayment(p.id, 'percent', Number(e.target.value))}
                          className="w-16 p-1.5 text-center font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl text-xs"
                        />
                        <span className="font-bold text-slate-500">%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {formatVND(Math.round((potentialBudget * p.percent) / 100))}
                    </td>
                    <td className="py-3 px-4 text-center min-w-[150px]">
                      <CustomDatePicker 
                        value={p.date}
                        onChange={(val) => handleUpdatePayment(p.id, 'date', val)}
                        title="Ngày Đến Hạn Dự Kiến"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input 
                        type="text"
                        value={p.condition}
                        onChange={(e) => handleUpdatePayment(p.id, 'condition', e.target.value)}
                        placeholder="Ký HĐ, nghiệm thu giai đoạn..."
                        className="w-full p-2 bg-blue-50/40 border border-blue-100 rounded-xl text-xs text-slate-700 font-medium"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        type="button"
                        onClick={() => handleRemovePayment(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full cursor-pointer"
                        title="Xóa đợt này"
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

        {/* Nút Submit cuối trang */}
        <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Sau khi tạo, dự án sẽ xuất hiện trên danh sách Jobs và tự động đồng bộ sang Kế toán Arito.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Tạo Dự Án</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
