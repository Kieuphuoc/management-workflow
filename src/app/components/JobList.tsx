'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Filter, Lock, 
  CheckCircle2, Clock, AlertCircle, 
  XCircle, RefreshCw, FileSpreadsheet, ChevronDown,
  Calendar, Check, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { JobItem } from '../data/mockJmsData';
import CustomSelect, { CustomSelectOption } from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

const TEAM_OPTIONS: CustomSelectOption[] = [
  { value: 'ALL', label: 'Tất cả các nhóm' },
  { value: 'Team Nghi', label: 'Team Nghi' },
  { value: 'Team Ngân', label: 'Team Ngân' },
  { value: 'Team Thảo', label: 'Team Thảo' },
  { value: 'Team Huy', label: 'Team Huy' },
];

const STATUS_OPTIONS: CustomSelectOption[] = [
  { 
    value: 'ALL', 
    label: 'Tất cả trạng thái',
    badge: <span className="w-2 h-2 rounded-full bg-slate-300"></span> 
  },
  { 
    value: 'Running', 
    label: 'Đang thực hiện',
    badge: <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> 
  },
  { 
    value: 'Done', 
    label: 'Đã hoàn thành',
    badge: <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 
  },
  { 
    value: 'Bidding', 
    label: 'Đang đấu thầu',
    badge: <span className="w-2 h-2 rounded-full bg-amber-500"></span> 
  },
  { 
    value: 'Pending', 
    label: 'Tạm dừng',
    badge: <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 
  },
  { 
    value: 'Cancelled', 
    label: 'Đã hủy',
    badge: <span className="w-2 h-2 rounded-full bg-rose-400"></span> 
  },
];

interface JobListProps {
  jobs: JobItem[];
  onSelectJob: (job: JobItem) => void;
  onNavigateCreateJob: () => void;
}

