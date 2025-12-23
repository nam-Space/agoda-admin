# Agoda Admin Dashboard (agoda-admin)

## 1. Tổng quan dự án

**Agoda Admin Dashboard (agoda-admin)** là hệ thống quản trị trung tâm của nền tảng website du lịch Agoda. Đây là nơi dành cho các **vai trò cấp cao** như Admin, Quản lý marketing, Chủ khách sạn, Nhân viên vận hành… nhằm quản lý, giám sát và vận hành toàn bộ hệ thống du lịch.

Dự án đóng vai trò cực kỳ quan trọng trong toàn hệ sinh thái Agoda, giúp:

* Quản lý dữ liệu tập trung
* Theo dõi hoạt động kinh doanh
* Thống kê doanh thu, người dùng, dịch vụ
* Điều phối vận hành các dịch vụ du lịch

Admin Dashboard được xây dựng tách biệt với website khách hàng nhằm đảm bảo **bảo mật, hiệu năng và khả năng mở rộng**.

---

## 2. Mục tiêu xây dựng hệ thống Admin

Dự án được xây dựng với các mục tiêu chính:

* Mô phỏng **hệ thống quản trị doanh nghiệp thực tế**
* Xử lý **phân quyền phức tạp, đa vai trò**
* Hiển thị dữ liệu lớn dưới dạng bảng, biểu đồ
* Tối ưu trải nghiệm cho người vận hành hệ thống
* Phục vụ **đồ án, portfolio, case study**

---

## 3. Công nghệ sử dụng

### 3.1 Công nghệ chính

* **ReactJS**: Xây dựng SPA cho Admin
* **TailwindCSS**: Thiết kế giao diện hiện đại, nhất quán
* **Redux Toolkit**: Quản lý state toàn cục
* **WebSocket**: Nhận dữ liệu realtime (đơn hàng, chat, thông báo)

### 3.2 Thư viện & công cụ hỗ trợ

* Axios
* React Router DOM
* Chart Library (biểu đồ thống kê)
* JWT Authentication
* ESLint & Prettier

---

## 4. Kiến trúc Admin Frontend

### 4.1 Mô hình kiến trúc

```
Admin UI Components
        ↓
Admin Pages (Business Screens)
        ↓
Redux Toolkit (Global State)
        ↓
API Service Layer
        ↓
Agoda Backend (Django REST API)
```

### 4.2 Nguyên tắc thiết kế

* Phân tách rõ **UI – Logic – Data**
* Tối ưu cho **bảng dữ liệu lớn**
* Dễ mở rộng thêm module quản trị
* Dễ bảo trì, dễ debug

---

## 5. Hệ thống vai trò trong Admin

Admin Dashboard phục vụ các vai trò cấp cao:

1. **Admin hệ thống**
2. **Quản lý marketing**
3. **Chủ khách sạn**
4. **Nhân viên khách sạn**
5. **Người tổ chức sự kiện**
6. **Nhân viên vận hành chuyến bay**
7. **Nhân viên bán vé máy bay**

Mỗi vai trò có:

* Layout riêng
* Menu riêng
* Quyền thao tác khác nhau

---

## 6. Chức năng chi tiết theo module

### 6.1 Quản lý người dùng

* Xem danh sách user
* Phân quyền user
* Khoá / mở khoá tài khoản

### 6.2 Quản lý khách sạn

* CRUD khách sạn
* CRUD phòng
* Theo dõi tình trạng phòng
* Xem lịch đặt phòng

### 6.3 Quản lý taxi

* Quản lý tài xế
* Theo dõi chuyến đi
* Cập nhật trạng thái đơn taxi

### 6.4 Quản lý chuyến bay

* Quản lý chuyến bay
* Lịch trình bay
* Quản lý vé

### 6.5 Quản lý sự kiện & hoạt động

* CRUD sự kiện
* Quản lý lịch tổ chức
* Theo dõi lượt đăng ký

### 6.6 Marketing & nội dung

* Quản lý khuyến mãi
* Viết blog, cẩm nang du lịch
* Gán khuyến mãi cho dịch vụ

### 6.7 Thống kê & báo cáo

* Thống kê doanh thu
* Thống kê số lượng đơn
* Biểu đồ theo thời gian

---

## 7. Realtime & WebSocket

Admin Dashboard sử dụng WebSocket để:

* Nhận thông báo đơn hàng mới
* Nhận tin nhắn hỗ trợ
* Cập nhật trạng thái dịch vụ realtime

---

## 8. Quản lý State với Redux Toolkit

### 8.1 Các slice chính

* authSlice
* adminUserSlice
* hotelSlice
* bookingSlice
* flightSlice
* promotionSlice
* dashboardSlice

### 8.2 Lợi ích

* Quản lý dữ liệu lớn hiệu quả
* Đồng bộ dữ liệu realtime
* Dễ mở rộng module

---

## 9. Cấu trúc thư mục

```
agoda-admin/
├── src/
│   ├── components/      # Component dùng chung
│   ├── pages/           # Trang quản trị
│   ├── layouts/         # Layout Admin theo role
│   ├── redux/           # Store & slices
│   ├── services/        # API service
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Helper functions
│   └── assets/          # Icons, images
├── public/
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 10. Cài đặt & chạy dự án

### 10.1 Clone repository

```bash
git clone https://github.com/nam-Space/agoda-admin.git
cd agoda-admin
```

### 10.2 Cài đặt dependencies

```bash
npm install
```

### 10.3 Chạy môi trường development

```bash
npm run dev
```

Truy cập:

```
http://localhost:3001
```

---

## 11. Kết nối Backend

Admin Dashboard giao tiếp với:

* Agoda Backend (Django REST API)
* WebSocket Server

Cấu hình trong `.env`:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

---

## 12. Bảo mật

* JWT Authentication
* Kiểm soát quyền theo role
* Route guard cho Admin

---

## 13. Hiệu năng & khả năng mở rộng

* Pagination cho bảng dữ liệu lớn
* Lazy loading
* Tối ưu render component

---

## 14. Định hướng phát triển

* Thêm dashboard BI nâng cao
* Export báo cáo
* Audit log hệ thống
* CI/CD & deploy production

---

## 15. Mục đích & giá trị dự án

Dự án giúp:

* Hiểu sâu hệ thống quản trị doanh nghiệp
* Thực hành React cho admin dashboard
* Thiết kế UI cho dữ liệu lớn
* Hoàn thiện portfolio Fullstack

---

## 16. Tác giả

**Nam Nguyen**
GitHub: [https://github.com/nam-Space](https://github.com/nam-Space)

---

## 17. License

Project phục vụ mục đích **học tập & portfolio**, không sử dụng thương mại.
