# Vercel Deployment

## Environment Variables

Add these in **Vercel Dashboard → Project → Settings → Environment Variables** (Production and Preview):

| Variable      | Description              | Example                    |
|---------------|--------------------------|----------------------------|
| `DB_HOST`     | Aiven MySQL host         | `mysql-xxx.aivencloud.com` |
| `DB_PORT`     | MySQL port               | `12035`                    |
| `DB_USER`     | Database user            | `avnadmin`                 |
| `DB_PASSWORD` | Database password        | (from Aiven console)       |
| `DB_NAME`     | Database name            | `defaultdb`                |
| `JWT_SECRET`  | Secret for auth tokens   | (any random string)        |

## Deployment Protection

If you see **401 Unauthorized** on login/signup pages:

1. Go to **Vercel Dashboard → Project → Settings → Deployment Protection**
2. Set protection to **None** for Production (or add a Production Custom Domain)

## Aiven MySQL

Ensure your Aiven MySQL service allows connections from Vercel:

- Default: `0.0.0.0/0` allows all
- If you restricted IPs: add Vercel's IPs or enable Static IPs (Pro) and allowlist them
