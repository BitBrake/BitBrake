# BitBrake

React + Vite frontend project.

Deployment: https://bitbrake-4gc089dl7-bit-brake.vercel.app

## Setup

```bash
npm install
npm run dev
```

`npm run dev` starts the local server and opens the browser.

Local URL:

```txt
http://localhost:5173
```

## API

`.env.example` is the shared sample file. Keep it in Git.

`.env` is your local file. It is ignored by Git and can contain your real local
backend URL.

Create `.env` from `.env.example` if it does not exist:

```bash
copy .env.example .env
```

Local example:

```env
VITE_API_BASE_URL=http://localhost:8080
```
