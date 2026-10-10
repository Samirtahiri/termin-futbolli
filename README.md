# Termin

App për termined e futbollit: **5+1** dhe **10+1**, In me link, FIFO, ekipet, formacioni, vlerësim peer.

## Lokal

```bash
cd termin-futbolli
npm install
npm run dev
```

Hap [http://localhost:3000](http://localhost:3000).

1. **Hyr** si organizator (në këtë telefon).
2. **Krijo** termin bosh.
3. **Kopjo / Viber** — ata bëjnë In.
4. **Ekipet** — sipas rating, random, përziej, manual, kapitënë.

Pa Supabase, lista rri në `localStorage` të këtij telefoni.

## Supabase (fullstack, falas)

1. Krijo projekt te [supabase.com](https://supabase.com) (Free).
2. **SQL Editor** → ngjit krejt [`supabase/schema.sql`](supabase/schema.sql) → Run.
3. **Authentication → Providers → Email** = ON (magic link).
4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect: `http://localhost:3000/**` (dhe më vonë `https://projekti.vercel.app/**`)
5. **Project Settings → API**: kopjo Project URL dhe `anon` `public` key.
6. Krijo `.env.local` në root:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

7. Ndalo dhe nise prapë `npm run dev`. Header duhet të tregojë **Online**.
8. Test: krijo termin në Chrome → hap linkun në telefon / Incognito → In. Duhet të shfaqet te lista.

Deploy: Vercel + të njëjtat env + shto URL-në e Vercel te Supabase redirect.
