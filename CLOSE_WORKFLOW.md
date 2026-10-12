# Quy trình chốt kỳ kế toán trong bản demo

Ứng dụng được tổ chức theo **kỳ chốt tháng**. Mỗi kỳ có checklist công việc, người thực hiện, hạn xử lý, số liệu kết quả, báo cáo bộ phận và nhật ký thay đổi. Kế toán trưởng có thể tạo kỳ mới từ dashboard; hệ thống sinh bộ việc mẫu để điều chỉnh và phân công.

## Khai báo quy trình và điểm tích hợp

Kế toán trưởng có thể mở **Khai báo quy trình** để tùy chỉnh các nhóm và đầu việc áp dụng cho công ty hiện tại. Mẫu ban đầu gồm Mua hàng, Bán hàng, Kho, Giá thành / sản xuất, Thuế và Tổng hợp. Có thể thêm, sửa, xóa, sắp xếp lại nhóm/đầu việc; mỗi nhóm khai báo các nhóm cần hoàn tất trước, mỗi đầu việc khai báo các đầu việc phụ thuộc trong nhóm.

Tab **Gắn thao tác** lưu ánh xạ theo module, controller và màn hình. Voucher có thể gắn nút **Gửi duyệt** với một đầu việc; báo cáo có thể khai báo thao tác **Gửi thao tác** và **Lưu bộ lọc**. Tab **Nhật ký cấu hình** ghi người thực hiện, thời điểm và nội dung của mỗi lần thêm, sửa, xóa, sắp xếp hoặc bật/tắt liên kết.

Trang **Báo cáo bộ phận** có bộ lọc theo bộ phận, trạng thái và từ khóa. Người dùng có thể lưu bộ lọc cho tài khoản trình duyệt của mình rồi áp dụng lại. Các khai báo và bộ lọc ở bản demo lưu trong `localStorage`; chúng chưa gọi API ERP. Khi triển khai thật, backend cần cung cấp sự kiện từ controller, lưu cấu hình theo công ty trên máy chủ và kiểm tra quyền trước khi thực hiện.

## Luồng nghiệp vụ

1. Kho đối chiếu phiếu nhập/xuất, xác nhận trạng thái giao hàng, kiểm kê và chốt tồn.
2. Giá thành tập hợp chi phí; chỉ tính giá thành sau khi báo cáo kho được chốt. Giá thành bình quân hiển thị bằng `tổng giá thành / sản lượng hoàn thành` khi có đủ dữ liệu.
3. Công nợ đối chiếu phải thu, phải trả và tiền ngân hàng song song với kho/giá thành.
4. Kế toán tổng hợp chỉ kết chuyển sau khi báo cáo giá thành và công nợ đã chốt; sau đó lập và rà soát báo cáo tài chính.
5. Trưởng bộ phận duyệt công việc đã được nhân viên trình. Khi toàn bộ việc của bộ phận đã duyệt, người có quyền có thể chốt báo cáo và ghi chú. Số liệu tại thời điểm chốt được lưu thành snapshot. Kế toán trưởng là người xác nhận báo cáo tài chính.

Nhật ký thao tác nằm trong màn hình **Công việc & checklist** dưới dạng tab, để người dùng chuyển trực tiếp giữa danh sách việc và lịch sử thay đổi của kỳ chốt.

Nếu vẫn còn chênh lệch tồn kho/công nợ/ngân hàng, người chốt phải ghi chú giải trình. Mở lại báo cáo cần nêu lý do; các việc hoặc báo cáo phụ thuộc phải được trả lại/mở lại theo thứ tự ngược để tránh thay số liệu đầu vào của một báo cáo đã chốt.

