# Deploy Step
1. Dump Database using docker cli `mariadb` `icuconsult` to `/database` only when schema changes or the user requests it.
2. Commit and push the local repo to the remote repo.
3. SSH into the current production host for this repo.
4. cd to `/var/www`.
5. git clone or git pull, then force pull if needed.
6. cd to the deployed repo directory under `/var/www`.
7. Restore the database on the remote server docker only if the database changed.
8. You can use `db-cli --skill` on the remote server if database work is needed.
9. Copy `.env.example` to `.env`, then set the auth URLs in `.env.local` and `.env.production`.
10. Install dependencies and build: `npm install` and `npm run build`.
11. Check whether port `3010` is already running. Kill it before restarting.
12. Start the app on port `3010` for this repo with PM2 using `ecosystem.config.cjs`.

## Production Auth Notes
- Public app URL for this repo: `https://icucons.plkhealth.go.th`
- Health ID callback must match exactly: `https://icucons.plkhealth.go.th/api/auth/healthid`
- Keep `NEXT_PUBLIC_AUTH_URL` and `NEXT_PUBLIC_HEALTH_REDIRECT_URI` aligned with the public URL above.
- If the public host changes, update the env file and the OAuth redirect URI together.
- Keep database credentials and shared secrets in `.env`.