export default function JobList({ jobs, onSelectJob, onNavigateCreateJob }: JobListProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const hasActiveFilters = Boolean(
    searchKeyword.trim() || selectedTeam !== 'ALL' || selectedStatus !== 'ALL' || startDate || endDate
  );

  // Format currency VND
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  // Status badge config in Vietnamese
  const getStatusBadge = (status: JobItem['status']) => {
    switch (status) {
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            Đang chạy
          </span>
        );
      case 'Done':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Hoàn thành
          </span>
        );
      case 'Bidding':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Đấu thầu
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <AlertCircle className="w-3 h-3 text-indigo-600" />
            Tạm dừng
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" />
            Đã hủy
          </span>
        );
      case 'Liquidation':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RefreshCw className="w-3 h-3 text-purple-600" />
            Quyết toán
          </span>
        );
      default:
        return null;
    }
  };

  // Filter jobs logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const kw = searchKeyword.toLowerCase().trim();
      const matchKeyword = !kw || 
        job.jobCode.toLowerCase().includes(kw) ||
        job.jobName.toLowerCase().includes(kw) ||
        job.client.toLowerCase().includes(kw) ||
        job.brand.toLowerCase().includes(kw) ||
        (job.contractCode && job.contractCode.toLowerCase().includes(kw));

      const matchTeam = selectedTeam === 'ALL' || job.team === selectedTeam;
      const matchStatus = selectedStatus === 'ALL' || job.status === selectedStatus;
      const matchCategory = selectedCategory === 'ALL' || job.category === selectedCategory;

      let matchDates = true;
      if (startDate && job.startDate < startDate) matchDates = false;
      if (endDate && job.endDate > endDate) matchDates = false;

      return matchKeyword && matchTeam && matchStatus && matchCategory && matchDates;
    });
  }, [jobs, searchKeyword, selectedTeam, selectedStatus, selectedCategory, startDate, endDate]);

  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedTeam('ALL');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Danh sách Quản trị Dự án
            <span className="px-3 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {filteredJobs.length} dự án
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => alert('Đang xuất danh sách dự án ra file Excel (.xlsx)...')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-blue-200 hover:bg-blue-50/70 hover:border-blue-300 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất file Excel</span>
          </button>

          <button 
            type="button"
            onClick={onNavigateCreateJob}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm shadow-blue-500/25 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Dự án Mới</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4.5 sm:p-5 rounded-2xl border border-blue-100 shadow-sm space-y-3">
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pb-2 border-b border-blue-50">
            <span className="text-slate-500 font-medium">Bộ lọc đang áp dụng</span>
            <button 
              type="button" 
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3.5 items-end">
          {/* Search keyword */}
          <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 min-w-0">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text"
                placeholder="Mã dự án, tên công việc, khách hàng, nhãn hàng..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-blue-50/40 border border-blue-100 rounded-full focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400 text-slate-700 font-semibold"
              />
            </div>
          </div>

          {/* Start Day */}
          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2 min-w-0">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Ngày bắt đầu
            </label>
            <CustomDatePicker 
              value={startDate} 
              onChange={setStartDate} 
              title="Ngày bắt đầu" 
              variant="pill"
              align="left"
            />
          </div>

          {/* End Day */}
          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2 min-w-0">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Ngày kết thúc
            </label>
            <CustomDatePicker 
              value={endDate} 
              onChange={setEndDate} 
              title="Ngày kết thúc" 
              variant="pill"
              align="right"
            />
          </div>

          {/* Assigned Team */}
          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2 min-w-0">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Đội ngũ phụ trách
            </label>
            <CustomSelect 
              variant="pill"
              value={selectedTeam} 
              onChange={setSelectedTeam} 
              options={TEAM_OPTIONS} 
            />
          </div>

          {/* Status - Compact */}
          <div className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-2 min-w-0">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Trạng thái
            </label>
            <CustomSelect 
              variant="pill"
              value={selectedStatus} 
              onChange={setSelectedStatus} 
              options={STATUS_OPTIONS} 
            />
          </div>
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-50/70 border-b border-blue-100 text-xs font-semibold text-blue-900/80 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[150px]">Mã dự án</th>
                <th className="py-3.5 px-4 min-w-[260px]">Tên dự án</th>
                <th className="py-3.5 px-4 min-w-[150px]">Hạng mục</th>
                <th className="py-3.5 px-4 text-right min-w-[140px]">Ngân sách</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Trạng thái</th>
                <th className="py-3.5 px-4 min-w-[150px]">Account Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-sm">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                    <p className="font-medium">Không có dự án nào thỏa mãn điều kiện lọc</p>
                    <button 
                      onClick={resetFilters}
                      className="mt-2 text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                      Bỏ lọc để xem toàn bộ danh sách
                    </button>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job, idx) => (
                  <tr 
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-medium">
                      {idx + 1}
                    </td>

                    {/* Job Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {job.status === 'Done' && (
                          <span title="Dự án đã hoàn thành - Số liệu bị khóa">
                            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          </span>
                        )}
                        <span className="font-bold text-blue-700 group-hover:text-blue-900 tracking-tight font-mono">
                          {job.jobCode}
                        </span>
                      </div>
                    </td>

                    {/* Project Name */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {job.jobName}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold text-slate-800">
                        {job.category}
                      </span>
                    </td>

                    {/* Potential Budget */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-slate-900">
                        {formatVND(job.potentialBudget)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(job.status)}
                    </td>

                    {/* Account Lead */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                          {job.accountLead.avatar}
                        </div>
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {job.accountLead.name}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 bg-blue-50/30 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-4">
            <span>Hiển thị <strong>{filteredJobs.length}</strong> trên <strong>{jobs.length}</strong> dự án</span>
            <span className="hidden sm:inline text-blue-200">|</span>
            <span className="hidden sm:inline">Đồng bộ hai chiều với ERP Arito</span>
          </div>

          <div className="flex items-center gap-1 font-semibold">
            <span className="mr-2">Trang 1 / 1</span>
            <button disabled className="px-3 py-1 rounded-full border border-blue-100 bg-white text-slate-300 cursor-not-allowed">Trước</button>
            <button className="px-3 py-1 rounded-full border border-blue-600 bg-blue-600 text-white shadow-xs">1</button>
            <button disabled className="px-3 py-1 rounded-full border border-blue-100 bg-white text-slate-300 cursor-not-allowed">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
