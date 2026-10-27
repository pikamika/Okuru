# Okuru

_Make thoughtfulness tangible._ A mobile-first notebook for the people you care about. You jot down what you notice, and it resurfaces when a relevant moment approaches.

This is the **front end only**. There is no back end, auth, payments, or AI. All data lives in `localStorage` behind a repository seam so Supabase can replace it later.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc -b (strict)
npm run lint       # eslint
npm run format     # prettier
npm run build
```

First run lands on a skippable onboarding screen and seeds a small sample notebook (Priya, Mum, Daniel, Hana). Dates are relative to today, so Home always has a moment to show. To reset, run `localStorage.removeItem('okuru.mock.v1')` in the console and reload.

## Structure

```
src/
  components/   shared UI: Button, Sheet, TagInput, Thread (the ribbon motif) ...
  features/     home, capture, people, profile, occasions, gift-project, onboarding
  data/         repositories/ (interfaces), mock/ (localStorage impl + seed), index.ts
  hooks/        TanStack Query hooks, the only thing components use to touch data
  lib/          dates, moments (resurfacing logic), cn
  routes/       router, app shell, onboarding gate
  styles/       tokens.css (every color, radius, shadow, font, motion value), global.css
  types/        domain types
```

Design tokens live in `src/styles/tokens.css`. Raw values are CSS variables on `:root`, and an `@theme inline` block exposes them to Tailwind. Dark mode later means overriding the raw variables under `[data-theme='dark']`, with no component changes.

## How the data layer works

```
component → hook (TanStack Query) → repositories (interface) → mock impl → localStorage
```

- Domain types are in `src/types/`. IDs are UUID strings, dates are ISO strings, and every entity has `createdAt` and `updatedAt`.
- Repository interfaces are in `src/data/repositories/index.ts`, all async.
- `src/data/index.ts` is the **only** place the implementation is chosen.
- Components never import from `data/` directly, only from `hooks/`.
- Resurfacing (`src/lib/moments.ts`) is a pure function over loaded data. It is client-side for now and can move server-side later without touching components.

## Plugging in Supabase

1. `npm i @supabase/supabase-js` and add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to `.env.local`.
2. Create tables matching `src/types/` (`people`, `thoughts`, `occasions`, `gift_ideas`, `gift_projects`, `checklist_items`, `milestone_suggestions`). Use `uuid` primary keys, `timestamptz` for `created_at`/`updated_at`, and `date` for occasion dates. Person tags can be a `jsonb` column. Add a `user_id` and row-level security on each table.
3. Add `src/data/supabase/repositories.ts` exporting `createSupabaseRepositories(): Repositories`, implementing every interface in `src/data/repositories/index.ts` (map snake_case columns to camelCase).
4. In `src/data/index.ts`, change one line:
   ```ts
   export const repositories: Repositories = createSupabaseRepositories()
   ```
5. Replace the `settings.getOnboarded/setOnboarded` repository with a profile column, and add auth screens plus a route guard.

No component or hook changes are needed.

## Deliberately not in V1

The Finishing Touch (wrapping tutorials), DIY templates, personalized recommendations, and an archive. Voice and share-sheet capture are visible, disabled placeholders in the capture sheet.
