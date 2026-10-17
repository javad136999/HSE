# HSE Asaluyeh
1. Supabase: run supabase.sql in SQL Editor.
2. GitHub: push this folder. 3. Vercel: import repo, set env vars from .env.example.
4. Cron (hourly) needs Vercel Pro; on Hobby change vercel.json to "0 3 * * *" or call /api/cron hourly from GitHub Actions with header Authorization: Bearer $CRON_SECRET.
