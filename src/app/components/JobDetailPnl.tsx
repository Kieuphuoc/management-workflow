'use client';

import React from 'react';
import { TrendingUp, FileSpreadsheet } from 'lucide-react';
import { JobItem } from '../data/mockJmsData';

interface JobDetailPnlProps {
  job: JobItem;
  formatVND: (val: number) => string;
  onSyncArito?: () => void;
  isSyncing?: boolean;
}

export default function JobDetailPnl({ job, formatVND, onSyncArito, isSyncing }: JobDetailPnlProps) {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Streamlined Header */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                P&L Statement (Báo cáo Lãi/Lỗ)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                Chờ quyết toán Arito
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Mục tiêu GP: <strong className="text-slate-700">{job.grossProfitPercent.toFixed(1)}%</strong>
              <span className="mx-1.5">•</span>
              Doanh thu: <strong className="text-blue-700 font-mono">{formatVND(job.potentialBudget)}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Streamlined Table Header with Empty State */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 select-none">
                <th className="py-3 px-4 w-16 text-center">STT</th>
                <th className="py-3 px-4 w-32">Mã Khoản Mục</th>
                <th className="py-3 px-4 min-w-[220px]">Hạng Mục P&L</th>
                <th className="py-3 px-4 text-right min-w-[130px]">Dự Toán</th>
                <th className="py-3 px-4 text-right min-w-[130px]">Thực Tế Arito</th>
                <th className="py-3 px-4 text-right min-w-[120px]">Chênh Lệch</th>
                <th className="py-3 px-4 text-center w-28">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center text-slate-400 bg-slate-50/20">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                    <span className="text-xs font-medium text-slate-500">
                      Chưa phát sinh dữ liệu giao dịch P&L từ Arito ERP cho dự án này.
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
