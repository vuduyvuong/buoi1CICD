# Stage 1: Build React App
FROM node:16-alpine AS build

WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng cho production (tạo thư mục build/)
RUN npm run build

# Stage 2: Serve với Nginx
FROM nginx:alpine

# Copy kết quả build từ Stage 1 sang thư mục phục vụ của Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy cấu hình Nginx hỗ trợ React Router SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80
EXPOSE 80

# Khởi chạy Nginx
CMD ["nginx", "-g", "daemon off;"]
