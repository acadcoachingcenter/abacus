# ACAD Abacus

Interactive Soroban abacus training app for ACAD. Domain: **abacus.acadapp.in**

## What's in this delivery

This delivery covers **Phase 1, 2, and 4** (auth + dashboard) of the build
plan. Phase 4 needed real password hashing and a database, so it's the
first phase that requires D1 and a couple of secrets — everything below
walks through setting that up.

- ✅ Fully working, realistic Soroban abacus (1 heaven bead + 4 earth beads
  per rod), physically accurate bead-stacking behavior
- ✅ Works with mouse click, mouse drag, finger tap, and finger drag —
  all through the Pointer Events API, no separate touch/mouse code paths
- ✅ Smooth spring animations on every bead move (Framer Motion)
- ✅ Live value readout with Show/Hide toggle
- ✅ Undo / Redo / Reset, with keyboard support (Tab + Enter/Space/arrows)
- ✅ Optional synthesized bead-click sound (Web Audio, no audio files to ship)
- ✅ Fully responsive — beads resize with `clamp()` based on rod count and
  viewport width, no horizontal overflow on mobile
- ✅ Landing page with hero, an interactive mini-abacus demo, a "type a
  number and try to build it" practice panel, and the curriculum roadmap
- ✅ Centralized branding config (`src/data/branding.js`)
- ✅ Accessible: ARIA labels/roles on every rod, visible focus rings,
  `prefers-reduced-motion` respected
- ✅ **Student registration & login** (`/register`, `/login`), real
  password hashing (PBKDF2-SHA256, Web Crypto — no plaintext passwords,
  ever), HttpOnly signed session cookies (7-day expiry)
- ✅ **Forgot / reset password** flow, emailed via Resend
- ✅ **Protected `/dashboard`** — redirects to `/login` if not signed in,
  shows real profile data from D1 (level, streak, best score, practice
  time), with an honest note that detailed progress tracking arrives in
  Phase 5 rather than faking numbers
- ✅ All auth endpoints live under `/api/auth/*` as Cloudflare Pages
  Functions, validate input, and never leak whether an email is registered

## What's scaffolded but not yet built

The folder structure below matches the full spec so later phases drop in
cleanly, but these are **not implemented yet**:

| Phase | Feature | Status |
|---|---|---|
| 3 | Learn → Watch → Practice → Test lesson engine, full hand/pointer demo animations, practice generator, Flash Anzan, Speed Challenge | Not started |
| 5 | D1 progress tracking (lessons/exercises/sessions actually writing to the DB) | Schema written, `users`/`students`/`password_resets` tables live; progress tables not wired to any UI yet |
| 6 | Admin dashboard, class management, curriculum CMS | Not started |
| 7 | Classroom projector mode, achievements | Not started |
| 8 | Service worker offline sync | Manifest + `_redirects` in place, no service worker yet |

`schema.sql` contains the full table design from the spec. The `users`,
`students`, and `password_resets` tables are actively used by Phase 4;
the rest (classes, curriculum, progress, sessions, challenges,
achievements) are defined and ready but not yet queried by any code.

I'd suggest building **Phase 3 next** (the lesson engine + practice
generator), since it's what turns "a working abacus" into "a teaching
tool," before auth/D1/admin — happy to start on that whenever you're ready.

## Project structure

```text
abacus-acad/
├── src/
│   ├── components/abacus/      ← SorobanAbacus, AbacusDemoPanel (built)
│   │   common/                 ← AuthLayout, ProtectedRoute (built)
│   │   lessons/ dashboard/ admin/   ← empty, Phase 3/6
│   ├── pages/                  ← Home, Login, Register, ForgotPassword,
│   │                              ResetPassword, Dashboard (all built)
│   ├── context/AuthContext.jsx ← built
│   ├── hooks/                  ← useAbacusState, useBeadSound (built)
│   ├── utils/abacusEngine.js   ← bead math (built)
│   ├── data/branding.js        ← built
│   └── services/apiClient.js   ← built
├── functions/api/auth/         ← register, login, logout, me,
│                                  forgot-password, reset-password (built)
│   └── _lib/                   ← crypto, cookies, email, respond (built)
├── migrations/0001_initial_schema.sql  ← built
├── schema.sql                  ← full D1 schema — users/students/
│                                  password_resets are live; the rest
│                                  (classes, curriculum, progress,
│                                  challenges, achievements) awaits
│                                  Phase 3/5/6
└── wrangler.toml                ← D1 binding active, needs database_id
```

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
```

## Deploying (Phase 1, 2 & 4 — this delivery)

Unlike the first drop, this one needs a real D1 database and two
secrets, since accounts and sessions are real now.

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "ACAD Abacus: Phase 1, 2 & 4 — abacus + auth"
   git branch -M main
   git remote add origin https://github.com/<your-org>/abacus-acad.git
   git push -u origin main
   ```

2. **Create the D1 database**
   ```bash
   wrangler d1 create acad-abacus
   ```
   Copy the `database_id` it prints, then uncomment and fill in the
   `[[d1_databases]]` block in `wrangler.toml`.

3. **Apply the schema**
   ```bash
   wrangler d1 execute acad-abacus --remote --file=./schema.sql
   ```

4. **Create the Cloudflare Pages project**
   - Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git
   - Select the `abacus-acad` repo
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Deploy once, then go to the project's **Settings**

5. **Bind D1 to the Pages project**
   - Settings → Functions → D1 database bindings → Add binding
   - Variable name: `DB`, Database: `acad-abacus`
   - This has to be added in the dashboard (or via `wrangler pages deploy`
     flags) — the `wrangler.toml` binding only covers local dev

6. **Add secrets** (Settings → Environment variables → add as *Secret*,
   for both Production and Preview)
   | Name | Value |
   |---|---|
   | `SESSION_SECRET` | any long random string, e.g. `openssl rand -hex 32` |
   | `RESEND_API_KEY` | from your Resend dashboard |
   | `RESEND_FROM_EMAIL` | a verified sender, e.g. `ACAD Abacus <noreply@acadapp.in>` |

   You'll need to verify `acadapp.in` (or a subdomain) in Resend before
   using it as the `from` address — until then, Resend's own
   `onboarding@resend.dev` sender works for testing.

7. **Redeploy** so the new bindings/secrets take effect, then add the
   custom domain: Custom domains → Add `abacus.acadapp.in`.

### Testing locally with D1 + Functions

`npm run dev` (plain Vite) does **not** run the `/functions` API or D1 —
it's frontend-only. To test auth locally:

```bash
npm run build
wrangler d1 execute acad-abacus --local --file=./schema.sql
wrangler pages dev dist --d1=DB=acad-abacus --binding SESSION_SECRET=dev-secret
```

Register a test account, then check it landed in the local D1:

```bash
wrangler d1 execute acad-abacus --local --command="SELECT id, email, name FROM users"
```
