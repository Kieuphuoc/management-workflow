'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { JobItem } from '../data/mockJmsData';

interface JobDetailStockProps {
  job: JobItem;
  formatVND: (val: number) => string;
}

export default function JobDetailStock({ job }: JobDetailStockProps) {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Streamlined Header */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Tổng hợp tồn kho POSM & Thiết bị
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Chưa có phiếu kho
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Quản lý xuất nhập tồn vật tư POSM và thiết bị dự án: <strong className="text-slate-700">{job.jobCode}</strong>
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
                <th className="py-3 px-4 w-32">Mã SKU</th>
                <th className="py-3 px-4 min-w-[220px]">Tên Vật Tư / Thiết Bị</th>
                <th className="py-3 px-3 text-center w-20">ĐVT</th>
                <th className="py-3 px-3 text-right w-28">Số Lượng Nhập</th>
                <th className="py-3 px-3 text-right w-24">Đã Xuất</th>
                <th className="py-3 px-3 text-right w-24">Tồn Kho</th>
                <th className="py-3 px-4 text-center w-28">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="py-12 px-4 text-center text-slate-400 bg-slate-50/20">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="w-8 h-8 text-slate-300" />
                    <span className="text-xs font-medium text-slate-500">
                      Chưa có dữ liệu vật tư kho cho dự án này.
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
