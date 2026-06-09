.PHONY: compose-up compose-down logs check-readiness test-compose

# Khởi động hệ thống, tự động build lại image nếu có thay đổi mã nguồn
compose-up:
	@echo "🚀 [Team-Core] Khởi động Docker Compose Stack..."
	docker compose up -d --build

# Dừng hệ thống và xóa sạch các container, network nội bộ, giải phóng RAM/CPU
compose-down:
	@echo "🛑 [Team-Core] Dừng hệ thống và dọn dẹp hạ tầng container..."
	docker compose down -v

# Xem log trực thời gian thực của cả 3 dịch vụ (api, db, ai-service)
logs:
	docker compose logs -f

# Kiểm tra nhanh trạng thái sẵn sàng (Readiness) của từng dịch vụ từ máy host
check-readiness:
	@echo "🔍 [1/3] Kiểm tra Express API (Port 8000)..."
	curl.exe http://localhost:8000/health
	@echo "\n🔍 [2/3] Kiểm tra Dịch vụ AI (Port 9000)..."
	curl.exe http://localhost:9000/health
	@echo "\n🔍 [3/3] Kiểm tra Trạng thái PostgreSQL (pg_isready)..."
	docker exec -it fit4110-db-lab05 pg_isready -U core -d coredb

# Chạy tự động kiểm thử end-to-end bằng Newman và xuất báo cáo nộp bài
test-compose:
	@echo "🧪 [Team-Core] Khởi chạy Newman Automation Test..."
	npm run test:compose