# Synergy Reader

A study-companion web app: pick a textbook, climb a chapter-by-chapter progress map, read your own PDF,
highlight / underline / draw on pages, keep notes, ask an AI doubts, take a recap quiz and earn stars.

## Project structure
```
synergy-reader/
├── frontend/
│   ├── index.html     page layout (shelf, map, reader, notes, menu)
│   ├── style.css      themes (light/dark + pink/blue/green), layout, animations
│   └── app.js         all app logic (state, PDF.js reader, annotations, notes, quiz, API calls)
├── backend/
│   ├── server.js      Node + Express: serves frontend, REST API, proxies AI calls
│   ├── db.js          database layer: opens SQLite, saves and loads progress
│   ├── schema.sql     the 10 database tables (created automatically)
│   ├── books.json     the 3 books and their chapters (loaded into the database)
│   ├── package.json
│   ├── .env.example   copy to .env (optional AI key)
│   └── data/          synergy.db (the SQLite database) is created here at runtime
└── README.md
```

## Run locally (VS Code)
1. Install Node.js 22.13 or newer (the LTS version) from https://nodejs.org. SQLite is built into it, so no separate database software is needed.
2. Open the `synergy-reader` folder in VS Code (File > Open Folder).
3. Open the terminal (Ctrl + `) and run:
   ```
   cd backend
   npm install
   copy .env.example .env      (Windows)   |   cp .env.example .env   (Mac/Linux)
   npm start
   ```
4. Open http://localhost:3000 in the browser. (Check the database at http://localhost:3000/api/books)
5. Optional AI features (summary, doubts, quiz): put your key in `backend/.env` as `ANTHROPIC_API_KEY=...` and restart.
   Without a key everything else works; AI buttons show a message.
6. Internet is needed once for PDF.js, jsPDF and the Fredoka font (loaded from CDN).
   The textbook PDFs are opened from your own computer and never uploaded.

## Database
Progress is stored in an SQLite database file (`backend/data/synergy.db`) with these tables:
`book`, `chapter`, `student`, `student_book`, `note`, `annotation`, `quiz_result`, `quiz_flag`, `daily_log`, `setting`.
The full SQL is in `backend/schema.sql`. To look inside it you can use the free "DB Browser for SQLite" program, or the
VS Code extension "SQLite Viewer". If you used the older version, your `data/state.json` is imported into the database
automatically the first time the server starts.

## Push to GitHub
```
cd synergy-reader
git init
git add .
git commit -m "Synergy Reader - field project"
git branch -M main
git remote add origin https://github.com/<your-username>/synergy-reader.git
git push -u origin main
```
(Create the empty repo `synergy-reader` on github.com first. `.env` and `node_modules` are ignored by `.gitignore`, so your key is never uploaded.)

## Deploy
**Option A - full app (frontend + backend) on Render.com (free)**
1. render.com > New > Web Service > connect the GitHub repo.
2. Build command: `cd backend && npm install`   Start command: `cd backend && npm start`
3. Environment: add `ANTHROPIC_API_KEY` (optional) and set Node version 22 or newer (`NODE_VERSION=22`).
   Note: on the free plan the disk is reset on every deploy, so attach a Render Disk (or run locally) if you want the database to last.
   Deploy, open the URL Render gives you.

**Option B - frontend only on GitHub Pages (no backend or database; progress stays in the browser, AI is off)**
```
cp -r frontend docs
git add docs && git commit -m "Add docs for Pages" && git push
```
Then on GitHub: Settings > Pages > Branch `main`, folder `/docs` > Save.
