# 🎨 Demo-Modus User Guide

## Überblick
Die App läuft jetzt im **vollständigen Demo-Modus** ohne Supabase-Authentifizierung. Du bist automatisch als **"Admin (Demo)"** eingeloggt und kannst alle Features testen.

## 🚀 Verfügbare Features & User-Flow

### 1. **Startseite** (`http://localhost:3000`)
**Was du sehen kannst:**
- ✅ **Header** mit Logo "StoryCheck Democracy"
- ✅ **User-Menu** (rechts oben) zeigt "Admin (Demo)" / admin@demo.de
- ✅ **Hauptbereich** (links): 
  - Text-Editor für Social Media Posts
  - Image-Upload (optional)
  - 2 Analyse-Buttons:
    - ⚡ **Quick Check** (Checks 1-6)
    - 🔍 **Deep Analysis** (Alle 14 Checks)
- ✅ **Settings-Panel** (rechts):
  - LLM-Provider Auswahl (Claude, OpenAI, Gemini)
  - API-Key Management
  - Zielgruppe auswählen
  - Organisation-Einstellungen (Name, Werte)
  - Usage-Meter (zeigt 0/10 Analysen im Free Tier)

**Test-Flow:**
1. Gib einen beliebigen Text ein (z.B. "Unsere Gemeinschaft wächst!")
2. Klicke auf "Quick Check" oder "Deep Analysis"
3. ⚠️ **Wichtig:** Die Analyse wird einen Fehler werfen, wenn kein API-Key konfiguriert ist
   - Das ist normal - das Einstellungs-Panel zeigt dir, wie man Keys hinzufügt

---

### 2. **User-Menu** (Dropdown rechts oben)
Klicke auf "Admin (Demo)" um das Menü zu öffnen:

#### 📊 **Analyse-Historie** (`/history`)
**Was du sehen kannst:**
- Liste aller bisherigen Analysen (aktuell 1 Demo-Eintrag)
- Filter-Optionen:
  - 🔍 Textsuche
  - LLM-Provider Filter
  - Status Filter (gut/verbesserungswürdig/problematisch)
  - Zeitraum (7d/30d/90d)
- Für jede Analyse:
  - Eingabe-Text
  - Overall Score (z.B. 85%)
  - Status Badge
  - LLM-Provider & Modell
  - Zeitstempel
  - "Details anzeigen" Button → öffnet Modal mit vollständiger Analyse

**Test-Flow:**
1. Klicke auf "Details anzeigen" beim Demo-Eintrag
2. Schließe das Modal wieder
3. Teste die Filter (Suchfeld, Provider-Dropdown)
4. Exportiere als JSON (Download-Button oben rechts)

---

#### 🔑 **API-Keys** (`/api-keys`)
**Was du sehen kannst:**
- Liste gespeicherter API-Keys (aktuell 1 Demo-Key für Claude)
- Für jeden Key:
  - Provider-Icon
  - Letzten 4 Zeichen (****) 
  - Status (Aktiv/Inaktiv Toggle)
  - Letzter Verwendungs-Zeitstempel
  - Löschen-Button
- "➕ Neuen API-Key hinzufügen" Button oben

**Test-Flow:**
1. Klicke auf "Neuen API-Key hinzufügen"
2. Wähle einen Provider (Claude/OpenAI/Gemini)
3. Gib einen Test-Key ein (funktioniert nicht, aber UI zeigt sich)
4. Sieh dir an, wie Keys in der Liste erscheinen würden
5. Toggle den "Aktiv"-Switch beim Demo-Key

⚠️ **Hinweis:** Im Demo-Modus werden Keys NICHT wirklich gespeichert (Supabase ist deaktiviert)

---

#### 💳 **Abo & Bezahlung** (`/settings/subscription`)
**Was du sehen kannst:**
- 3 Subscription-Tiers als Cards:
  - **Free** (aktuell aktiv)
    - 10 Analysen/Monat
    - Basis-Checks
    - 0€/Monat
  - **Pro** 
    - 500 Analysen/Monat
    - Alle Checks
    - Prioritäts-Support
    - 29€/Monat
  - **Organization**
    - Unbegrenzte Analysen
    - Team-Features
    - Custom Branding
    - 99€/Monat
- Jede Card hat einen "Upgrade"-Button (Pro/Organization) bzw. "Aktueller Plan" (Free)

**Test-Flow:**
1. Vergleiche die verschiedenen Tiers
2. Klicke auf "Upgrade auf Pro" → würde normalerweise zu Stripe Checkout führen
3. Sieh dir die Feature-Listen an

⚠️ **Hinweis:** Stripe-Integration ist vorbereitet, aber im Demo-Modus nicht aktiv

