# Prox - Real-Time Local Deals Worldwide

Prox is a real-time local deal discovery platform built with Next.js 16 (Turbopack), TypeScript, Tailwind CSS, and Supabase. It connects local businesses with customers nearby, measuring distances in precise meters rather than miles.

## Key Features
- **Real-Time Feed & Geolocation**: Live deals sorted and measured in meters using the Haversine formula.
- **1 Live Ad Per Business**: Strict database trigger and constraints ensuring each business maintains only 1 active live ad at a time.
- **AI Deal Titles**: Built-in AI generation for catchy deal titles powered by Ollama (llama3.2:latest).
- **Worldwide Support**: Multi-currency pricing (USD, EUR, GBP, THB, JPY, BRL, INR, Other).
- **Supabase Auth & Hardened RLS**: Secure authentication (Email/Password + Google OAuth) and strict Row-Level Security policies.
- **Resend Retention Emails**: Automated cron job and email templates notifying businesses when deals are expiring soon.
- **Affiliate & Referral System**: Referral codes (`PROX-XXXX`), share links (`prox.app/r/CODE`), WhatsApp/Facebook sharing, and credit rewards.
- **Legal Compliance**: Privacy Policy and Terms of Service included.

---

## Deployment Steps

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables (`.env.local`)**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   RESEND_API_KEY=re_your_resend_api_key
   CRON_SECRET=your_cron_secret
   ```

3. **Run Database Migrations**:
   Execute migrations `001.sql`, `002_worldwide.sql`, `003_rls.sql`, `004_email.sql`, and `005_affiliates.sql` in your Supabase SQL editor.

4. **Build for Production**:
   ```bash
   npm run build
   ```

5. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   ```
