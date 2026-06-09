# Readiness Checklist - Nhóm 4-1

Hệ thống được coi là sẵn sàng vận hành cho Plug-a-thon khi vượt qua đầy đủ 6 điểm kiểm định sau:

- [x] **1. Database Readiness (Cơ sở dữ liệu)**
  - Lệnh `pg_isready` trong container `fit4110-db-lab05` xác nhận trạng thái sẵn sàng.
  - Endpoint `/evaluations` truy vấn và lấy được dữ liệu thực tế từ các bảng trong DB.

- [x] **2. AI Service Readiness (Dịch vụ AI)**
  - Endpoint `/health` của `ai-service` trả về status `200 OK`.
  - Phản hồi từ AI (dự đoán `alert`, độ tin cậy `0.92`) được tích hợp mượt mà.

- [x] **3. API Ingestion & Connection Readiness (Mạch kết nối)**
  - API nhận dữ liệu từ Client, chuyển tiếp qua AI Service lấy kết quả, sau đó lưu toàn bộ vào DB mà không gặp lỗi cô lập kết nối.

- [x] **4. Security & Environment Configuration (Biến môi trường & Bảo mật)**
  - File `.env` được tách biệt hoàn toàn; không chứa credentials thật trong mã nguồn Git.
  - Container chính (`api`) được cấu hình thực thi bằng tài khoản an toàn `non-root` (`user: "10001:10001"`).

- [x] **5. Network Isolation (Cô lập mạng nội bộ)**
  - Các service kết nối nội bộ khép kín thông qua mạng ảo định nghĩa riêng `team-internal`.
  - Giữ nguyên cấu trúc phân tách cổng tường minh (API: `8000`, AI: `9000`, DB: `5432`).

- [x] **6. Artifact and Version Registry Alignment (Định danh phiên bản)**
  - Image được đóng gói và gán nhãn chính xác theo quy ước: `v0.1.0-team-4-1`.
  - Sẵn sàng push bản build sạch lên Registry (Docker Hub/ghcr.io).