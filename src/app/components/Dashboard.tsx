'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Award, 
  Layers, CheckCircle2, ArrowUpRight, Zap
} from 'lucide-react';
import { 
  HIERARCHY_DATA, SALES_FORECAST_DATA, TEAM_PERFORMANCE_DATA 
} from '../data/mockJmsData';
import CustomSelect, { CustomSelectOption } from './CustomSelect';

const YEAR_OPTIONS: CustomSelectOption[] = [
  { value: '2026', label: 'Năm 2026 (Hiện tại)' },
  { value: '2025', label: 'Năm 2025' },
  { value: '2024', label: 'Năm 2024' },
];

const CORP_OPTIONS: CustomSelectOption[] = [
  { value: 'SQ-CORP', label: 'Arito Group (Tập đoàn Holding)' },
  { value: 'SEC-HOLD', label: 'Arito Communications (SEC)' },
  { value: 'DENTSU-SQ', label: 'Liên minh Dentsu Arito' },
];

export default function Dashboard({ onNavigateJobList }: { onNavigateJobList?: () => void } = {}) {
  const [selectedCorp, setSelectedCorp] = useState('SQ-CORP');
  const [selectedBu, setSelectedBu] = useState('ALL');
  const [selectedSubUnit, setSelectedSubUnit] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [forecastHorizon, setForecastHorizon] = useState<'12m' | '24m'>('24m');

  const availableBus = HIERARCHY_DATA.children || [];

  const availableSubUnits = useMemo(() => {
    if (selectedBu === 'ALL') {
      return availableBus.flatMap(bu => bu.children || []);
    }
    const foundBu = availableBus.find(bu => bu.code === selectedBu);
    return foundBu ? foundBu.children || [] : [];
  }, [availableBus, selectedBu]);

  const handleBuChange = (buCode: string) => {
    setSelectedBu(buCode);
    setSelectedSubUnit('ALL');
  };

  const buOptions: CustomSelectOption[] = useMemo(() => [
    { value: 'ALL', label: 'Tất cả các khối (BU)' },
    ...availableBus.map(bu => ({ value: bu.code, label: bu.name }))
  ], [availableBus]);

  const subUnitOptions: CustomSelectOption[] = useMemo(() => [
    { value: 'ALL', label: 'Tất cả các đội ngũ' },
    ...availableSubUnits.map(sub => ({ value: sub.code, label: sub.name }))
  ], [availableSubUnits]);

  const displayForecastData = useMemo(() => {
    if (forecastHorizon === '12m') {
      return SALES_FORECAST_DATA.slice(12, 24);
    }
    return SALES_FORECAST_DATA;
  }, [forecastHorizon]);

  const maxVal = Math.max(
    ...displayForecastData.map(d => Math.max(d.actual, d.forecast, d.allocateAuto, d.target))
  ) * 1.15;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Card & Hierarchical Filter */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
              Báo cáo Điều hành Hợp nhất
            </span>
            <div className="flex items-center gap-2.5 mt-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Điều hành Hoạt động</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Dữ liệu trực tiếp
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Hợp nhất dữ liệu dự án Account & số liệu Kế toán Arito ERP: Dự báo doanh thu 24 tháng, phân bổ chi phí tự động & tỷ lệ trúng thầu đội ngũ.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold shrink-0">Kỳ báo cáo:</span>
            <CustomSelect
              variant="pill"
              size="sm"
              value={selectedYear}
              onChange={setSelectedYear}
              options={YEAR_OPTIONS}
              className="w-48"
            />
          </div>
        </div>

        {/* 3-Level Hierarchical Filter Bar */}
        <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/80">
          <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-blue-800">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Bộ lọc Cây phân cấp Quản trị (3 Cấp):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Cấp 1: Tập đoàn / Đơn vị chủ quản
              </label>
              <CustomSelect
                value={selectedCorp}
                onChange={setSelectedCorp}
                options={CORP_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Cấp 2: Khối kinh doanh (BU)
              </label>
              <CustomSelect
                value={selectedBu}
                onChange={handleBuChange}
                options={buOptions}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Cấp 3: Đội ngũ / Nhóm phụ trách
              </label>
              <CustomSelect
                value={selectedSubUnit}
                onChange={setSelectedSubUnit}
                options={subUnitOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Executive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={onNavigateJobList}
          className={`bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 space-y-3 ${
            onNavigateJobList ? 'cursor-pointer hover:border-blue-300 group' : ''
          }`}
          title={onNavigateJobList ? 'Bấm để xem danh sách dự án' : undefined}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider group-hover:underline">Dự án Đang Thực Hiện</span>
            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline justify-between">
              <span>42 <span className="text-sm font-semibold text-slate-400">dự án</span></span>
              {onNavigateJobList && (
                <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  Xem tất cả →
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.2% so với cùng kỳ 2025</span>
            </div>
          </div>
          <div className="pt-2 border-t border-blue-50 flex items-center justify-between text-[11px] text-slate-500">
            <span>Đang đấu thầu (Bidding):</span>
            <strong className="text-amber-600 font-bold">18 dự án</strong>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Tổng Ngân Sách Tiềm Năng</span>
            <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-200">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-950 tracking-tight">
              148.5 <span className="text-sm font-semibold text-slate-500">Tỷ ₫</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Đã ký hợp đồng: 112.8 Tỷ ₫</span>
            </div>
          </div>
          <div className="pt-2 border-t border-blue-50 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tiềm năng Brief:</span>
            <strong className="text-blue-600 font-bold">35.7 Tỷ ₫</strong>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Doanh Thu Thực Tế</span>
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
              96.2 <span className="text-sm font-semibold text-slate-500">Tỷ ₫</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã thu tiền: 88.4 Tỷ ₫</span>
            </div>
          </div>
          <div className="pt-2 border-t border-blue-50 flex items-center justify-between text-[11px] text-slate-500">
            <span>Công nợ phải thu:</span>
            <strong className="text-amber-600 font-bold">7.8 Tỷ ₫</strong>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Tỷ Lệ Thắng & Lợi Nhuận GP</span>
            <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs border border-purple-200">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-900 tracking-tight">
              75.8% <span className="text-xs font-semibold text-slate-400">Tỷ lệ trúng thầu</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold mt-1">
              <span>Lợi nhuận gộp TB: <strong>31.8%</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-blue-50 flex items-center justify-between text-[11px] text-slate-500">
            <span>Thắng 86 trên 113 gói thầu</span>
            <strong className="text-emerald-600 font-bold">+3.5%</strong>
          </div>
        </div>
      </div>

      {/* ==================== BIỂU ĐỒ 1: DỰ BÁO DOANH THU 2 NĂM & ALLOCATE AUTO ==================== */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Dự báo Tài chính</span>
            <div className="flex items-center gap-2 mt-0.5">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-900">
                Dự báo Doanh thu 24 Tháng & Phân bổ Chi phí Tự động (Allocate Auto)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dự báo doanh thu lũy tiến 2 năm kết hợp cơ chế phân bổ chi phí định mức theo tháng để phản ánh đúng biên lợi nhuận thực tế
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center bg-blue-50/70 p-1 rounded-full text-xs font-semibold text-slate-600 border border-blue-100">
              <button
                type="button"
                onClick={() => setForecastHorizon('12m')}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  forecastHorizon === '12m' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-blue-700'
                }`}
              >
                12 Tháng (2026)
              </button>
              <button
                type="button"
                onClick={() => setForecastHorizon('24m')}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  forecastHorizon === '24m' ? 'bg-blue-600 text-white shadow-xs' : 'hover:text-blue-700'
                }`}
              >
                24 Tháng (2025 - 2026)
              </button>
            </div>

            <div className="hidden xl:flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-slate-600">Thực tế</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-200 border border-blue-400"></span>
                <span className="text-slate-600">Dự báo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-amber-500 rounded-full"></span>
                <span className="text-slate-600">Phân bổ tự động (Chi phí)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Bar & Line Chart Representation */}
        <div className="h-72 w-full pt-4 relative">
          <div className="h-full flex items-end justify-between gap-1.5 sm:gap-2 border-b border-blue-100 pb-2">
            {displayForecastData.map((d) => {
              const actualH = (d.actual / maxVal) * 100;
              const forecastH = (d.forecast / maxVal) * 100;
              const allocateH = (d.allocateAuto / maxVal) * 100;
              const isFuture = d.actual === 0;

              return (
                <div key={d.month} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col p-2.5 bg-slate-900 text-white rounded-xl text-[11px] shadow-xl z-20 pointer-events-none whitespace-nowrap">
                    <span className="font-extrabold text-blue-300">{d.month}</span>
                    {d.actual > 0 ? (
                      <span>Doanh thu thực tế: <strong>{d.actual} Tỷ ₫</strong></span>
                    ) : (
                      <span>Dự báo: <strong>{d.forecast} Tỷ ₫</strong></span>
                    )}
                    <span className="text-amber-300">Chi phí phân bổ: <strong>{d.allocateAuto} Tỷ ₫</strong></span>
                    <span className="text-emerald-300">Biên LN ước tính: <strong>{((isFuture ? d.forecast : d.actual) - d.allocateAuto).toFixed(1)} Tỷ ₫</strong></span>
                  </div>

                  <div className="w-full flex items-end justify-center relative h-full">
                    <div 
                      style={{ height: `${forecastH}%` }}
                      className={`w-full max-w-[18px] rounded-t-md transition-all ${
                        isFuture 
                          ? 'bg-blue-200 border border-dashed border-blue-400 group-hover:bg-blue-300' 
                          : 'bg-blue-100/80'
                      }`}
                    />

                    {d.actual > 0 && (
                      <div 
                        style={{ height: `${actualH}%` }}
                        className="absolute bottom-0 w-full max-w-[18px] bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-md group-hover:from-blue-800 group-hover:to-blue-600 transition-all shadow-xs"
                      />
                    )}

                    <div 
                      style={{ bottom: `${allocateH}%` }}
                      className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white shadow-xs z-10 -translate-y-1/2"
                      title={`Chi phí phân bổ: ${d.allocateAuto} Tỷ ₫`}
                    />
                  </div>

                  <span className="text-[10px] text-slate-500 mt-2 font-semibold tracking-tighter truncate max-w-full">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="absolute left-0 top-0 text-[10px] text-blue-400 font-mono font-bold">
            {maxVal.toFixed(0)} Tỷ VNĐ
          </div>
        </div>

        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
          <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Cơ chế Phân bổ Chi phí Tự động (Allocate Auto):</strong> Hệ thống Arito tự động làm mịn ngân sách chi phí theo chu kỳ dự án, giúp Ban Lãnh đạo nắm bắt chính xác bức tranh lợi nhuận hàng tháng mà không bị sai lệch thời điểm do hóa đơn đầu vào về trễ.
          </div>
        </div>
      </div>

      {/* ==================== HIỆU SUẤT ĐỘI NGŨ & TỶ LỆ THẮNG/THUA ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Hiệu suất Đội ngũ</span>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Hiệu suất & Tỷ lệ Trúng thầu (Win/Fail Ratio)</span>
              </h2>
            </div>

            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              Năm {selectedYear}
            </span>
          </div>

          <div className="overflow-x-auto border border-blue-100 rounded-2xl text-xs custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50/70 text-blue-900/80 uppercase font-semibold border-b border-blue-100">
                  <th className="py-3.5 px-4">Đội ngũ / Nhóm</th>
                  <th className="py-3.5 px-4 text-center">Trúng thầu</th>
                  <th className="py-3.5 px-4 text-center">Đang chạy</th>
                  <th className="py-3.5 px-4 text-center">Đấu thầu</th>
                  <th className="py-3.5 px-4 text-center">Trượt thầu</th>
                  <th className="py-3.5 px-4 text-right">Doanh thu (Tỷ ₫)</th>
                  <th className="py-3.5 px-4 text-center">GP Trung bình</th>
                  <th className="py-3.5 px-4 text-center">Tỷ lệ Thắng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {TEAM_PERFORMANCE_DATA.map((t) => (
                  <tr key={t.team} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>{t.team}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {t.wonJobs}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        {t.runningJobs}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-amber-600 font-bold">
                      {t.biddingJobs}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      {t.failedJobs}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {t.revenue} Tỷ
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                      {t.gpAvg}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-0.5 rounded-full">
                        {t.winRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cơ cấu Dịch vụ */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Cơ cấu Doanh thu</span>
            <h2 className="text-base font-extrabold text-slate-900">Doanh thu theo Ngành dịch vụ</h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1.5">
                <span className="text-slate-700">Sự kiện & Activation</span>
                <span className="text-blue-700">45.0% (66.8 Tỷ ₫)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full w-[45%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1.5">
                <span className="text-slate-700">Trải nghiệm Bán lẻ & POSM</span>
                <span className="text-indigo-700">28.5% (42.3 Tỷ ₫)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full w-[28.5%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1.5">
                <span className="text-slate-700">Chiến dịch Sáng tạo & Content</span>
                <span className="text-emerald-700">16.5% (24.5 Tỷ ₫)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full w-[16.5%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1.5">
                <span className="text-slate-700">Digital Marketing & Social</span>
                <span className="text-amber-700">10.0% (14.9 Tỷ ₫)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[10%]" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-blue-50 text-xs space-y-2">
            <span className="font-bold text-slate-700 block">Tỷ lệ Trạng thái Dự án (Từ đầu năm):</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl flex justify-between">
                <span className="text-slate-500 font-medium">Hoàn thành:</span>
                <strong className="text-emerald-600 font-bold">54%</strong>
              </div>
              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl flex justify-between">
                <span className="text-slate-500 font-medium">Đang chạy:</span>
                <strong className="text-blue-600 font-bold">32%</strong>
              </div>
              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl flex justify-between">
                <span className="text-slate-500 font-medium">Đấu thầu:</span>
                <strong className="text-amber-600 font-bold">9%</strong>
              </div>
              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl flex justify-between">
                <span className="text-slate-500 font-medium">Đã hủy:</span>
                <strong className="text-slate-400 font-bold">5%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
