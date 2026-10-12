'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Minus, Send, Sparkles, RotateCcw, 
  TrendingUp, FileText, CheckCircle2, ChevronRight,
  Bot, MessageSquare, DollarSign, Calendar, Boxes
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  chips?: string[];
  meta?: {
    type?: 'revenue' | 'guide' | 'pnl' | 'general';
    data?: any;
  };
}

const INITIAL_SUGGESTIONS = [
  'Tình hình doanh thu 2026',
  'Hướng dẫn cập nhật Job',
  'Doanh thu Arito & Lợi nhuận GP',
  'Xem tiến độ Gantt chart',
];

export default function AritoChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Xin chào anh/chị! 👋 Em là **Trợ lý ảo Arito AI** thuộc hệ thống JMS Arito Group.\n\nEm có thể hỗ trợ tra cứu nhanh số liệu doanh thu 2026, đối soát tài chính Arito ERP, hoặc hướng dẫn cập nhật dự án. Anh/chị cần xem thông tin gì ạ?',
      timestamp: 'Vừa xong',
      chips: INITIAL_SUGGESTIONS,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  // Handle answering query
  const handleQuery = (query: string) => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      let returnChips: string[] = [];

      const q = query.toLowerCase();

      if (q.includes('doanh thu') && (q.includes('2026') || q.includes('tình hình') || q.includes('năm'))) {
        botResponse = `📊 **Tình hình Doanh thu năm 2026 (Holding Arito Group):**\n\n` +
          `• **Tổng ngân sách Pipeline:** 148.5 Tỷ ₫ *(Contracted: 112.8 Tỷ ₫)*\n` +
          `• **Doanh thu thực tế Arito:** 96.2 Tỷ ₫ *(Đã thực thu: 88.4 Tỷ ₫)*\n` +
          `• **Công nợ phải thu (Receivables):** 7.8 Tỷ ₫\n` +
          `• **Dự án đang chạy:** 42 Jobs (Tăng +14.2% so với 2025)\n` +
          `• **Dự báo cao điểm:** Dòng tiền thu về lớn nhất tập trung vào tháng 9-11/2026 từ các chiến dịch Activation Unilever, Heineken và Vinamilk.`;
        returnChips = ['Hướng dẫn cập nhật Job', 'Doanh thu Arito & Lợi nhuận GP'];
      } else if (q.includes('hướng dẫn') || q.includes('cập nhật') || q.includes('job') || q.includes('sửa')) {
        botResponse = `📝 **Hướng dẫn các bước cập nhật Job trên JMS:**\n\n` +
          `1. **Chọn dự án:** Vào menu **Danh sách dự án** ở thanh sidebar bên trái, nhấp vào mã dự án cần cập nhật (ví dụ: *ARITO-026-452*).\n` +
          `2. **Chỉnh sửa thông tin qua các Tab:**\n` +
          `   • **Thông tin chung:** Sửa mốc thời gian Kick-off, phạm vi thực hiện.\n` +
          `   • **Nhân sự dự án & Thưởng:** Thêm/bớt nhân sự, tỷ lệ % KPI thưởng.\n` +
          `   • **Kỳ thanh toán & Tài chính:** Cập nhật đợt thanh toán, nhập mã PO, biên bản nghiệm thu.\n` +
          `   • **P&L / Tồn kho POSM / Quản lý tiến độ:** Xem báo cáo lãi lỗ, quản lý tồn kho và cập nhật tiến độ Gantt chart.\n` +
          `3. **Đồng bộ Arito ERP:** Bấm nút **"Đồng bộ Arito"** ở góc phải màn hình để đồng bộ tức thì số liệu sang kế toán.`;
        returnChips = ['Tình hình doanh thu 2026', 'Xem tiến độ Gantt chart'];
      } else if (q.includes('arito') || q.includes('lợi nhuận') || q.includes('gp') || q.includes('p&l')) {
        botResponse = `💰 **Tổng quan Lợi nhuận & Đối soát Arito ERP:**\n\n` +
          `• **Tỷ lệ GP bình quân:** **75.8%** *(Vượt chỉ tiêu +3.5%)*\n` +
          `• **Số đợt thanh toán đã đồng bộ:** 86/113 đợt nghiệm thu thành công\n` +
          `• **Hệ thống P&L:** Đã sẵn sàng kết nối tự động với phân hệ sổ cái Arito ERP ngay khi hoàn tất quyết toán hợp đồng.`;
        returnChips = ['Tình hình doanh thu 2026', 'Hướng dẫn cập nhật Job'];
      } else if (q.includes('gantt') || q.includes('tiến độ') || q.includes('task') || q.includes('công việc')) {
        botResponse = `📅 **Về tính năng Quản lý tiến độ (Gantt Chart):**\n\n` +
          `• Màn hình Job Detail hiện có tab **Task Management** với biểu đồ Gantt phân bổ theo 4 tuần.\n` +
          `• Bao gồm 5 đầu việc chính: *Brief, Thiết kế 3D, Sản xuất POSM, Vận chuyển lắp đặt, Nghiệm thu Arito*.\n` +
          `• Anh/chị có thể tick trực tiếp vào vòng tròn đầu dòng để cập nhật trạng thái Hoàn thành theo thời gian thực!`;
        returnChips = ['Tình hình doanh thu 2026', 'Hướng dẫn cập nhật Job'];
      } else {
        botResponse = `Cảm ơn câu hỏi của anh/chị về: "${query}".\n\nDữ liệu demo hệ thống JMS đã được cập nhật số liệu mới nhất của năm 2026. Anh/chị có thể bấm vào các gợi ý bên dưới để tra cứu tức thì:`;
        returnChips = INITIAL_SUGGESTIONS;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        chips: returnChips,
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleQuery(inputValue);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Mascot Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-16 rounded-full bg-white border-2 border-blue-500 shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all duration-300 p-1 cursor-pointer flex items-center justify-center overflow-hidden"
          title="Trợ lý ảo Arito AI - JMS Assistant"
        >
          {/* Animated Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 animate-pulse" />
          
          {/* Mascot Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Mascots.png"
            alt="Arito AI Mascot"
            className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-300"
          />

          {/* Online green dot */}
          <span className="absolute top-1 right-1 z-20 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
          </span>
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="w-[380px] sm:w-[410px] h-[560px] max-h-[calc(100vh-6rem)] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden animate-scaleUp">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md shrink-0 overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Mascots.png"
                  alt="Arito Mascot"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight">Arito AI Assistant</h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-white/20 rounded-full uppercase tracking-wider">
                    JMS Demo
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sẵn sàng hỗ trợ trực tuyến</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMessages([
                    {
                      id: 'welcome-reset',
                      sender: 'bot',
                      text: 'Em đã đặt lại cuộc hội thoại. Anh/chị cần tra cứu thông tin gì về doanh thu 2026 hoặc dự án ạ?',
                      timestamp: 'Vừa xong',
                      chips: INITIAL_SUGGESTIONS,
                    },
                  ]);
                }}
                title="Làm mới cuộc trò chuyện"
                className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ"
                className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng chat"
                className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-white border border-blue-200 p-0.5 shrink-0 shadow-2xs overflow-hidden mt-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Mascots.png" alt="Arito" className="w-full h-full object-contain" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-sm font-medium'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {/* Message Text with bold format support */}
                    <div className="text-xs space-y-1">
                      {msg.text.split('\n').map((line, i) => {
                        // Simple parser for bold text **bold**
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div key={i}>
                            {parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                              }
                              return <span key={pIdx}>{part}</span>;
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  {msg.chips && msg.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleQuery(chip)}
                          className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200/80 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                        >
                          <span>{chip}</span>
                          <ChevronRight className="w-3 h-3 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span className={`text-[10px] text-slate-400 block px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-full bg-white border border-blue-200 p-0.5 shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/Mascots.png" alt="Arito" className="w-full h-full object-contain animate-spin" />
                </div>
                <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Gợi ý:
            </span>
            <button
              type="button"
              onClick={() => handleQuery('Tình hình doanh thu 2026')}
              className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 transition-colors shrink-0 cursor-pointer"
            >
              Doanh thu 2026
            </button>
            <button
              type="button"
              onClick={() => handleQuery('Hướng dẫn cập nhật Job')}
              className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 transition-colors shrink-0 cursor-pointer"
            >
              Hướng dẫn Job
            </button>
            <button
              type="button"
              onClick={() => handleQuery('Doanh thu Arito & Lợi nhuận GP')}
              className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 transition-colors shrink-0 cursor-pointer"
            >
              Arito GP
            </button>
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi (Doanh thu 2026, hướng dẫn...)"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={() => handleQuery(inputValue)}
              disabled={!inputValue.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
