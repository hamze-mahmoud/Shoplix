# Shoplix — GreenLight E‑Commerce

Full‑stack multilingual (EN/AR/HE, RTL‑aware) e‑commerce platform.

- **Frontend** (`my-app/`): React 19, Vite, Tailwind CSS v4, GSAP, react-i18next, React Router v7
- **Backend** (`backend/`): Node.js, Express, MongoDB/Mongoose, JWT (access + httpOnly refresh cookie), Socket.io, Cloudinary

## Features

- Product catalog with variants (color/size), categories tree, search + autocomplete
- Guest cart with merge-on-login, checkout with region-based shipping (ILS ₪)
- Product sales/discounts with storefront SALE badges
- Order lifecycle with real-time notifications (Socket.io) and WhatsApp order confirmation from the admin panel
- Review system with admin moderation (approve/reject before public)
- Admin dashboard: analytics, financial reports, products, categories, orders (PDF export), users, reviews, homepage banner manager
- Social login (Google / Facebook) — enabled via env keys
- Email verification, admin-managed hero banners with multilingual captions

## Getting started

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in your values
node server.js         # http://localhost:3000

# Frontend
cd my-app
npm install
cp .env.example .env   # optional social-login keys
npm run dev            # http://localhost:5173
```

Requires a local MongoDB (`MONGODB_URI`) and a Cloudinary account for image uploads.
