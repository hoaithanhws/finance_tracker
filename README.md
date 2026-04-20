<<<<<<< HEAD
# finance_tracker
=======
# Personal Finance Tracker

Ứng dụng quản lý thu chi cá nhân — full-stack với FastAPI + React.

## Cấu trúc

```
project_finance_tracker/
├── backend/      # FastAPI + SQLAlchemy + PostgreSQL
└── frontend/     # React + Vite + Tailwind + Recharts
```

## Yêu cầu

- Python 3.10+
- Node.js 18+
- PostgreSQL (hoặc Supabase)

## Backend — chạy local

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env                # điền DATABASE_URL, SECRET_KEY...

uvicorn app.main:app --reload --port 8000
```

Mở Swagger UI: http://localhost:8000/docs

## Frontend — chạy local

```bash
cd frontend
npm install
cp .env.example .env                # VITE_API_URL=http://localhost:8000
npm run dev
```

Mở: http://localhost:5173

## API Endpoints

### Auth
- `POST /auth/register` — đăng ký (tự động tạo danh mục mặc định)
- `POST /auth/login` — trả về `access_token` + `refresh_token`
- `POST /auth/refresh` — làm mới access token
- `GET /auth/me` — thông tin user hiện tại

### Categories
- `GET /categories` — danh sách danh mục
- `POST /categories` — tạo danh mục mới
- `DELETE /categories/{id}` — xóa danh mục (không xóa được danh mục mặc định)

### Transactions
- `GET /transactions?type=&category_id=&month=&year=` — danh sách giao dịch
- `POST /transactions` — tạo giao dịch
- `PUT /transactions/{id}` — sửa giao dịch
- `DELETE /transactions/{id}` — xóa giao dịch
- `GET /transactions/summary?month=&year=` — tổng thu/chi/số dư theo tháng
- `GET /transactions/monthly-chart` — dữ liệu 6 tháng gần nhất cho biểu đồ

## Danh mục mặc định

Khi đăng ký, 12 danh mục mặc định được tạo sẵn:
- **Thu nhập**: Lương, Thưởng, Đầu tư, Khác
- **Chi tiêu**: Ăn uống, Di chuyển, Mua sắm, Giải trí, Hóa đơn, Y tế, Giáo dục, Khác

## Deployment

### Database — Supabase
1. Tạo project trên [supabase.com](https://supabase.com)
2. Settings → Database → Connection string → Copy URI dạng `postgresql://...`
3. Dán vào `DATABASE_URL` của Render

### Backend — Render.com
1. New Web Service → Connect GitHub repo → chọn thư mục `backend`
2. Build: `pip install -r requirements.txt`
3. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment: `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=30`, `REFRESH_TOKEN_EXPIRE_DAYS=7`, `FRONTEND_URL=https://your-frontend.vercel.app`

### Frontend — Vercel
1. Import repo → chọn thư mục `frontend`
2. Framework: Vite
3. Environment: `VITE_API_URL=https://your-api.onrender.com`

## Ghi chú

- Production nên chuyển sang Alembic migration thay cho `Base.metadata.create_all`.
- `SECRET_KEY` phải là chuỗi ngẫu nhiên mạnh (`python -c "import secrets; print(secrets.token_urlsafe(32))"`).
- CORS chỉ cho phép `FRONTEND_URL`, không để `*` ở production.
>>>>>>> 275aee7 (done task demo)
