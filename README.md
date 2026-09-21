# React E-commerce Store

Một ứng dụng mua sắm trực tuyến được xây dựng bằng React, cho phép người dùng duyệt sản phẩm theo danh mục, xem chi tiết sản phẩm, thêm vào giỏ hàng và quản lý đơn hàng đơn giản.

![demo](ecommerce.gif)

## Giới thiệu

Dự án này là một storefront thương mại điện tử demo với giao diện thân thiện, được chia theo các nhóm như:

- Nam
- Nữ
- Phụ kiện
- Tất cả sản phẩm

Người dùng có thể:

- Lọc và xem danh sách sản phẩm
- Xem chi tiết từng sản phẩm
- Thêm sản phẩm vào giỏ hàng
- Tìm hiểu các sản phẩm tương tự
- Điều hướng giữa các trang bằng React Router

## Công nghệ sử dụng

- React 15
- React DOM
- React Router DOM
- React Materialize
- Create React App
- CSS Modules / CSS tùy chỉnh
- Docker + Nginx

## Cấu trúc project

```bash
React-Ecommerce/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Accessories/
│   │   ├── App/
│   │   ├── BaseLayout/
│   │   ├── Cart/
│   │   ├── Clothes/
│   │   ├── Data/
│   │   ├── Items/
│   │   ├── Men/
│   │   ├── ShowProduct/
│   │   └── Women/
│   ├── index.css
│   └── index.js
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── package.json
├── README.md
└── .gitignore
```

## Yêu cầu môi trường

Trước khi chạy dự án, hãy đảm bảo máy của bạn đã cài đặt:

- Node.js >= 16
- npm hoặc yarn

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng ở môi trường phát triển

```bash
npm start
```

Sau khi chạy, ứng dụng sẽ mở ở:

```bash
http://localhost:3000
```

## Build production

```bash
npm run build
```

Kết quả build sẽ được tạo trong thư mục `build/`.

## Chạy bằng Docker

### Sử dụng Docker Compose

```bash
docker-compose up --build
```

Sau đó truy cập:

```bash
http://localhost:8080
```

### Hoặc build thủ công image

```bash
docker build -t react-ecommerce .
docker run -p 8080:80 react-ecommerce
```

## Cấu hình Docker

Dự án đã có:

- `Dockerfile` để build ứng dụng React và phục vụ bằng Nginx
- `docker-compose.yml` để chạy container nhanh chóng
- `nginx.conf` để hỗ trợ routing cho ứng dụng SPA (React Router)

## Ghi chú

Dự án này là một demo thương mại điện tử đơn giản, tập trung vào giao diện và trải nghiệm người dùng thay vì xử lý backend thật sự. Sản phẩm dữ liệu đang nằm trong `src/components/Data/index.js` và được sử dụng để hiển thị sản phẩm trên giao diện.

## License

Dự án này được cung cấp theo mục đích học tập và demo. Bạn có thể tùy chỉnh, mở rộng và phát triển thêm theo nhu cầu của mình.

## Tác giả

Nếu bạn đang sử dụng hoặc học dự án này, hãy coi đây là nền tảng để phát triển thêm chức năng như:

- đăng nhập/đăng ký
- thanh toán online
- quản lý đơn hàng
- API backend thực tế
- admin dashboard
- lưu giỏ hàng vào localStorage

Nếu bạn muốn, mình có thể tiếp tục viết thêm phiên bản README bằng tiếng Anh hoặc chỉnh lại theo kiểu portfolio / project submission chuẩn hơn.
