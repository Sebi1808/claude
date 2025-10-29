# StoryCheck Democracy

Eine webbasierte Analyse-App für Social Media Redakteure und Community Manager zur Prüfung von Posts auf **demokratisches Storytelling**, basierend auf den 14 Praxistipps von Sebastian Zollner.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## 🎯 Projektziel

**StoryCheck Democracy** hilft Ihnen dabei, Social Media Posts zu erstellen, die:
- ✅ Demokratische Werte widerspiegeln
- ✅ Inklusiv und vielfältig sind
- ✅ Handlungsfähigkeit statt Hilfsbedürftigkeit zeigen
- ✅ Marginalisierte Gruppen sichtbar machen
- ✅ Stereotype vermeiden
- ✅ Authentische Geschichten erzählen

---

## ✨ Hauptfunktionen

### 🔍 14 Analyse-Checks

Die App prüft Ihre Posts anhand von 14 wissenschaftlich fundierten Kriterien:

#### **Basis-Checks (Quick Mode)**
1. **Wertekongruenz** - Passt die Sprache zu den Werten Ihrer Organisation?
2. **Zielgruppenpassung** - Ist die Sprache für Ihre Zielgruppe geeignet?
3. **Geschichten-Qualität** - Enthält der Post eine authentische Geschichte?
4. **Narrative Struktur (ATE)** - Folgt der Post dem ATE-Schema (Ausgangszustand → Transformation → Endzustand)?
5. **Botschaft-Klarheit** - Ist die Kern-Botschaft klar erkennbar?
6. **Akteur-Analyse** - Wer kommt vor und in welcher Rolle?

#### **Erweiterte Checks (Deep Mode)**
7. **Marginalisierte Gruppen** - Kommen unterrepräsentierte Gruppen vor?
8. **Diversitäts-Check** - Ist Vielfalt abgebildet?
9. **Komplexität der Menschen** - Werden Menschen als Individuen dargestellt?
10. **Handlungs-Balance** - Wer handelt aktiv, wer passiv?
11. **Normen und Werte** - Was wird als "normal" gesetzt?
12. **Inklusiver Sprachgebrauch** - Diskriminierungsfreie Sprache?
13. **Kontroversen-Umgang** - Umgang mit kontroversen Themen
14. **Partizipations-Möglichkeiten** - Lädt der Post zur Beteiligung ein?

### 🤖 Multi-LLM-Support

Nutzen Sie verschiedene KI-Modelle für die Analyse:

- **Anthropic Claude** (empfohlen)
  - Claude 3.5 Sonnet (beste Balance)
  - Claude 3.5 Haiku (schnell & günstig)
  - Claude 3 Opus 4 (präziseste Analyse)

- **OpenAI**
  - GPT-4o
  - GPT-4o Mini
  - GPT-4 Turbo

- **Google Gemini**
  - Gemini 1.5 Pro
  - Gemini 1.5 Flash
  - Gemini 2.0 Flash (experimental)

### 🎨 Benutzerfreundliches Interface

- **Text-Editor** mit Live-Zeichenzähler für verschiedene Plattformen
- **Bild-Upload** mit Drag & Drop
- **Settings-Panel** für Zielgruppe, Organisation und LLM-Auswahl
- **Detaillierte Ergebnisse** mit Scores, Problemen und konkreten Verbesserungsvorschlägen
- **Responsive Design** für Desktop, Tablet und Mobile

### 🔒 Datenschutz-First

- ✅ Alle Daten bleiben lokal im Browser
- ✅ Keine Server-seitige Speicherung
- ✅ API-Keys nur lokal gespeichert
- ✅ Direkte API-Calls zu LLM-Providern

---

## 🚀 Installation & Verwendung

### Voraussetzungen

- Node.js 18+
- npm oder yarn
- API-Key von Claude, OpenAI oder Gemini

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd claude

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App ist dann verfügbar unter: `http://localhost:3000`

### API-Keys erhalten

Sie benötigen einen API-Key von einem der folgenden Anbieter:

