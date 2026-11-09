# Shofy — Multi-Platform E-Commerce (Web Store, Admin Panel & Android App)

A production e-commerce system running a real retail store: a customer web shop, a full admin dashboard and an Android app, all powered by one Node.js/MongoDB API.

**Live store & admin:** https://admin-panel-phi-steel-84.vercel.app
**API:** https://backend-nine-ruby-74.vercel.app/api/health
**Android app:** [`Shofy-mobile-app.apk`](./Shofy-mobile-app.apk) · source: [Shofy-mobile-app](https://github.com/Maaz9703/Shofy-mobile-app)

## What’s inside

**Customer web store**
- Product catalogue (800+ items) with search, categories and pagination
- Cart, wishlist, saved addresses and checkout with coupons
- Customer accounts with order history and order details

**Admin dashboard**
- Sales dashboard and reports with charts (Chart.js)
- Products and inventory with low-stock alerts, CSV import
- Orders, customers and customer insights
- Coupons, reviews moderation, activity feed and store settings

**Android app (React Native + Expo)**
- Native shopping experience on the same API, built to APK via GitHub Actions

**API (Node.js + Express)**
- JWT authentication with role-based admin routes
- Products, orders, reviews, coupons, wishlist, addresses, notifications and settings
- Optional Stripe payments; image uploads with Multer
- Serverless-ready on Vercel with cached MongoDB connections

## Tech stack

| Part | Tools |
| --- | --- |
| Web store + admin | React, Vite, React Router, Chart.js, Context API |
| Mobile | React Native, Expo, React Navigation, Reanimated, Lottie |
| Backend | Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Stripe, Multer |
| Hosting | Vercel (web + API), GitHub Actions (APK builds) |

## Project structure

```
admin-panel/   React + Vite — customer store (/) and admin dashboard
backend/       Express API (routes, controllers, models, middleware)
.github/       Workflow that builds the Android APK
```

## Run locally

```bash
# API
cd backend
cp env.example .env        # set MONGODB_URI and JWT_SECRET
npm install && npm run dev

# Create an admin (credentials come from your environment, never from the repo)
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-secret' node scripts/seedAdmin.js

# Web store + admin
cd ../admin-panel
npm install
echo VITE_API_URL=http://localhost:5000/api > .env
npm run dev
```

---

Built by [Maaz](https://github.com/Maaz9703).
