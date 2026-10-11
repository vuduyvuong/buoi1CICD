# BẢN SẮC — React Ecommerce Full Stack

Ứng dụng ecommerce gồm storefront React, trang quản trị, REST API Node.js/Express và Microsoft SQL Server.

## Chức năng

- Danh mục, tìm kiếm, sắp xếp và chi tiết sản phẩm.
- Giỏ hàng theo biến thể màu/size và mã ưu đãi.
- Đăng ký, đăng nhập, đăng xuất, quên/đặt lại mật khẩu.
- Mật khẩu băm bằng `scrypt`; session lưu bằng cookie `HttpOnly`.
- Checkout, kiểm tra tồn kho, tính lại giá trên server và tạo đơn hàng.
- Profile, lịch sử đơn hàng và hạng thành viên.
- API quản trị sản phẩm, tồn kho và trạng thái đơn hàng.
- Form hỗ trợ, chính sách, FAQ và responsive mobile.
- Docker Compose chạy frontend Nginx và backend riêng biệt.

## Chạy môi trường development

Yêu cầu Node.js 18 trở lên.

```bash
npm install
npm run server
```

Mở terminal thứ hai:

```bash
npm start
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

Create React App tự proxy `/api` sang port 4000.

## Kết nối SQL Server Express

Sao chép `.env.example` thành `.env`, sau đó chỉ thay `DB_PASSWORD` bằng mật khẩu
của tài khoản `sa`. Cấu hình mặc định dành cho instance trong ảnh là:

```env
DB_PROVIDER=mssql
DB_SERVER=localhost
DB_INSTANCE=SQLEXPRESS
DB_NAME=bansacdb
DB_USER=sa
DB_PASSWORD=your-sa-password
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

Kiểm tra kết nối trước khi chạy web:

```bash
npm run test:db
```

Khi backend đang chạy, `GET http://localhost:4000/api/health/database` trả về
database, server, số bảng và trạng thái schema. Nếu named instance không kết nối
được, hãy bật TCP/IP cho `SQLEXPRESS`, khởi động SQL Server Browser và restart
dịch vụ SQL Server.

Đặt `ADMIN_EMAIL` và một `ADMIN_PASSWORD` mạnh trong `.env`, sau đó tạo hoặc
đồng bộ tài khoản quản trị trong SQL Server bằng:

```bash
npm run seed:admin
```

## Tài khoản quản trị mặc định

- Email: `admin@bansac.vn`
- Mật khẩu: `Admin@123`

Hãy đặt `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong môi trường trước lần khởi động đầu tiên khi triển khai thật. Tham khảo [.env.example](.env.example).

## Kiểm thử và build

```bash
npm run test:api
npm run build
```

API test kiểm tra đăng ký, session, danh sách sản phẩm, mã ưu đãi, tạo đơn và lịch sử đơn hàng.

## Docker

```bash
docker compose up --build
```

Truy cập `http://localhost:8080`. Nginx phục vụ React và proxy `/api` sang container backend. Dữ liệu backend được giữ trong Docker volume `backend-data`.

## API chính

| Nhóm | Endpoint |
|---|---|
| Health | `GET /api/health` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` |
| Password | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| Products | `GET /api/products`, `GET /api/products/:id` |
| Admin products | `GET /api/admin/products`, `POST/PUT/DELETE /api/products` |
| Cart | `GET /api/cart`, `PUT /api/cart` |
| Promotions | `POST /api/promos/validate` |
| Orders | `POST /api/orders`, `GET /api/orders/my` |
| Admin orders | `GET /api/orders`, `PATCH /api/orders/:id/status` |
| Profile | `PUT /api/profile` |
| Support | `POST /api/contacts` |

## Dữ liệu

Khi `DB_PROVIDER=mssql`, `npm run server` sử dụng SQL Server thông qua
`server/sql-app.js`. Provider JSON cũ được giữ để chạy bộ kiểm thử độc lập và có
thể dùng bằng `DB_PROVIDER=json`; dữ liệu của provider này nằm tại
`server/data/db.json`.

### Microsoft SQL Server / SSMS

Thiết kế database SQL Server nằm trong [`database/sqlserver`](database/sqlserver/README.md). Chạy lần lượt:

1. `01_schema.sql`
2. `02_seed.sql`
3. `03_procedures.sql`

Schema bao gồm auth/session, RBAC, catalog, biến thể và tồn kho, giỏ hàng, khuyến mãi, đơn hàng, thanh toán, hỗ trợ và audit log.

## Lưu ý production

- Đổi mật khẩu admin mặc định trước khi chạy lần đầu.
- Cấu hình HTTPS để cookie session có thuộc tính `Secure`.
- Tích hợp SMTP cho email đặt lại mật khẩu.
- Tích hợp cổng thanh toán thật cho thẻ/chuyển khoản; backend hiện không lưu thông tin thẻ.
