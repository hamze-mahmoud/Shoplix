# Deploying Shoplix

Backend → **Render** · Frontend → **Vercel** · Database → **MongoDB Atlas**.
All three have a free tier. Do the steps in order; each produces a URL the next
step needs.

---

## 1. Database — MongoDB Atlas (free)

1. Create an account at https://www.mongodb.com/cloud/atlas → build a **free
   M0 cluster** (pick a region near you).
2. **Database Access** → add a user (username + password) — save these.
3. **Network Access** → Add IP → **Allow access from anywhere** (`0.0.0.0/0`)
   (Render's IPs are dynamic).
4. **Connect → Drivers** → copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/greenlight`
   Add the db name `greenlight` before the `?` (or at the end). This is your
   `MONGODB_URI`.
5. **Move your data up** (products, categories, etc. currently in local Mongo):
   ```bash
   mongodump --uri="mongodb://localhost:27017/greenlight" --out=./dump
   mongorestore --uri="<your Atlas URI>" ./dump/greenlight
   ```
   (Install MongoDB Database Tools if `mongodump` is missing.)

## 2. Backend — Render (free)

1. Push the latest code to GitHub (see "Pushing" below).
2. https://render.com → New → **Blueprint** → connect the repo. Render reads
   `render.yaml` and creates the `shoplix-backend` web service.
3. In the service's **Environment** tab, fill every `sync:false` var from your
   local `backend/.env` — plus:
   - `MONGODB_URI` = the Atlas string from step 1
   - `FRONTEND_URL` = your Vercel URL (fill after step 3, then redeploy)
   - `SERVER_URL` = this service's own URL (`https://shoplix-backend.onrender.com`)
4. Deploy. When live, open the URL — you should see
   `{"status":"ok",...}`. Note this **permanent backend URL**.

## 3. Frontend — Vercel (free)

1. https://vercel.com → New Project → import the repo.
2. **Root Directory** → `my-app`. Framework auto-detects **Vite**.
3. **Environment Variables**:
   - `VITE_API_URL` = `https://shoplix-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://shoplix-backend.onrender.com`
4. Deploy → note the **frontend URL** (`https://shoplix.vercel.app`).

## 4. Wire the two together

1. Back in Render, set `FRONTEND_URL` = the Vercel URL, then **Manual Deploy →
   Clear build cache & deploy** (so CORS + cookies + bot links use it).
2. Done — visit the Vercel URL; the store is live on the internet.

## 5. WhatsApp webhook — configure ONCE, forever

In the Meta app dashboard → Webhooks → **WhatsApp Business Account**:
- Callback URL: `https://shoplix-backend.onrender.com/api/whatsapp/webhook`
- Verify token: value of `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- Subscribe to **messages**

Because the backend URL is now permanent, you never touch this again.

---

## Pushing the code

Render and Vercel deploy from GitHub, so the deployment files + latest code
must be pushed:
```bash
git add -A
git commit -m "Add deployment config (Render + Vercel), production cookies/env"
git push
```

## Notes

- **Free tier sleep**: Render's free plan sleeps after 15 min idle → the first
  request (or WhatsApp reply) wakes it in ~50s. Upgrade to Starter ($7/mo) for
  always-on. Because customers message first (opening the 24h window), a slightly
  slow first reply is acceptable, but always-on is nicer.
- **Secrets**: never commit `backend/.env` (it's gitignored). All secrets live in
  the Render/Vercel dashboards.
- `NODE_ENV=production` (set in `render.yaml`) flips the refresh cookie to
  `Secure + SameSite=None` so cross-domain auth (Vercel ↔ Render) works.
