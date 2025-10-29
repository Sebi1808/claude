# 🔑 API-Key Testing Guide

## Änderungen für echte API-Keys

Ich habe die App so angepasst, dass du **echte API-Keys testen und verwenden** kannst, ohne dass Supabase dazwischenfunkt!

---

## ✅ Was funktioniert jetzt:

### 1. **API-Keys im SettingsPanel (Rechte Spalte)**
- **Lokale Speicherung**: Keys werden nur in deinem Browser (localStorage) gespeichert
- **Server-seitiges Testing**: Keys werden über `/api/test-api-key` getestet (umgeht CORS)
- **Keine Datenbank**: Keine Speicherung in Supabase nötig

### 2. **Unterstützte Provider:**
- ✅ **Claude** (Anthropic)
- ✅ **OpenAI** (GPT-4o, GPT-5)
- ✅ **Gemini** (Google)

---

## 🚀 So testest du einen API-Key:

### Schritt 1: Öffne die App
```
http://localhost:3000
```

### Schritt 2: Rechtes Panel → LLM-Provider
1. Wähle einen Provider aus (z.B. "Claude")
2. Das Eingabefeld für den API-Key erscheint

### Schritt 3: Key eingeben
- Füge deinen echten API-Key ein
- Klicke auf "Testen & Speichern"

### Schritt 4: Warten auf Validierung
Die App ruft `/api/test-api-key` auf, welche:
- **Claude**: POST zu `https://api.anthropic.com/v1/messages`
- **OpenAI**: GET zu `https://api.openai.com/v1/models`
- **Gemini**: GET zu `https://generativelanguage.googleapis.com/v1beta/models`

### Schritt 5: Ergebnis
- ✅ **Erfolg**: "API-Key gespeichert und getestet ✓" (grünes Häkchen)
- ❌ **Fehler**: Fehlermeldung wird angezeigt (z.B. "Invalid API key")

---

## 🔒 Sicherheit

### Wo wird der Key gespeichert?
- **Nur im Browser**: localStorage (client-side)
- **Keine Server-Speicherung**: Keys werden NICHT in Supabase oder auf dem Server gespeichert
- **Kein Logging**: Keys werden nicht geloggt

### Wird der Key irgendwo gesendet?
- **Nur zum Testing**: Beim Klick auf "Testen & Speichern" wird der Key einmal an `/api/test-api-key` gesendet
- **Von dort zu LLM-APIs**: Die Route testet den Key direkt bei Claude/OpenAI/Gemini
- **Bei Analysen**: Der Key wird aus localStorage gelesen und an die Analyse-Engine gesendet

---

## 📝 API-Key besorgen

### Claude (Anthropic)
1. Gehe zu: https://console.anthropic.com/
2. Account erstellen/einloggen
3. "API Keys" → "Create Key"
4. Key kopieren (Format: `sk-ant-...`)

### OpenAI
1. Gehe zu: https://platform.openai.com/api-keys
2. Account erstellen/einloggen
3. "Create new secret key"
4. Key kopieren (Format: `sk-...`)

### Gemini (Google)
1. Gehe zu: https://makersuite.google.com/app/apikey
2. Google-Account nutzen
3. "Get API Key" → "Create API key in new project"
4. Key kopieren

---

## 🧪 Test-Beispiel

### Erfolgreicher Claude-Test:
```
Provider: Claude
Model: claude-sonnet-4-5
Key: sk-ant-api03-abc123...xyz789

→ Testet mit minimaler Anfrage: "Hi" (10 tokens)
→ Antwort von Claude API: HTTP 200
→ Ergebnis: ✓ Valid
→ Key wird in localStorage gespeichert
```

### Fehlgeschlagener Test:
```
Provider: OpenAI
Key: sk-invalid-key-123

→ Testet GET /v1/models
→ Antwort: HTTP 401 Unauthorized
→ Ergebnis: ✗ Invalid API key
→ Key wird NICHT gespeichert
```

---

## 🔧 Troubleshooting

### Problem: "Netzwerkfehler"
**Ursache**: Server kann LLM-API nicht erreichen
**Lösung**: 
- Prüfe Internetverbindung
- Stelle sicher, dass der Dev-Server läuft
- Checke Firewall-Einstellungen

### Problem: "Invalid API key"
**Ursache**: Key ist ungültig oder abgelaufen
**Lösung**:
- Prüfe, ob Key richtig kopiert wurde (keine Leerzeichen)
- Generiere einen neuen Key im Provider-Dashboard
- Prüfe, ob Account aktiv ist

### Problem: "Rate limit exceeded"
**Ursache**: Zu viele Requests in kurzer Zeit
**Lösung**:
- Warte 1-2 Minuten
- Verwende einen anderen Key
- Checke Provider-Dashboard für Limits

### Problem: Key wird nicht gespeichert
**Ursache**: localStorage ist deaktiviert
**Lösung**:
- Aktiviere localStorage im Browser
- Prüfe Browser-Einstellungen (Privacy/Cookies)
- Nutze Inkognito-Modus NICHT (löscht localStorage beim Schließen)

---

## 🎯 Nächste Schritte nach erfolgreichem Key-Test

### 1. Echte Analyse durchführen:
1. Gib einen Text in das Hauptfeld ein
2. Wähle "Quick Check" oder "Deep Analysis"
3. Die App nutzt deinen gespeicherten Key
4. Ergebnisse werden angezeigt

### 2. Verschiedene Provider testen:
- Füge Keys für Claude, OpenAI und Gemini hinzu
- Vergleiche Ergebnisse zwischen Providern
- Nutze unterschiedliche Modelle

### 3. Organisation-Settings anpassen:
- Name: "Meine Organisation"
- Werte: "Nähe, Solidarität, Vielfalt"
- Diese werden in Analysen berücksichtigt

---

## 🚨 Wichtig für Production

Wenn du später in Production gehst:
1. **Kommentierte Blöcke reaktivieren**: Alle `/* Original ... */` Blöcke
2. **Supabase konfigurieren**: Echte URL + Keys in `.env.local`
3. **Encryption aktivieren**: Keys verschlüsselt in DB speichern
4. **Middleware aktivieren**: Auth-Checks wieder einschalten

Aktuell ist **alles im Demo-Modus** für schnelles Testing! 🎨

---

## ✨ Viel Erfolg beim Testen!

Wenn alles funktioniert, solltest du:
- ✅ Keys speichern können
- ✅ Erfolgreiche Test-Validierung sehen
- ✅ Analysen mit echten LLMs durchführen können

Bei Problemen: Checke die Browser-Console (F12) für detaillierte Fehler!