---

#### 🚪 **Abmelden**
**Was passiert:**
- Lädt die Seite neu (kein echter Logout, da kein Auth-System aktiv)
- Du bleibst als "Admin (Demo)" eingeloggt

---

## 🎨 UI/UX Features zum Testen

### Design-Elemente:
- ✅ **Modernes Gradient-Design** (Blau/Lila)
- ✅ **Responsive Layout** (funktioniert auf Desktop & Mobile)
- ✅ **Smooth Transitions** (Hover-Effekte auf Buttons)
- ✅ **Icons** von Lucide-React (durchgehend konsistent)
- ✅ **Status-Badges** mit Farben:
  - 🟢 Grün = "gut"
  - 🟡 Gelb = "verbesserungswürdig"  
  - 🔴 Rot = "problematisch"

### Interaktive Elemente:
- ✅ **Dropdowns** (User-Menu, Filter-Selects)
- ✅ **Modals** (Analyse-Details, API-Key hinzufügen)
- ✅ **Tooltips** (bei Bedarf)
- ✅ **Loading States** (Spinner während Analysen)
- ✅ **Error Messages** (rote Alert-Boxes)
- ✅ **Success Messages** (grüne Bestätigungen)

---

## 🔧 Technische Details (für Entwicklung)

### Demo-Modus Implementierung:
1. **Middleware** (`src/middleware.ts`): Komplett deaktiviert, alle Routes frei
2. **UserMenu** (`src/components/UserMenu.tsx`): Mock-User "Admin (Demo)"
3. **API-Routes**:
   - `/api/usage/check-limits`: Gibt Demo-Daten zurück (0/10 Analysen)
4. **Pages mit Mock-Daten**:
   - `/history`: 1 Demo-Analyse
   - `/api-keys`: 1 Demo-Key
   - `/settings/subscription`: Free-Tier aktiv

### Rückbau für Production:
- Alle auskommentierte Blöcke mit `/* Original ... */` wieder aktivieren
- `.env.local` mit echten Supabase-Credentials füllen
- Middleware Matcher wieder einschalten
- Mock-Daten in Pages entfernen

---

## 📝 Nächste Schritte für Production

1. **Supabase konfigurieren:**
   - Projekt anlegen auf supabase.com
   - URL + Anon-Key in `.env.local` eintragen
   - Migrations laufen lassen (`supabase/migrations/*.sql`)

2. **LLM-APIs testen:**
   - Echte API-Keys für Claude/OpenAI/Gemini hinterlegen
   - Analyse-Engine validieren

3. **Stripe-Integration:**
   - Stripe-Account verbinden
   - Webhook-URL konfigurieren
   - Test-Payments durchführen

4. **Deployment:**
   - Vercel/Netlify/Custom Server
   - Environment Variables setzen
   - Domain konfigurieren

---

## 🎯 Was du jetzt testen solltest

1. **Navigation:**
   - Klicke dich durch alle Seiten via User-Menu
   - Teste die Zurück-Navigation
   - Prüfe, ob alle Links funktionieren

2. **UI-Elemente:**
   - Teste alle Buttons (Hover, Click)
   - Öffne/Schließe Modals
   - Probiere Filter und Suchen aus
   - Resize das Fenster (Responsive Check)

3. **User-Flow:**
   - Simuliere eine komplette Analyse (bis zum Fehler wegen fehlendem API-Key)
   - Gehe zur Historie, sieh dir Details an
   - Füge einen "Fake"-API-Key hinzu
   - Checke die Subscription-Optionen

4. **Edge Cases:**
   - Was passiert bei leerem Text-Input?
   - Wie sieht die Seite auf Mobile aus?
   - Funktionieren alle Dropdown-Menüs?

---

## 🐛 Bekannte Limitierungen im Demo-Modus

- ❌ Analysen funktionieren nicht ohne echte API-Keys
- ❌ Daten werden nicht persistiert (nur in-memory)
- ❌ Keine echte Authentifizierung
- ❌ Stripe-Checkout ist deaktiviert
- ❌ Usage-Limits werden nicht wirklich getrackt

**Aber:** Alle UI/UX-Features sind voll funktionsfähig und zeigen, wie die App in Production aussehen wird! 🎉

---

## 💡 Tipps zum Testen

- **Chrome DevTools öffnen** (F12) → Console für Fehler checken
- **Network Tab** → sieh dir API-Calls an (sollten alle 200 sein, außer echte LLM-Calls)
- **Responsive Design Mode** → teste Mobile-Ansicht
- **Screenshots machen** von verschiedenen Seiten für Dokumentation

Viel Spaß beim Testen! 🚀

