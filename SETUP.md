# StoryCheck Democracy - Setup Guide

## 📋 Voraussetzungen

- Node.js 18+ installiert
- Ein Supabase-Account (kostenlos)
- Ein Stripe-Account (Test-Mode)
- Git installiert

---

## 🚀 Schritt-für-Schritt-Installation

### 1. Repository klonen

```bash
git clone <repository-url>
cd claude
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Supabase-Projekt erstellen

#### Option A: Via Supabase Dashboard (Empfohlen für Anfänger)

1. Gehe zu [https://app.supabase.com](https://app.supabase.com)
2. Klicke auf "New Project"
3. Wähle einen Namen und Region
4. Warte bis das Projekt erstellt ist (~2 Minuten)

#### Option B: Via Supabase CLI

```bash
# CLI installieren
npm install -g supabase

# Login
supabase login

# Neues Projekt erstellen
supabase projects create storycheck-democracy
```

### 4. Datenbank-Migrations anwenden

#### Via Supabase Dashboard:

1. Öffne dein Projekt im Dashboard
2. Gehe zu "SQL Editor"
3. Kopiere den Inhalt von `supabase/migrations/001_initial_schema.sql`
4. Füge ihn ein und klicke "Run"
5. Wiederhole mit `002_rls_policies.sql`

#### Via Supabase CLI:

```bash
# Link zu deinem Projekt
supabase link --project-ref your-project-ref

# Migrations anwenden
supabase db push
```

### 5. API-Keys holen

#### Supabase:

1. Gehe zu [Project Settings > API](https://app.supabase.com/project/_/settings/api)
2. Kopiere:
   - **Project URL** (z.B. `https://xxx.supabase.co`)
   - **anon public** Key
   - **service_role** Key (NUR für Server!)

#### Stripe:

