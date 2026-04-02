# WebĐọcTruyện

Trang web đọc truyện tranh đa thể loại (Manga, Manhua, Manhwa).

## Yêu cầu

- **Node.js** >= 20
- **Docker Desktop** (cho MongoDB + Redis)

## Cài đặt

```bash
# 1. Clone và install dependencies
npm install

# 2. Tạo file .env từ example
cp .env.example .env
```

Chỉnh sửa `.env` với các giá trị thực:

```env
MONGODB_URI=mongodb://localhost:27017/webdoctruyen
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-secret-key-here
```

## Chạy dự án

```bash
# 1. Khởi động MongoDB + Redis
docker-compose up -d

# 2. Chạy tất cả apps
npm run dev
```

Sau khi chạy:

| App | URL |
|-----|-----|
| Web (user) | http://localhost:3000 |
| Admin | http://localhost:3001 |
| API Server | http://localhost:5000 |
| Health check | http://localhost:5000/api/health |

## Cấu trúc monorepo

```
frontend/               # Module Frontend
  web/                  # Next.js - trang user (:3000)
  admin/                # Next.js - trang admin (:3001)
  ui/                   # Shared React components
  shared/               # Types, constants, utils cho frontend

backend/                # Module Backend
  server/               # Express API (:5000)
  shared/               # Types, constants, utils cho backend
```

## API Auth endpoints

```
POST /api/auth/register         # Đăng ký
POST /api/auth/login            # Đăng nhập
POST /api/auth/refresh          # Refresh token
POST /api/auth/logout           # Đăng xuất
POST /api/auth/forgot-password  # Quên mật khẩu
POST /api/auth/reset-password   # Đặt lại mật khẩu
GET  /api/auth/me               # Thông tin user hiện tại
```

## Scripts

```bash
npm run dev          # Chạy dev tất cả apps
npm run build        # Build tất cả
npm run format       # Format code với Prettier
```

## Dừng services

```bash
docker-compose down
```
