# JSA Forge Website

React- and Vite-based website for JSA Forge with a separate API artifact for the contact form. The structure is intentionally aligned with the `sabrecommandtrainer` project:

- frontend in the project root
- API in `artifacts/api-server`
- production Lightsail files in `deploy/aws/lightsail`
- no SMTP or Turnstile secrets committed to the repository

## Project Structure

- `src/` contains the React frontend
- `artifacts/api-server/` contains the contact form API
- `public/assets/` contains replaceable images and logo assets
- `deploy/aws/lightsail/` contains the production deployment setup

## PowerShell Quick Start

Open PowerShell in the project folder and run:

```powershell
cd C:\Codex\JSA_Forge
$env:VITE_CONTACT_EMAIL="your@email.com"
$env:VITE_DISCORD_LINK="https://discord.gg/your-link"
$env:CONTACT_EMAIL="your@email.com"
$env:SMTP_HOST="your.smtp.host"
$env:SMTP_PORT="587"
$env:SMTP_USER="your-smtp-user"
$env:SMTP_PASS="your-smtp-password"
$env:TURNSTILE_SITE_KEY="1x00000000000000000000AA"
$env:TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
npm install
npm run dev
```

This starts:

- the frontend on `http://localhost:5173`
- the API on `http://localhost:3001`

In development, Vite automatically proxies `/api/*` requests to the local API.

To stop the project, press `Ctrl + C` in PowerShell.

Notes:

- This approach avoids storing real SMTP or Turnstile secrets in a local project file.
- The Turnstile keys above are Cloudflare's official test keys for local development. Replace them with your real keys before going live.

## Local Environment Variables

For local development, the recommended approach is to set variables directly in PowerShell before starting the project.

If you still prefer a local `.env` file, the app also supports that, but it is optional.

Used variables:

- `VITE_CONTACT_EMAIL`
- `VITE_DISCORD_LINK`
- `CONTACT_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- optional `MAIL_FROM_NAME`

Important:

- `VITE_*` values are public frontend build values
- SMTP and Turnstile secrets stay server-side in the API
- the production Lightsail setup is prepared in [deploy/aws/lightsail/README.md](./deploy/aws/lightsail/README.md)

## Development

If you already installed dependencies and set the required environment variables in your current PowerShell session, you can start the project with:

```powershell
npm run dev
```

If you only want to install dependencies again later:

```powershell
npm install
```

## Production Build

Build the frontend and API:

```powershell
npm run build
```

Start the built application:

```powershell
npm run start
```

`npm run start` launches the built API server, which also serves the frontend from `dist/`.

## Contact Form Flow

The contact form works like in `sabrecommandtrainer`:

- the frontend loads `/api/contact/config`
- Cloudflare Turnstile creates a token
- the backend validates the token server-side
- the message is sent via SMTP using `nodemailer`

## Replacing Assets

You can replace logo, portrait and project images later in `public/assets/`:

- `logo-forge.svg`
- `portrait-placeholder.svg`
- `project-placeholder.svg`
- `sabre-command-trainer-home.png`

## AWS Lightsail

The production deployment path is prepared in [deploy/aws/lightsail](./deploy/aws/lightsail/README.md):

- Docker image for app + API
- `compose.yaml`
- `Caddyfile`
- `.env.production.example`
- `deploy.sh`
- GitHub workflow for GHCR + Lightsail