1. Gehe zu [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Kopiere:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

### 6. Environment Variables setzen

```bash
# Kopiere .env.example
cp .env.example .env.local

# Öffne .env.local und fülle die Werte ein
nano .env.local
```

**Wichtig:** Generiere einen Encryption Key:

```bash
openssl rand -hex 32
```

Füge diesen als `API_KEYS_ENCRYPTION_KEY` ein.

### 7. Stripe Produkte erstellen

1. Gehe zu [Stripe Products](https://dashboard.stripe.com/test/products)
2. Erstelle folgende Produkte:

**Starter:**
- Name: "StoryCheck Starter - Monthly"
- Price: 19,00 EUR / Monat
- Kopiere die Price ID → `price_starter_monthly`

**Starter Yearly:**
- Name: "StoryCheck Starter - Yearly"
- Price: 190,00 EUR / Jahr
- Kopiere die Price ID → `price_starter_yearly`

**Professional:**
- Name: "StoryCheck Professional - Monthly"
- Price: 49,00 EUR / Monat
- Kopiere die Price ID → `price_professional_monthly`

**Professional Yearly:**
- Name: "StoryCheck Professional - Yearly"
- Price: 490,00 EUR / Jahr
- Kopiere die Price ID → `price_professional_yearly`

**Enterprise:**
- Name: "StoryCheck Enterprise"
- Price: 199,00 EUR / Monat
- Kopiere die Price ID → `price_enterprise_monthly`

3. Aktualisiere die Price IDs in `src/types/subscription.ts`

### 8. Stripe Webhooks einrichten

#### Für Local Development:

```bash
# Installiere Stripe CLI
# macOS:
brew install stripe/stripe-cli/stripe

# Windows/Linux:
# Download von: https://github.com/stripe/stripe-cli/releases

# Login
stripe login

# Webhook forwarding starten
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Kopiere den Webhook-Secret (whsec_...) in .env.local
```

#### Für Production:

1. Gehe zu [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Klicke "Add endpoint"
3. URL: `https://your-domain.com/api/webhooks/stripe`
4. Events auswählen:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.paid`
5. Kopiere den Webhook-Secret

### 9. Development Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

---

## 🔧 Fehlerbehebung

### "Supabase connection failed"

- Überprüfe ob `NEXT_PUBLIC_SUPABASE_URL` korrekt ist
- Überprüfe ob `NEXT_PUBLIC_SUPABASE_ANON_KEY` korrekt ist
- Stelle sicher, dass das Supabase-Projekt läuft

### "API Keys Encryption failed"

- Stelle sicher, dass `API_KEYS_ENCRYPTION_KEY` 32 Bytes (64 Hex-Zeichen) lang ist
- Generiere einen neuen Key mit `openssl rand -hex 32`

### "Stripe webhook signature verification failed"

- Stelle sicher, dass `stripe listen` läuft
- Überprüfe ob `STRIPE_WEBHOOK_SECRET` korrekt kopiert wurde
- Für Production: Überprüfe die Webhook-URL in Stripe Dashboard

### "Database migration failed"

- Überprüfe die SQL-Syntax in den Migration-Dateien
- Stelle sicher, dass Extensions (uuid-ossp, pgcrypto) aktiviert sind
- Bei Fehlern: Lösche die Tabellen und führe Migrations erneut aus

---

## 📚 Nächste Schritte

1. **Erstelle einen Test-User:**
   - Registriere dich über die App
   - Verifiziere deine Email (Check Supabase Auth Dashboard)

2. **Füge deine API-Keys hinzu:**
   - Gehe zu Settings > API Keys
   - Füge deinen Claude/OpenAI/Gemini Key hinzu

3. **Teste eine Analyse:**
   - Erstelle einen Test-Post
   - Starte eine Analyse
   - Überprüfe die Ergebnisse

4. **Teste Stripe (Test-Mode):**
   - Upgrade auf Starter
   - Verwende Test-Kreditkarte: `4242 4242 4242 4242`
   - Überprüfe Subscription in Stripe Dashboard

---

## 🔐 Sicherheits-Hinweise

- **NIEMALS** commit `.env.local` zu Git!
- **NIEMALS** teile deinen `SUPABASE_SERVICE_ROLE_KEY`
- **NIEMALS** teile deinen `STRIPE_SECRET_KEY`
- **NIEMALS** teile deinen `API_KEYS_ENCRYPTION_KEY`

Diese Keys ermöglichen vollständigen Zugriff auf deine Datenbank und Stripe-Account!

---

## 🎯 Production Deployment

### Vercel (Empfohlen):

```bash
# Vercel CLI installieren
npm i -g vercel

# Deployment
vercel

# Environment Variables setzen:
# Via Vercel Dashboard > Settings > Environment Variables
# Füge alle Variablen aus .env.local hinzu
```

### Andere Plattformen:

- Stelle sicher, dass alle Environment Variables gesetzt sind
- Node.js 18+ Runtime
- Build-Command: `npm run build`
- Start-Command: `npm start`

---

## 📞 Hilfe & Support

Bei Problemen:

1. Überprüfe die Console auf Fehler
2. Überprüfe Supabase Logs: Project > Logs
3. Überprüfe Stripe Logs: Dashboard > Developers > Logs
4. Erstelle ein Issue im Repository

---

## ✅ Checkliste

- [ ] Repository geklont
- [ ] Dependencies installiert (`npm install`)
- [ ] Supabase-Projekt erstellt
- [ ] Database-Migrations angewendet
- [ ] Supabase API-Keys kopiert
- [ ] Stripe-Account erstellt (Test-Mode)
- [ ] Stripe Produkte erstellt
- [ ] Stripe API-Keys kopiert
- [ ] Encryption-Key generiert
- [ ] .env.local erstellt und ausgefüllt
- [ ] Stripe Webhooks eingerichtet
- [ ] Development Server startet (`npm run dev`)
- [ ] Test-User registriert
- [ ] API-Key hinzugefügt
- [ ] Test-Analyse durchgeführt
- [ ] Stripe Test-Payment durchgeführt

**Glückwunsch! 🎉** StoryCheck Democracy läuft jetzt lokal!
