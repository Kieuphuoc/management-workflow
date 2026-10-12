# JMS - Job Management & Financial Reconciliation System

> Giao diện hiện hành là prototype **quản lý chốt kỳ kế toán**. Xem [quy trình, phân quyền và giới hạn dữ liệu](./CLOSE_WORKFLOW.md). Phần mô tả dự án bên dưới là tài liệu của giao diện JMS trước đây.

**Arito Group · Built on Next.js 16 & Tailwind CSS v4**

---

## 📌 Giới thiệu dự án
Hệ thống **JMS (Job Management System)** được thiết kế chuyên biệt cho Arito Group nhằm:
- Quản lý vòng đời dự án (Job) từ giai đoạn Tạo mới (`Create Job`), Khởi chạy (`Running`), Nghiệm thu & Quyết toán (`Done / Reconciliation`), đến Báo cáo (`Dashboard`).
- Tích hợp biểu đồ tài chính, kiểm soát doanh thu, chi phí, chỉ số gross margin, CSAT, và trạng thái thanh toán.
- Tích hợp với **Arito ERP** và bổ sung phân hệ **Quản trị thực thi công việc (3 bước: Khai báo ➔ Nhật ký ➔ Báo cáo SLA)**.
- 📖 **Chi tiết kiến trúc API:** Xem tài liệu đặc tả tái sử dụng và tích hợp API tại [`API_REUSE_JMS_ARITO.md`](./API_REUSE_JMS_ARITO.md).
- Giao diện tối ưu, hiện đại, hỗ trợ thu gọn/mở rộng sidebar linh hoạt và chuyển đổi tab siêu tốc với animation 60fps.

---

## 🎨 Hệ thống Thiết kế & Bảng màu (Design System & Color Tokens)

| Thành phần / Trạng thái | Mã màu (HEX / Tailwind) | Ý nghĩa & Vị trí ứng dụng |
|---|---|---|
| **Nền tổng thể (Background)** | `#f0f5fc` | Màu nền dịu mắt công nghệ cho toàn bộ ứng dụng |
| **Màu thương hiệu chính (Primary)** | `#2563eb` (`blue-600`) | Nút thao tác chính (+ New Job, Submit), tab đang chọn, icon active |
| **Primary Hover / Active** | `#1d4ed8` (`blue-700`) | Trạng thái rê chuột và click |
| **Accent / Thẻ JMS** | `#1d4ed8` trên nền `#eff6ff` (`blue-50`) | Tag định danh JMS, viền xanh `border-blue-200` |
| **Running Status** | `bg-blue-100 text-blue-800` | Trạng thái Job đang thực hiện |
| **Completed / Done Status** | `bg-emerald-100 text-emerald-800` | Trạng thái Job đã hoàn tất |
| **Urgency / Overdue** | `bg-rose-100 text-rose-800` | Cảnh báo trễ hạn, rủi ro tài chính |
| **Draft Status** | `bg-amber-100 text-amber-800` | Bản nháp đang chuẩn bị |
| **Text chính (Headings & Bold)** | `#0f172a` (`slate-900`) | Tiêu đề Job, tên khách hàng, số liệu quan trọng |
| **Text phụ (Labels & Body)** | `#475569` (`slate-600`) / `#64748b` (`slate-500`) | Nhãn trường form, mô tả dự án |
| **Viền & Ngăn cách (Borders)** | `#e2e8f0` (`slate-200`) / `#dbeafe` (`blue-100`) | Viền card, viền input, ngăn cách danh sách |

### 🔤 Font chữ
- **Font gia đình:** `Quicksand` (Google Fonts), fallback `sans-serif`.
- **Weights:** `300`, `400`, `500`, `600`, `700`.

---

## 📂 Cấu trúc thư mục (Directory Structure)

```text
jms-web/
├── public/
│   ├── favicon.png                  # Favicon Arito Group
│   ├── logo-omo-matic.png           # Logo OMO Matic
│   ├── Close_Up_logo.webp           # Logo Close Up
│   ├── Logo-Unilever.webp           # Logo Unilever
│   └── brands/                      # Thư mục chứa tài nguyên thương hiệu
│       └── arito-wordmark.png
├── src/
│   └── app/
│       ├── components/
│       │   ├── BrandLogos.tsx       # Logo component cho Client và Brand (OMO, Close Up, Unilever, ...)
│       │   ├── CreateJob.tsx        # Màn hình tạo mới Job (Client Info, Description, dấu * đỏ to)
│       │   ├── CustomSelect.tsx     # Dropdown Select tùy biến cao cấp
│       │   ├── Dashboard.tsx        # Báo cáo tổng quan, chỉ số tài chính, biểu đồ
│       │   ├── JobDetail.tsx        # Màn hình chi tiết Job (Tabs General, Client, Members, Payment)
│       │   └── JobList.tsx          # Danh sách Job với bộ lọc ngày/tháng/năm tùy biến
│       ├── data/
│       │   └── mockJmsData.ts       # Dữ liệu mô phỏng độc lập chuẩn cấu trúc
│       ├── jms/
│       │   └── page.tsx             # Route dự phòng /jms
│       ├── globals.css              # Style Tailwind v4, biến màu, keyframes chuyển tab, scrollbars
│       ├── layout.tsx               # Root layout tích hợp Quicksand & JMS Metadata
│       └── page.tsx                 # Trang chủ hiển thị trực tiếp JMS
├── next.config.ts                   # Cấu hình Next.js
├── package.json                     # Thông tin gói và dependencies độc lập
├── postcss.config.mjs               # Cấu hình PostCSS Tailwind v4
├── tsconfig.json                    # Cấu hình TypeScript
└── README.md
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Chạy môi trường phát triển (Local Dev)
Cổng mặc định là `3060`:
```bash
npm run dev
```
Truy cập: `http://localhost:3060` (hoặc `http://localhost:3060/jms`).

### 3. Build sản phẩm (Production)
```bash
npm run build
npm run start
```