| Vai trò | Dashboard | Checklist | Lịch | Báo cáo | Nhật ký |
| --- | --- | --- | --- | --- | --- |
| Kế toán trưởng | Toàn kỳ | Mọi bộ phận; tạo kỳ, phân công, duyệt | Toàn kỳ | Mọi bộ phận; xác nhận báo cáo tài chính | Toàn kỳ |
| Trưởng bộ phận | Tổng tiến độ mọi bộ phận | Xem mọi việc; phân công, duyệt việc bộ phận mình | Xem mọi việc, chỉ sửa việc bộ phận mình | Xem mọi bộ phận; chốt báo cáo bộ phận mình, riêng báo cáo tài chính do kế toán trưởng chốt | Bộ phận mình |
| Nhân viên | Việc của mình | Chỉ việc được giao | Không truy cập | Không truy cập | Việc của mình |

## Phạm vi dữ liệu và triển khai thực tế

Đây là **prototype frontend**. Dữ liệu mẫu và thay đổi được lưu bằng `localStorage` của trình duyệt. Chọn tên người dùng ở thanh bên là thao tác **xem thử vai trò**, không phải đăng nhập hay cơ chế bảo mật. Nhật ký ở bản demo chỉ phản ánh các thao tác trong trình duyệt này; xóa dữ liệu trình duyệt cũng xóa nhật ký. Các màn hình hiển thị số liệu người dùng nhập vào công việc, chưa tự lấy tồn kho, xuất hàng, công nợ hay bút toán từ ERP. Chỉ số lợi nhuận trước thuế hiển thị là ước tính từ doanh thu trừ chi phí được nhập, chưa thay thế báo cáo tài chính theo chuẩn kế toán.

Để sử dụng thật, cần có backend và cơ sở dữ liệu với giao dịch bất biến cho sự kiện audit, xác thực người dùng từ hệ thống nhân sự/SSO, kiểm tra quyền ở API, khóa kỳ/snapshot trên máy chủ, tích hợp ERP theo mã chứng từ và kỳ, đối chiếu số liệu nguồn, cũng như quy tắc phê duyệt phù hợp chính sách kế toán của doanh nghiệp. Các trường số liệu và hạn trong mẫu cần được đối chiếu với hệ thống ERP và lịch chốt thực tế trước khi triển khai.

## Bản đồ 3D trong tab Tổng quan