1. **Anthropic Claude**: [console.anthropic.com](https://console.anthropic.com/)
2. **OpenAI**: [platform.openai.com](https://platform.openai.com/)
3. **Google Gemini**: [ai.google.dev](https://ai.google.dev/)

### Erste Schritte

1. **API-Key einrichten**
   - Öffnen Sie das Settings-Panel (rechts)
   - Wählen Sie Ihren Provider (Claude, OpenAI oder Gemini)
   - Geben Sie Ihren API-Key ein
   - Klicken Sie auf "API-Key speichern & testen"

2. **Einstellungen konfigurieren**
   - Wählen Sie Ihre Zielgruppe (z.B. "Spender*innen", "Community")
   - Optional: Geben Sie Ihren Organisationsnamen und Werte ein

3. **Post analysieren**
   - Geben Sie Ihren Social Media Text ein
   - Optional: Laden Sie ein Bild hoch
   - Wählen Sie "Quick Check" (6 Checks) oder "Deep Analysis" (14 Checks)
   - Erhalten Sie detailliertes Feedback mit Verbesserungsvorschlägen

---

## 🏗️ Technologie-Stack

- **Framework**: Next.js 14 (App Router)
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

---

## 📁 Projektstruktur

```
claude/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root Layout
│   │   ├── page.tsx           # Hauptseite
│   │   └── globals.css        # Globale Styles
│   ├── components/            # React Komponenten
│   │   ├── TextEditor.tsx     # Text-Editor mit Zeichenzähler
│   │   ├── ImageUpload.tsx    # Bild-Upload mit Drag & Drop
│   │   ├── SettingsPanel.tsx  # Einstellungen-Sidebar
│   │   ├── AnalysisDashboard.tsx # Ergebnis-Dashboard
│   │   └── WelcomeModal.tsx   # Welcome-Modal
│   ├── lib/                   # Core Logic
│   │   ├── llmProvider.ts     # LLM API Integration
│   │   └── analysisEngine.ts  # Analyse-Engine mit 14 Checks
│   ├── store/                 # Zustand State Management
│   │   └── settingsStore.ts   # Settings Store
│   └── types/                 # TypeScript Typen
│       └── storycheck.ts      # Alle Type-Definitionen
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 🎯 Verwendungsbeispiele

### Beispiel-Analyse: Spenden-Post

**Vorher:**
```
Wir helfen armen Kindern in Afrika. Diese bedürftigen Menschen brauchen unsere Unterstützung.
```

**StoryCheck-Ergebnis:**
- ❌ Akteur-Analyse: Kinder nur passiv dargestellt
- ❌ Komplexität: Menschen auf ein Merkmal reduziert
- ❌ Stereotype: "arme Kinder in Afrika"

**Verbesserter Post:**
```
Aminata aus Senegal hat ihre eigene Schulbibliothek aufgebaut. Mit lokalen Freiwilligen sammelte
sie Bücher und schuf einen Lernort für 200 Kinder. Ihre Initiative zeigt: Bildung entsteht durch
lokales Engagement. Unterstützen Sie solche Projekte!
```

**Neues Ergebnis:**
- ✅ Akteur-Analyse: Person mit Name, aktiv handelnd
- ✅ Komplexität: Individuum mit eigener Geschichte
- ✅ ATE-Struktur: Problem → Aktion → Ergebnis

---

## 🔄 Weiterentwicklung

### Geplante Features

- [ ] **Checks 7-14 vollständig implementieren** (derzeit Stubs)
- [ ] **Vision-LLM für Bildanalyse**
  - Diversitäts-Check für Bilder
  - Stereotype-Erkennung in Fotos
  - Alt-Text-Generierung
- [ ] **Export-Funktionen**
  - PDF-Reports
  - Vergleich Vorher/Nachher
- [ ] **Analyse-Historie**
  - Speicherung vergangener Analysen
  - Fortschritt über Zeit
- [ ] **Team-Features**
  - Geteilte Analyse-Profile
  - Kommentar-Funktion

### Mitmachen

Contributions sind willkommen! Besonders interessant:
- Implementierung der Checks 7-14
- Vision-LLM für Bildanalyse
- Weitere LLM-Provider
- Mehrsprachigkeit

---

## 📚 Wissenschaftliche Grundlage

Diese App basiert auf:

**"Storytelling mit Haltung: Linguistische Anregungen für bestärkende Narrative"**

**Von:** Sebastian Zollner
**Funktion:** Sprachwissenschaftler & Dozent für Medien und Kommunikation

Die 14 Checks sind wissenschaftlich fundiert und kombinieren:
- Narrative Theorie
- Linguistische Analyse
- Diversitäts- und Inklusionsforschung
- Medienpsychologie

---

## ⚙️ Konfiguration

### Umgebungsvariablen

Die App benötigt **keine** Umgebungsvariablen, da alle API-Keys lokal im Browser gespeichert werden.

### localStorage

Die App speichert folgende Daten im Browser:

```javascript
{
  "storycheck-settings": {
    "apiKeys": { ... },           // Verschlüsselte API-Keys
    "selectedProvider": "claude",
    "selectedModel": "claude-3-5-sonnet-20241022",
    "targetAudience": "oeffentlichkeit",
    "organizationSettings": { ... }
  }
}
```

---

## 🐛 Bekannte Einschränkungen

- **Checks 7-14** sind derzeit als Stubs implementiert (Checks 1-6 sind voll funktionsfähig)
- **Bildanalyse** benötigt Vision-LLM-Integration (geplant)
- **Rate Limits** der LLM-Provider beachten
- **Kosten** fallen bei den LLM-Providern an (je nach Nutzung)

---

## 📄 Lizenz

MIT License - siehe LICENSE-Datei

---

## 🙏 Credits

- **Konzept & Checks**: Sebastian Zollner
- **Entwicklung**: Claude Code
- **Icons**: Lucide React
- **Framework**: Next.js Team
- **LLM-Provider**: Anthropic, OpenAI, Google

---

## 📞 Support

Bei Fragen oder Problemen:
- Öffnen Sie ein Issue im Repository
- Kontaktieren Sie Sebastian Zollner für inhaltliche Fragen zu den Checks

---

## 🎓 Verwendung in der Praxis

Diese App ist ideal für:
- **NGOs & Non-Profits** - Für wertebasierte Kommunikation
- **Social Media Manager** - Für inklusive Posts
- **PR-Abteilungen** - Für demokratische Unternehmenskommunikation
- **Redaktionen** - Für ausgewogene Berichterstattung
- **Bildungseinrichtungen** - Zum Lernen von gutem Storytelling

---

## 🌟 Warum StoryCheck Democracy?

> "Sprache schafft Wirklichkeit. Mit demokratischem Storytelling geben wir allen eine Stimme
> und zeigen Menschen als handelnde Individuen, nicht als hilfsbedürftige Objekte."
>
> – Sebastian Zollner

Diese App hilft dabei, diese Prinzipien in der täglichen Social Media Arbeit umzusetzen.

---

**Made with ❤️ for democratic storytelling**