Bản đồ được dựng lại theo phong cách và cách tương tác của [Portside / 3dweb](https://github.com/Jarvis911/3dweb): thế giới thu nhỏ, nền kem, các khu vận hành kết nối, góc nhìn toàn cảnh và camera chuyển tới từng chặng. Mô hình được tạo bằng Three.js trong dự án, không cần tải tài nguyên 3D bên ngoài.

- Kéo chuột hoặc một ngón tay để xoay; cuộn hoặc chụm hai ngón tay để zoom.
- Chọn nhãn trên bản đồ hoặc một trong năm thẻ phía dưới để xem trạng thái, tiến độ và mở công việc.
- “Khám phá quy trình” chạy tour qua năm chặng. Chọn chặng, kéo, zoom hoặc tạm dừng sẽ dừng tour.
- “Toàn cảnh” và nút đặt lại đưa camera về toàn bản đồ. Nút tạm dừng ngừng xe và dòng dữ liệu chuyển động.
- Trạng thái và tiến độ lấy từ kỳ đang chọn; thay dữ liệu không dựng lại canvas. Cài đặt giảm chuyển động của hệ thống tắt chuyển động mặc định và chuyển camera tức thời.
- Khi WebGL không khả dụng hoặc mất context, giao diện chuyển sang minh họa có thể chọn chặng và xem công việc.

Chạy `npm run test:browser` khi máy chủ ở cổng 3060 đang hoạt động. Bộ kiểm tra dùng Chrome qua Playwright, kiểm tra chọn chặng, camera, tour, cảm ứng, các kích thước màn hình, giảm chuyển động và fallback. Có thể đặt `TEST_URL` và `BROWSER_CHANNEL` để đổi máy chủ/trình duyệt. Ảnh kiểm tra nằm trong `.artifacts/close-world/`.

Nếu thư mục `.next` đang bị một tiến trình khác giữ khóa, đặt biến môi trường `JMS_BUILD_DIR=.next-close-build` trước khi chạy `npm run build` để kiểm tra build trong thư mục riêng.

## Chạy ứng dụng

```bash
npm install
npm run dev
npm run build
```

Truy cập `http://localhost:3060`. Chọn vai trò mẫu ở cuối thanh bên để xem dashboard cấp trên/nhân viên. Trong màn hình Công việc, nhập số liệu và đánh dấu checklist trước khi trình duyệt. Chuyển sang trưởng bộ phận để duyệt, sau đó vào Báo cáo bộ phận để chốt.

## Tự tích theo thao tác, lặp lại và báo cáo chuỗi

**Gắn nút → ghi log → tự tích.** Tab *Gắn thao tác* có thêm loại thao tác **Chạy nghiệp vụ** (Tính giá, Kết chuyển, Lập tờ khai, Chốt sổ…) bên cạnh Submit và Lưu bộ lọc. Khi người dùng bấm nút trên màn hình controller (`ControllerActionButton`, dispatch `record-action`), hệ thống ghi một `ActionLog`, rồi tìm đầu việc đã gắn trong kỳ. Nếu người bấm là người phụ trách (hoặc quản lý bộ phận đó) và các việc trước đã xong thì tích toàn bộ checklist và chuyển *Hoàn thành*, ghi người và thời điểm từ log. Nếu còn việc trước, sai bộ phận hoặc báo cáo bộ phận đã chốt thì chỉ ghi log và báo lý do. *Lưu bộ lọc* chỉ ghi log. Việc có nút Submit/Chạy nghiệp vụ đang bật **không tích tay, không trình duyệt tay** được; việc không gắn nút vẫn đi luồng cũ (tích → trình → trưởng bộ phận duyệt). Trang **Mô phỏng controller** (`/admin/controllers`) dựng các nút này từ cấu hình để demo.

**Bộ phận theo đầu việc.** Mỗi đầu việc có bộ phận và người thực hiện riêng, nên một nhóm có thể đi qua nhiều bộ phận (ví dụ nhóm *Chốt kỳ giá thành*: Kho → Tổng hợp → Sản xuất → Tổng hợp).

**Lặp lại.** Form đầu việc có mục *Lặp lại*: Không lặp / Hàng tháng (hạn là ngày 1–31 hoặc cuối tháng của tháng sau kỳ) / Hàng tuần (mỗi tuần trong tháng của kỳ, theo thứ chọn; chạy độc lập, không chặn chuỗi chốt kỳ) / Hàng năm (chỉ sinh ở kỳ có đúng tháng đã chọn). Trong bản demo, *Không lặp* và *Hàng tháng* cho cùng kết quả vì quy trình vốn sinh theo kỳ chốt tháng. Mỗi lần phát sinh là một việc riêng có log riêng.

**Báo cáo Tiến độ thao tác** (`/admin/progress`). Bảng phẳng theo mẫu ERP với bộ lọc Từ ngày, Đến ngày, **Nhóm công việc**, Bộ phận, Trạng thái. Chọn nhóm thì thấy cả chuỗi liên bộ phận theo thứ tự phụ thuộc; lọc bộ phận chỉ làm mờ (hoặc ẩn khi tắt “Giữ ngữ cảnh chuỗi”). Trạng thái: Đúng hạn / Trễ hạn / Quá hạn / Chưa đến hạn, so ngày theo giờ Việt Nam. Khối thống kê theo đúng bộ lọc; xuất CSV UTF-8 mở được bằng Excel.

> Dữ liệu demo lưu ở khóa `arito-close-demo-v2` và `arito-workflow-config-v2`. Trình duyệt đã dùng bản cũ sẽ tự bắt đầu với dữ liệu mới.

Chạy kiểm tra: `npm test` (12 test cho log/tự tích/chặn tích tay, trạng thái hạn, thứ tự chuỗi, lặp tuần/năm, validate khai báo).
